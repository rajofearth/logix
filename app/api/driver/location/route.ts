import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { requireDriverSession } from "@/app/api/_utils/driver-session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

interface LocationUpdateBody {
    jobId: string;
    latitude: number;
    longitude: number;
    speedMps?: number | null;
    heading?: number | null;
    timestamp?: string; // ISO string
    routeGeometry?: any; // GeoJSON
}

export async function POST(req: Request) {
    try {
        const { driverId } = await requireDriverSession(req.headers);

        const body = (await req.json()) as LocationUpdateBody;
        const { jobId, latitude, longitude, speedMps, heading, timestamp, routeGeometry } = body;

        // Validate required fields
        if (!jobId || latitude === undefined || longitude === undefined) {
            return jsonError("Missing required fields: jobId, latitude, longitude", 400);
        }

        // Validate job exists and belongs to this driver
        const job = await prisma.job.findUnique({
            where: { id: jobId },
            select: { id: true, driverId: true, status: true },
        });

        if (!job) {
            return jsonError("Job not found", 404);
        }

        if (job.driverId !== driverId) {
            return jsonError("Job does not belong to this driver", 403);
        }

        if (job.status !== "in_progress") {
            return jsonError("Job is not in progress", 400);
        }

        const now = timestamp ? new Date(timestamp) : new Date();

        // Use a transaction to update both tables atomically
        await prisma.$transaction([
            // Upsert current location (for fast lookups)
            prisma.driverLocation.upsert({
                where: { jobId },
                create: {
                    jobId,
                    driverId,
                    latitude,
                    longitude,
                    speedMps: speedMps ?? null,
                    heading: heading ?? null,
                    routeGeometry: routeGeometry ?? undefined, // Only set if provided
                },
                update: {
                    latitude,
                    longitude,
                    speedMps: speedMps ?? null,
                    heading: heading ?? null,
                    // Only update route geometry if a new one is provided (it might be sent only once)
                    ...(routeGeometry ? { routeGeometry } : {}),
                },
            }),
            // Insert into location history (complete path)
            prisma.locationPoint.create({
                data: {
                    jobId,
                    driverId,
                    latitude,
                    longitude,
                    speedMps: speedMps ?? null,
                    heading: heading ?? null,
                    timestamp: now,
                },
            }),
        ]);

        return jsonOk({ success: true });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        if (msg === "Unauthorized") return jsonError("Unauthorized", 401);
        console.error("[API] Location update error:", e);
        return jsonError(msg, 500);
    }
}
