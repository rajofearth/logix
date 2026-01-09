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

// PUT /api/warehouse/.../product/[productId] - Update product
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string; floorId: string; blockId: string; productId: string }> }
) {
    try {
        const { id: warehouseId, floorId, blockId, productId } = await params;
        const body = await req.json();
        const { name, quantity, category, boughtAt, currentPrice, expiryDate, averageWeeklySales } = body;

        const hasWeekly = await hasAverageWeeklySalesColumn();
        if (averageWeeklySales !== undefined && !hasWeekly) {
            return jsonError("Weekly sales column missing in DB. Run `pnpm prisma db push`.", 400);
        }

        // Verify the full chain
        const existing = await prisma.product.findFirst({
            where: {
                id: productId,
                blockId,
                block: {
                    floorId,
                    floor: { warehouseId },
                },
            },
        });

        if (!existing) {
            return jsonError("Product not found", 404);
        }

        const dbCategory = category?.replace("-", "_") as ProductCategory | undefined;

        const product = await prisma.product.update({
            where: { id: productId },
            data: {
                ...(name && { name }),
                ...(quantity !== undefined && { quantity }),
                ...(dbCategory && { category: dbCategory }),
                ...(hasWeekly && averageWeeklySales !== undefined && { averageWeeklySales }),
                ...(boughtAt !== undefined && { boughtAt }),
                ...(currentPrice !== undefined && { currentPrice }),
                ...(expiryDate !== undefined && { expiryDate: expiryDate ? new Date(expiryDate) : null }),
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

        return jsonOk({
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
        });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        console.error("[API] PUT .../product/[productId] error:", msg);
        return jsonError(msg, 500);
    }
}

// DELETE /api/warehouse/.../product/[productId] - Remove product
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; floorId: string; blockId: string; productId: string }> }
) {
    try {
        const { id: warehouseId, floorId, blockId, productId } = await params;

        // Verify the full chain
        const existing = await prisma.product.findFirst({
            where: {
                id: productId,
                blockId,
                block: {
                    floorId,
                    floor: { warehouseId },
                },
            },
        });

        if (!existing) {
            return jsonError("Product not found", 404);
        }

        await prisma.product.delete({ where: { id: productId } });

        return jsonOk({ success: true });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        console.error("[API] DELETE .../product/[productId] error:", msg);
        return jsonError(msg, 500);
    }
}
