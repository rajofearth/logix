import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/app/api/_utils/json";

export const runtime = "nodejs";
// Increase timeout for package verification queries with transactions
export const maxDuration = 30;

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const phase = searchParams.get("phase");
        const passed = searchParams.get("passed");
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");

        // Build where clause
        const where: {
            phase?: "pickup" | "delivery";
            passed?: boolean;
        } = {};

        if (phase && (phase === "pickup" || phase === "delivery")) {
            where.phase = phase;
        }

        if (passed !== null && passed !== undefined) {
            where.passed = passed === "true";
        }

        // Get total count
        const total = await prisma.packageVerification.count({ where });

        // Get verifications with job details
        const verifications = await prisma.packageVerification.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: offset,
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        pickupAddress: true,
                        dropAddress: true,
                        driver: {
                            select: {
                                id: true,
                                name: true,
                                photoUrl: true,
                            },
                        },
                    },
                },
            },
        });

        // Calculate stats
        const stats = await prisma.$transaction([
            prisma.packageVerification.count(),
            prisma.packageVerification.count({ where: { phase: "pickup" } }),
            prisma.packageVerification.count({ where: { phase: "delivery" } }),
            prisma.packageVerification.count({ where: { passed: true } }),
            prisma.packageVerification.count({ where: { passed: false } }),
            prisma.packageVerification.aggregate({
                _avg: { damagePercentage: true },
            }),
        ]);

        return jsonOk({
            verifications: verifications.map((v) => ({
                id: v.id,
                phase: v.phase,
                capturedImageUrl: v.capturedImageUrl,
                heatmapImageUrl: v.heatmapImageUrl,
                damagePercentage: Number(v.damagePercentage),
                anomalyDetected: v.anomalyDetected,
                threshold: Number(v.threshold),
                passed: v.passed,
                createdAt: v.createdAt.toISOString(),
                job: v.job,
            })),
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + verifications.length < total,
            },
            stats: {
                total: stats[0],
                pickupScans: stats[1],
                deliveryScans: stats[2],
                passed: stats[3],
                failed: stats[4],
                avgDamage: stats[5]._avg.damagePercentage
                    ? Number(stats[5]._avg.damagePercentage).toFixed(2)
                    : "0.00",
            },
        });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        console.error("[API] Get all verifications error:", e);
        return jsonError(msg, 500);
    }
}
