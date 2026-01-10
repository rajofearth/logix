import type { NextRequest } from "next/server";

import { z } from "zod";

import { jsonError } from "@/app/api/_utils/json";
import { prisma } from "@/lib/prisma";

import { buildRestockPrompt, type RestockInventoryRow, type RestockScope } from "../_prompt";
import { sseEncode, streamLmstudioChatCompletions } from "../_lmstudioStream";
import { hasAverageWeeklySalesColumn } from "@/app/api/warehouse/_utils/productWeeklySales";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL_ID = "mygemma-inventorym";

const querySchema = z.object({
  scope: z.enum(["floor", "warehouse"]).optional(),
  floorId: z.string().uuid().optional(),
  category: z.string().trim().min(1).optional(), // frontend uses dashed categories (e.g. raw-materials)
  includePrompt: z.enum(["0", "1"]).optional(),
});

function dashToUnderscoreCategory(category: string): string {
  return category.replace(/-/g, "_");
}

type WarehouseGraph = {
  id: string;
  name: string;
  floors: Array<{
    id: string;
    name: string;
    level: number;
    blocks: Array<{
      id: string;
      name: string;
      category: string;
      products: Array<{
        id: string;
        sku: string;
        name: string;
        quantity: number;
        category: string;
        currentPrice: unknown;
        averageWeeklySales?: number | null;
      }>;
    }>;
  }>;
};

function decimalToNumber(val: unknown): number | undefined {
  if (val === null || val === undefined) return undefined;
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const n = Number(val);
    return Number.isFinite(n) ? n : undefined;
  }
  if (typeof val === "object") {
    if ("toNumber" in val && typeof (val as { toNumber: () => number }).toNumber === "function") {
      const n = (val as { toNumber: () => number }).toNumber();
      return Number.isFinite(n) ? n : undefined;
    }
    const n = Number(String(val));
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function aggregateRows(blocks: WarehouseGraph["floors"][number]["blocks"]): RestockInventoryRow[] {
  const bySku = new Map<
    string,
    {
      product: string;
      currentStock: number;
      category: string;
      currentPrice?: number;
      averageWeeklySales?: number | null;
    }
  >();

  for (const b of blocks) {
    for (const p of b.products) {
      const existing = bySku.get(p.sku);
      const price = decimalToNumber(p.currentPrice);
      if (!existing) {
        bySku.set(p.sku, {
          product: p.name,
          currentStock: p.quantity,
          category: p.category,
          averageWeeklySales: p.averageWeeklySales ?? null,
          ...(price != null ? { currentPrice: price } : {}),
        });
      } else {
        existing.currentStock += p.quantity;
        if (existing.currentPrice == null && price != null) existing.currentPrice = price;
        if (existing.averageWeeklySales == null && p.averageWeeklySales != null) {
          existing.averageWeeklySales = p.averageWeeklySales;
        }
      }
    }
  }

  return Array.from(bySku.values())
    .filter((r) => r.product.trim().length > 0)
    .sort((a, b) => a.currentStock - b.currentStock);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: warehouseId } = await params;
    if (!warehouseId) return jsonError("warehouseId is required", 400);

    const parsed = querySchema.safeParse({
      scope: req.nextUrl.searchParams.get("scope") ?? undefined,
      floorId: req.nextUrl.searchParams.get("floorId") ?? undefined,
      category: req.nextUrl.searchParams.get("category") ?? undefined,
      includePrompt: req.nextUrl.searchParams.get("includePrompt") ?? undefined,
    });
    if (!parsed.success) return jsonError("Invalid query params", 400);

    const scope: RestockScope = parsed.data.scope ?? "floor";
    const includePrompt = parsed.data.includePrompt === "1";
    const categoryFilter = parsed.data.category
      ? dashToUnderscoreCategory(parsed.data.category)
      : null;

    if (scope === "floor" && !parsed.data.floorId) {
      return jsonError("floorId is required when scope=floor", 400);
    }

    const hasWeekly = await hasAverageWeeklySalesColumn();

    const warehouse = (await prisma.warehouse.findUnique({
      where: { id: warehouseId },
      select: {
        id: true,
        name: true,
        floors: {
          orderBy: { level: "asc" },
          select: {
            id: true,
            name: true,
            level: true,
            blocks: {
              select: {
                id: true,
                name: true,
                category: true,
                products: {
                  select: {
                    id: true,
                    sku: true,
                    name: true,
                    quantity: true,
                    category: true,
                    currentPrice: true,
                    ...(hasWeekly ? { averageWeeklySales: true } : {}),
                  },
                },
              },
            },
          },
        },
      },
    })) as WarehouseGraph | null;

    if (!warehouse) return jsonError("Warehouse not found", 404);

    const selectedFloors =
      scope === "warehouse"
        ? warehouse.floors
        : warehouse.floors.filter((f) => f.id === parsed.data.floorId);
    if (scope === "floor" && selectedFloors.length === 0) {
      return jsonError("Floor not found", 404);
    }

    const floorName = scope === "floor" ? selectedFloors[0]?.name : undefined;

    const blocks = selectedFloors.flatMap((f) => f.blocks);
    const filteredBlocks = categoryFilter
      ? blocks.filter((b) => b.category === categoryFilter)
      : blocks;

    const rows = aggregateRows(filteredBlocks).slice(0, 100) as Array<
      RestockInventoryRow & { averageWeeklySales?: number | null }
    >;

    const sectionLabel = parsed.data.category
      ? parsed.data.category.replace(/-/g, " ")
      : undefined;
    const prompt = buildRestockPrompt({
      warehouseName: warehouse.name,
      scope,
      floorName,
      sectionLabel,
      rows: rows.map((r) => ({
        product: r.product,
        currentStock: r.currentStock,
        category: r.category,
        currentPrice: r.currentPrice,
        averageWeeklySales: r.averageWeeklySales ?? null,
      })),
    });

    const baseUrl = process.env.LMSTUDIO_BASE_URL ?? "http://10.19.85.63:1234";

    const encoder = new TextEncoder();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);

    const stream = new ReadableStream({
      async start(streamController) {
        try {
          streamController.enqueue(encoder.encode(sseEncode("connected", { ok: true })));
          if (includePrompt) {
            streamController.enqueue(encoder.encode(sseEncode("prompt", { prompt })));
          }

          for await (const chunk of streamLmstudioChatCompletions({
            baseUrl,
            model: MODEL_ID,
            temperature: 0.2,
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful inventory assistant. Follow the user's formatting rules exactly. Only reference products present in the inventory table. Do not add extra commentary.",
              },
              { role: "user", content: prompt },
            ],
            signal: controller.signal,
          })) {
            streamController.enqueue(encoder.encode(sseEncode("delta", { text: chunk })));
          }

          streamController.enqueue(encoder.encode(sseEncode("done", { ok: true })));
          streamController.close();
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Server error";
          streamController.enqueue(encoder.encode(sseEncode("server_error", { message: msg })));
          streamController.close();
        } finally {
          clearTimeout(timeout);
        }
      },
      cancel() {
        clearTimeout(timeout);
        controller.abort();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[API] restock-ai stream error:", e);
    return jsonError(msg, 500);
  }
}

