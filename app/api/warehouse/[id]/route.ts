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

// GET /api/warehouse/[id] - Get warehouse with all floors and blocks
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const warehouse = await prisma.warehouse.findUnique({
            where: { id },
            include: {
                floors: {
                    include: {
                        blocks: {
                            include: {
                                products: true,
                            },
                            orderBy: [{ row: "asc" }, { column: "asc" }],
                        },
                    },
                    orderBy: { level: "asc" },
                },
            },
        });

        if (!warehouse) {
            return jsonError("Warehouse not found", 404);
        }

        // Transform to match frontend expected format
        const dto = {
            id: warehouse.id,
            name: warehouse.name,
            code: warehouse.code,
            address: warehouse.address,
            city: warehouse.city,
            totalFloors: warehouse.floors.length,
            totalBlocks: warehouse.floors.reduce((sum, f) => sum + f.blocks.length, 0),
            totalCapacity: warehouse.floors.reduce(
                (sum, f) => sum + f.blocks.reduce((bs, b) => bs + b.capacity, 0),
                0
            ),
            usedCapacity: warehouse.floors.reduce(
                (sum, f) =>
                    sum +
                    f.blocks.reduce(
                        (bs, b) => bs + b.products.reduce((ps, p) => ps + p.quantity, 0),
                        0
                    ),
                0
            ),
            workers: warehouse.workers,
            lastUpdated: warehouse.updatedAt.toISOString(),
            floors: warehouse.floors.map((floor) => {
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
                        category: block.category.replace("_", "-"), // raw_materials -> raw-materials
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

                return {
                    id: floor.id,
                    name: floor.name,
                    level: floor.level,
                    blocks,
                    stats: {
                        totalCapacity,
                        usedCapacity,
                        totalItems,
                        activeWorkers: Math.floor(warehouse.workers / warehouse.floors.length),
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
            }),
        };

        return jsonOk(dto);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        console.error("[API] GET /api/warehouse/[id] error:", msg);
        return jsonError(msg, 500);
    }
}

// PUT /api/warehouse/[id] - Update warehouse details
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { name, code, address, city, workers } = body;

        const warehouse = await prisma.warehouse.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(code && { code }),
                ...(address && { address }),
                ...(city && { city }),
                ...(workers !== undefined && { workers }),
            },
        });

        return jsonOk(warehouse);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        if (msg.includes("Record to update not found")) {
            return jsonError("Warehouse not found", 404);
        }
        console.error("[API] PUT /api/warehouse/[id] error:", msg);
        return jsonError(msg, 500);
    }
}

// DELETE /api/warehouse/[id] - Delete warehouse
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.warehouse.delete({ where: { id } });

        return jsonOk({ success: true });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        if (msg.includes("Record to delete does not exist")) {
            return jsonError("Warehouse not found", 404);
        }
        console.error("[API] DELETE /api/warehouse/[id] error:", msg);
        return jsonError(msg, 500);
    }
}
