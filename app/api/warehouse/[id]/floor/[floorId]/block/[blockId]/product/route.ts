import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { prisma } from "@/lib/prisma";
import { ProductCategory } from "@/generated/prisma/client";

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

        const products = await prisma.product.findMany({
            where: { blockId },
            orderBy: { name: "asc" },
        });

        const dto = products.map((p) => ({
            id: p.id,
            sku: p.sku,
            name: p.name,
            quantity: p.quantity,
            category: p.category.replace("_", "-"),
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
        const { sku, name, quantity, category, boughtAt, currentPrice, expiryDate } = body;

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

        // Convert category from frontend format
        const dbCategory = category.replace("-", "_") as ProductCategory;

        const product = await prisma.product.create({
            data: {
                sku,
                name,
                quantity,
                category: dbCategory,
                boughtAt,
                currentPrice,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                blockId,
            },
        });

        return jsonOk(
            {
                id: product.id,
                sku: product.sku,
                name: product.name,
                quantity: product.quantity,
                category: product.category.replace("_", "-"),
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
