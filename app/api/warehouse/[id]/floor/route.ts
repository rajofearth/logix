import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// POST /api/warehouse/[id]/floor - Create a new floor
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: warehouseId } = await params;
        const body = await req.json();
        const { name, level } = body;

        if (!name || level === undefined) {
            return jsonError("Missing required fields: name, level", 400);
        }

        // Check if warehouse exists
        const warehouse = await prisma.warehouse.findUnique({
            where: { id: warehouseId },
        });

        if (!warehouse) {
            return jsonError("Warehouse not found", 404);
        }

        // Check if floor level already exists
        const existingFloor = await prisma.floor.findFirst({
            where: { warehouseId, level },
        });

        if (existingFloor) {
            return jsonError(`Floor level ${level} already exists in this warehouse`, 409);
        }

        const floor = await prisma.floor.create({
            data: {
                name,
                level,
                warehouseId,
            },
        });

        return jsonOk(floor, { status: 201 });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        console.error("[API] POST /api/warehouse/[id]/floor error:", msg);
        return jsonError(msg, 500);
    }
}
