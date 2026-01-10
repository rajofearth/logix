import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { prisma } from "@/lib/prisma";
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

// GET /api/warehouse/product/search - Search products across all warehouses
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q") || "";
        const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

        if (!query || query.length < 2) {
            return jsonOk([]);
        }

        const hasWeekly = await hasAverageWeeklySalesColumn();

        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { sku: { contains: query, mode: "insensitive" } },
                ],
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
                block: {
                    select: {
                        id: true,
                        name: true,
                        floor: {
                            select: {
                                id: true,
                                name: true,
                                warehouse: { select: { id: true, name: true } },
                            },
                        },
                    },
                },
            },
            take: limit,
            orderBy: { name: "asc" },
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
            // Location info for search results
            location: {
                warehouseId: p.block.floor.warehouse.id,
                warehouseName: p.block.floor.warehouse.name,
                floorId: p.block.floor.id,
                floorName: p.block.floor.name,
                blockId: p.block.id,
                blockName: p.block.name,
            },
        }));

        return jsonOk(dto);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        console.error("[API] GET /api/warehouse/product/search error:", msg);
        return jsonError(msg, 500);
    }
}
