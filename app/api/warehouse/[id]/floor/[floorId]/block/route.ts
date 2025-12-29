import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { prisma } from "@/lib/prisma";
import { ProductCategory } from "@/generated/prisma/client";

export const runtime = "nodejs";

// POST /api/warehouse/[id]/floor/[floorId]/block - Create a new block
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string; floorId: string }> }
) {
    try {
        const { id: warehouseId, floorId } = await params;
        const body = await req.json();
        const { name, row, column, capacity, category, temperature, humidity } = body;

        if (!name || !row || column === undefined || !capacity || !category) {
            return jsonError(
                "Missing required fields: name, row, column, capacity, category",
                400
            );
        }

        // Verify floor belongs to warehouse
        const floor = await prisma.floor.findFirst({
            where: { id: floorId, warehouseId },
        });

        if (!floor) {
            return jsonError("Floor not found", 404);
        }

        // Check if block position already exists
        const existingBlock = await prisma.block.findFirst({
            where: { floorId, row, column },
        });

        if (existingBlock) {
            return jsonError(`Block at position ${row}-${column} already exists`, 409);
        }

        // Convert category from frontend format (raw-materials) to enum (raw_materials)
        const dbCategory = category.replace("-", "_") as ProductCategory;

        const block = await prisma.block.create({
            data: {
                name,
                row,
                column,
                capacity,
                category: dbCategory,
                temperature: temperature ?? null,
                humidity: humidity ?? null,
                floorId,
            },
        });

        return jsonOk(block, { status: 201 });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        console.error("[API] POST /api/warehouse/[id]/floor/[floorId]/block error:", msg);
        return jsonError(msg, 500);
    }
}
