import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { prisma } from "@/lib/prisma";
import { ProductCategory } from "@prisma/client";
import { hasAverageWeeklySalesColumn } from "@/app/api/warehouse/_utils/productWeeklySales";

export const runtime = "nodejs";

function decimalToNumber(val: unknown): number {
    if (val === null || val === undefined) return 0;
    if (typeof val === "number") return val;
    if (typeof val === "string") return Number(val);
    if (typeof val === "object") {
        if ("toNumber" in val && typeof (val as { toNumber: () => number }).toNumber === "function") {
            return (val as { toNumber: () => number }).toNumber();
        }
        return Number(String(val));
    }
    return Number(val);
}

// GET /api/warehouse/.../product - List products in block
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string; floorId: string; blockId: string }> }
) {
    try {
        const { id: warehouseId, floorId, blockId } = await params;

        // Verify the chain
        const block = await prisma.block.findFirst({
            where: {
                id: blockId,
                floorId,
                floor: { warehouseId },
            },
        });

        if (!block) {
            return jsonError("Block not found", 404);
        }

        const hasWeekly = await hasAverageWeeklySalesColumn();

        const products = await prisma.product.findMany({
            where: { blockId },
            orderBy: { name: "asc" },
            select: {
                id: true,
                sku: true,
                name: true,
                quantity: true,
                category: true,
                boughtAt: true,
                currentPrice: true,
                expiryDate: true,
                updatedAt: true,
                ...(hasWeekly ? { averageWeeklySales: true } : {}),
            },
        });

        const dto = products.map((p) => ({
            id: p.id,
            sku: p.sku,
            name: p.name,
            quantity: p.quantity,
            category: p.category.replace("_", "-"),
            averageWeeklySales: "averageWeeklySales" in p ? (p.averageWeeklySales ?? null) : null,
            boughtAt: decimalToNumber(p.boughtAt),
            currentPrice: decimalToNumber(p.currentPrice),
            expiryDate: p.expiryDate?.toISOString(),
            lastUpdated: p.updatedAt.toISOString(),
        }));

        return jsonOk(dto);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        console.error("[API] GET .../product error:", msg);
        return jsonError(msg, 500);
    }
}

// POST /api/warehouse/.../product - Add product to block
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string; floorId: string; blockId: string }> }
) {
    try {
        const { id: warehouseId, floorId, blockId } = await params;
        const body = await req.json();
        const { sku, name, quantity, category, boughtAt, currentPrice, expiryDate, averageWeeklySales } = body;

        if (!sku || !name || quantity === undefined || !category || boughtAt === undefined || currentPrice === undefined) {
            return jsonError(
                "Missing required fields: sku, name, quantity, category, boughtAt, currentPrice",
                400
            );
        }

        // Verify the chain
        const block = await prisma.block.findFirst({
            where: {
                id: blockId,
                floorId,
                floor: { warehouseId },
            },
        });

        if (!block) {
            return jsonError("Block not found", 404);
        }

        // Check if SKU already exists
        const existingSku = await prisma.product.findUnique({ where: { sku } });
        if (existingSku) {
            return jsonError(`Product with SKU '${sku}' already exists`, 409);
        }

        const hasWeekly = await hasAverageWeeklySalesColumn();
        if (averageWeeklySales !== undefined && !hasWeekly) {
            return jsonError("Weekly sales column missing in DB. Run `pnpm prisma db push`.", 400);
        }

        // Convert category from frontend format
        const dbCategory = category.replace("-", "_") as ProductCategory;

        const product = await prisma.product.create({
            data: {
                sku,
                name,
                quantity,
                category: dbCategory,
                ...(hasWeekly ? { averageWeeklySales: averageWeeklySales === undefined ? null : averageWeeklySales } : {}),
                boughtAt,
                currentPrice,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                blockId,
            },
            select: {
                id: true,
                sku: true,
                name: true,
                quantity: true,
                category: true,
                boughtAt: true,
                currentPrice: true,
                expiryDate: true,
                updatedAt: true,
                ...(hasWeekly ? { averageWeeklySales: true } : {}),
            },
        });

        return jsonOk(
            {
                id: product.id,
                sku: product.sku,
                name: product.name,
                quantity: product.quantity,
                category: product.category.replace("_", "-"),
                averageWeeklySales: "averageWeeklySales" in product ? (product.averageWeeklySales ?? null) : null,
                boughtAt: decimalToNumber(product.boughtAt),
                currentPrice: decimalToNumber(product.currentPrice),
                expiryDate: product.expiryDate?.toISOString(),
                lastUpdated: product.updatedAt.toISOString(),
            },
            { status: 201 }
        );
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        console.error("[API] POST .../product error:", msg);
        return jsonError(msg, 500);
    }
}
