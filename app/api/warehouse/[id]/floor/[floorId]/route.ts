import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { prisma } from "@/lib/prisma";

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

// GET /api/warehouse/[id]/floor/[floorId] - Get floor with all blocks
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string; floorId: string }> }
) {
    try {
        const { id: warehouseId, floorId } = await params;

        const floor = await prisma.floor.findFirst({
            where: { id: floorId, warehouseId },
            include: {
                blocks: {
                    include: {
                        products: true,
                    },
                    orderBy: [{ row: "asc" }, { column: "asc" }],
                },
                warehouse: true,
            },
        });

        if (!floor) {
            return jsonError("Floor not found", 404);
        }

        const blocks = floor.blocks.map((block) => {
            const used = block.products.reduce((sum, p) => sum + p.quantity, 0);
            return {
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
        });

        const totalCapacity = blocks.reduce((sum, b) => sum + b.capacity, 0);
        const usedCapacity = blocks.reduce((sum, b) => sum + b.used, 0);
        const totalItems = blocks.reduce(
            (sum, b) => sum + b.products.reduce((ps, p) => ps + p.quantity, 0),
            0
        );

        const dto = {
            id: floor.id,
            name: floor.name,
            level: floor.level,
            blocks,
            stats: {
                totalCapacity,
                usedCapacity,
                totalItems,
                activeWorkers: Math.floor(floor.warehouse.workers / 3), // Approximate per floor
                averageTemperature:
                    blocks.length > 0
                        ? blocks.reduce((sum, b) => sum + (b.temperature || 22), 0) / blocks.length
                        : undefined,
                averageHumidity:
                    blocks.length > 0
                        ? blocks.reduce((sum, b) => sum + (b.humidity || 50), 0) / blocks.length
                        : undefined,
            },
        };

        return jsonOk(dto);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        console.error("[API] GET /api/warehouse/[id]/floor/[floorId] error:", msg);
        return jsonError(msg, 500);
    }
}

// PUT /api/warehouse/[id]/floor/[floorId] - Update floor details
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string; floorId: string }> }
) {
    try {
        const { id: warehouseId, floorId } = await params;
        const body = await req.json();
        const { name, level } = body;

        // Verify floor belongs to warehouse
        const existing = await prisma.floor.findFirst({
            where: { id: floorId, warehouseId },
        });

        if (!existing) {
            return jsonError("Floor not found", 404);
        }

        const floor = await prisma.floor.update({
            where: { id: floorId },
            data: {
                ...(name && { name }),
                ...(level !== undefined && { level }),
            },
        });

        return jsonOk(floor);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        console.error("[API] PUT /api/warehouse/[id]/floor/[floorId] error:", msg);
        return jsonError(msg, 500);
    }
}

// DELETE /api/warehouse/[id]/floor/[floorId] - Delete floor
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; floorId: string }> }
) {
    try {
        const { id: warehouseId, floorId } = await params;

        // Verify floor belongs to warehouse
        const existing = await prisma.floor.findFirst({
            where: { id: floorId, warehouseId },
        });

        if (!existing) {
            return jsonError("Floor not found", 404);
        }

        await prisma.floor.delete({ where: { id: floorId } });

        return jsonOk({ success: true });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        console.error("[API] DELETE /api/warehouse/[id]/floor/[floorId] error:", msg);
        return jsonError(msg, 500);
    }
}
