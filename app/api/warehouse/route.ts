import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// DTO types for API responses
type WarehouseListDto = {
    id: string;
    name: string;
    code: string;
    address: string;
    city: string;
    totalFloors: number;
    totalBlocks: number;
    totalCapacity: number;
    usedCapacity: number;
    workers: number;
    lastUpdated: string;
};

// GET /api/warehouse - List all warehouses with aggregated stats
export async function GET() {
    try {
        const warehouses = await prisma.warehouse.findMany({
            include: {
                floors: {
                    include: {
                        blocks: {
                            include: {
                                products: true,
                            },
                        },
                    },
                },
            },
            orderBy: { name: "asc" },
        });

        const dto: WarehouseListDto[] = warehouses.map((w) => {
            const totalBlocks = w.floors.reduce((sum, f) => sum + f.blocks.length, 0);
            const totalCapacity = w.floors.reduce(
                (sum, f) => sum + f.blocks.reduce((bs, b) => bs + b.capacity, 0),
                0
            );
            const usedCapacity = w.floors.reduce(
                (sum, f) =>
                    sum +
                    f.blocks.reduce(
                        (bs, b) => bs + b.products.reduce((ps, p) => ps + p.quantity, 0),
                        0
                    ),
                0
            );

            return {
                id: w.id,
                name: w.name,
                code: w.code,
                address: w.address,
                city: w.city,
                totalFloors: w.floors.length,
                totalBlocks,
                totalCapacity,
                usedCapacity,
                workers: w.workers,
                lastUpdated: w.updatedAt.toISOString(),
            };
        });

        return jsonOk(dto);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        console.error("[API] GET /api/warehouse error:", msg);
        return jsonError(msg, 500);
    }
}

// POST /api/warehouse - Create a new warehouse
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, code, address, city, workers } = body;

        if (!name || !code || !address || !city) {
            return jsonError("Missing required fields: name, code, address, city", 400);
        }

        // Check if code already exists
        const existing = await prisma.warehouse.findUnique({ where: { code } });
        if (existing) {
            return jsonError(`Warehouse with code '${code}' already exists`, 409);
        }

        const warehouse = await prisma.warehouse.create({
            data: {
                name,
                code,
                address,
                city,
                workers: workers || 0,
            },
        });

        return jsonOk(warehouse, { status: 201 });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        console.error("[API] POST /api/warehouse error:", msg);
        return jsonError(msg, 500);
    }
}
