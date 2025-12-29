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

function getBlockStatus(used: number, capacity: number): string {
    const percentage = (used / capacity) * 100;
    if (percentage === 0) return "empty";
    if (percentage >= 90) return "critical";
    if (percentage >= 70) return "warning";
    return "normal";
}

// GET /api/warehouse/[id]/floor/[floorId]/block/[blockId] - Get block with all products
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string; floorId: string; blockId: string }> }
) {
    try {
        const { id: warehouseId, floorId, blockId } = await params;

        // Verify the chain: warehouse -> floor -> block
        const block = await prisma.block.findFirst({
            where: {
                id: blockId,
                floorId,
                floor: { warehouseId },
            },
            include: {
                products: {
                    orderBy: { name: "asc" },
                },
            },
        });

        if (!block) {
            return jsonError("Block not found", 404);
        }

        const used = block.products.reduce((sum, p) => sum + p.quantity, 0);

        const dto = {
            id: block.id,
            name: block.name,
            row: block.row,
            column: block.column,
            capacity: block.capacity,
            used,
            status: getBlockStatus(used, block.capacity),
            category: block.category.replace("_", "-"),
            temperature: block.temperature ? decimalToNumber(block.temperature) : undefined,
            humidity: block.humidity ?? undefined,
            lastActivity: block.updatedAt.toISOString(),
            products: block.products.map((p) => ({
                id: p.id,
                sku: p.sku,
                name: p.name,
                quantity: p.quantity,
                category: p.category.replace("_", "-"),
                boughtAt: decimalToNumber(p.boughtAt),
                currentPrice: decimalToNumber(p.currentPrice),
                expiryDate: p.expiryDate?.toISOString(),
                lastUpdated: p.updatedAt.toISOString(),
            })),
        };

        return jsonOk(dto);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        console.error("[API] GET .../block/[blockId] error:", msg);
        return jsonError(msg, 500);
    }
}

// PUT /api/warehouse/[id]/floor/[floorId]/block/[blockId] - Update block details
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string; floorId: string; blockId: string }> }
) {
    try {
        const { id: warehouseId, floorId, blockId } = await params;
        const body = await req.json();
        const { name, capacity, category, temperature, humidity } = body;

        // Verify the chain
        const existing = await prisma.block.findFirst({
            where: {
                id: blockId,
                floorId,
                floor: { warehouseId },
            },
        });

        if (!existing) {
            return jsonError("Block not found", 404);
        }

        const dbCategory = category?.replace("-", "_") as ProductCategory | undefined;

        const block = await prisma.block.update({
            where: { id: blockId },
            data: {
                ...(name && { name }),
                ...(capacity !== undefined && { capacity }),
                ...(dbCategory && { category: dbCategory }),
                ...(temperature !== undefined && { temperature }),
                ...(humidity !== undefined && { humidity }),
            },
        });

        return jsonOk(block);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        console.error("[API] PUT .../block/[blockId] error:", msg);
        return jsonError(msg, 500);
    }
}

// DELETE /api/warehouse/[id]/floor/[floorId]/block/[blockId] - Delete block
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; floorId: string; blockId: string }> }
) {
    try {
        const { id: warehouseId, floorId, blockId } = await params;

        // Verify the chain
        const existing = await prisma.block.findFirst({
            where: {
                id: blockId,
                floorId,
                floor: { warehouseId },
            },
        });

        if (!existing) {
            return jsonError("Block not found", 404);
        }

        await prisma.block.delete({ where: { id: blockId } });

        return jsonOk({ success: true });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        console.error("[API] DELETE .../block/[blockId] error:", msg);
        return jsonError(msg, 500);
    }
}
