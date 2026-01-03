import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/app/api/_utils/json";

export const runtime = "nodejs";

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function GET(req: Request, context: RouteContext) {
    try {
        const { id: jobId } = await context.params;

        if (!jobId) {
            return jsonError("Job ID is required", 400);
        }

        // Verify job exists
        const job = await prisma.job.findUnique({
            where: { id: jobId },
            select: { id: true },
        });

        if (!job) {
            return jsonError("Job not found", 404);
        }

        // Get all verifications for this job
        const verifications = await prisma.packageVerification.findMany({
            where: { jobId },
            orderBy: { createdAt: "asc" },
            select: {
                id: true,
                phase: true,
                capturedImageUrl: true,
                damagePercentage: true,
                anomalyDetected: true,
                threshold: true,
                heatmapImageUrl: true,
                passed: true,
                createdAt: true,
            },
        });

        return jsonOk({
            jobId,
            verifications: verifications.map((v) => ({
                ...v,
                damagePercentage: Number(v.damagePercentage),
                threshold: Number(v.threshold),
            })),
        });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        console.error("[API] Get verifications error:", e);
        return jsonError(msg, 500);
    }
}
