import type { NextRequest } from "next/server";

import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { prisma } from "@/lib/prisma";

import { buildRestockPrompt, type RestockInventoryRow } from "../[id]/restock-ai/_prompt";
import { lmstudioChatCompletions } from "../[id]/restock-ai/_lmstudioStream";
import { hasAverageWeeklySalesColumn } from "../_utils/productWeeklySales";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL_ID = "google/gemma-3n-e4b";

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

function aggregateRows(warehouses: WarehouseGraph[]): RestockInventoryRow[] {
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

  for (const warehouse of warehouses) {
    for (const floor of warehouse.floors) {
      for (const block of floor.blocks) {
        for (const product of block.products) {
          const existing = bySku.get(product.sku);
          const price = decimalToNumber(product.currentPrice);
          if (!existing) {
            bySku.set(product.sku, {
              product: product.name,
              currentStock: product.quantity,
              category: product.category,
              averageWeeklySales: product.averageWeeklySales ?? null,
              ...(price != null ? { currentPrice: price } : {}),
            });
          } else {
            existing.currentStock += product.quantity;
            if (existing.currentPrice == null && price != null) existing.currentPrice = price;
            if (existing.averageWeeklySales == null && product.averageWeeklySales != null) {
              existing.averageWeeklySales = product.averageWeeklySales;
            }
          }
        }
      }
    }
  }

  return Array.from(bySku.values())
    .filter((r) => r.product.trim().length > 0)
    .sort((a, b) => a.currentStock - b.currentStock);
}

export async function POST(req: NextRequest) {
  try {
    const hasWeekly = await hasAverageWeeklySalesColumn();

    const warehouses = (await prisma.warehouse.findMany({
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
      orderBy: { name: "asc" },
    })) as WarehouseGraph[];

    if (warehouses.length === 0) {
      return jsonOk({ response: "No warehouses found." });
    }

    const rows = aggregateRows(warehouses).slice(0, 100) as Array<
      RestockInventoryRow & { averageWeeklySales?: number | null }
    >;

    // Build prompt for all warehouses
    const warehouseNames = warehouses.map((w) => w.name).join(", ");
    const prompt = buildRestockPrompt({
      warehouseName: warehouseNames,
      scope: "warehouse",
      rows: rows.map((r) => ({
        product: r.product,
        currentStock: r.currentStock,
        category: r.category,
        currentPrice: r.currentPrice,
        averageWeeklySales: r.averageWeeklySales ?? null,
      })),
    });

    // Build system message
    const inventoryDataSummary = rows
      .map((r) => {
        const weekly = r.averageWeeklySales == null ? "?" : String(Math.trunc(r.averageWeeklySales));
        return `- ${r.product}: currentStock=${Math.trunc(r.currentStock)}, averageWeeklySales=${weekly}, category=${r.category}`;
      })
      .join("\n");

    const systemMessage = `Predict restock needs for NEXT WEEK. Use lead-time (2 weeks) + safety stock (1 week) = 3 weeks total.

Logic:
- Required stock = weekly_sales × 3
- If current_stock >= (weekly_sales × 3): NO restock (enough for lead-time + safety)
- If current_stock < weekly_sales: URGENT (will run out)
- If current_stock < (weekly_sales × 3) AND sales > 0: RECOMMEND restock
- Sales = 0/low AND stock high: NO restock (no demand)

CRITICAL: ALL urgent items MUST also appear in recommended restocks. Product names must match EXACTLY from inventory (same spelling/capitalization).

Order quantity: (weekly_sales × 3) - current_stock
- If result <= 0: DO NOT order (already sufficient)
- Round up to nearest 10

Format: "Urgent low stock items:", "Recommended restocks:", "Summary:"
Numbers must match inventory data exactly.

Inventory reference:
${inventoryDataSummary}

Return ONLY the formatted response. No commentary.`;

    const baseUrl = process.env.LMSTUDIO_BASE_URL ?? "http://10.19.85.63:1234";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);

    try {
      const response = await lmstudioChatCompletions({
        baseUrl,
        model: MODEL_ID,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: systemMessage,
          },
          { role: "user", content: prompt },
        ],
        signal: controller.signal,
      });

      clearTimeout(timeout);
      return jsonOk({ response });
    } catch (e) {
      clearTimeout(timeout);
      throw e;
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[API] restock-ai-all error:", e);
    return jsonError(msg, 500);
  }
}
