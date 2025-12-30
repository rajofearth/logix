import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

function decimalToNumber(val: unknown): number {
    if (val === null || val === undefined) return 0;
    if (typeof val === "number") return val;
    if (typeof val === "string") return Number(val);
    if (typeof val === "object") {
        const objWithToNumber = val as { toNumber?: () => number };
        if ("toNumber" in val && typeof objWithToNumber.toNumber === "function") {
            return objWithToNumber.toNumber();
        }
        return Number(String(val));
    }
    return Number(val);
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    try {
        const { jobId } = await params;

        if (!jobId) {
            return jsonError("Job ID is required", 400);
        }

        // Get current location
        const currentLocation = await prisma.driverLocation.findUnique({
            where: { jobId },
            select: {
                latitude: true,
                longitude: true,
                speedMps: true,
                heading: true,
                updatedAt: true,
            },
        });

        // Get path history (all location points)
        const pathPoints = await prisma.locationPoint.findMany({
            where: { jobId },
            orderBy: { timestamp: "asc" },
            select: {
                latitude: true,
                longitude: true,
                speedMps: true,
                heading: true,
                timestamp: true,
            },
        });

        if (!currentLocation && pathPoints.length === 0) {
            return jsonError("No location data found for this job", 404);
        }

        return jsonOk({
            current: currentLocation
                ? {
                    latitude: decimalToNumber(currentLocation.latitude),
                    longitude: decimalToNumber(currentLocation.longitude),
                    speedMps: currentLocation.speedMps
                        ? decimalToNumber(currentLocation.speedMps)
                        : null,
                    heading: currentLocation.heading,
                    updatedAt: currentLocation.updatedAt.toISOString(),
                }
                : null,
            path: pathPoints.map((p) => ({
                latitude: decimalToNumber(p.latitude),
                longitude: decimalToNumber(p.longitude),
                speedMps: p.speedMps ? decimalToNumber(p.speedMps) : null,
                heading: p.heading,
                timestamp: p.timestamp.toISOString(),
            })),
        });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        console.error("[API] Get location error:", e);
        return jsonError(msg, 500);
    }
}
