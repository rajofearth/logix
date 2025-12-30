import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { requireDriverSession } from "@/app/api/_utils/driver-session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

interface CompleteJobBody {
    jobId: string;
}

export async function POST(req: Request) {
    try {
        const { driverId } = await requireDriverSession(req.headers);

        const body = (await req.json()) as CompleteJobBody;
        const { jobId } = body;

        if (!jobId) {
            return jsonError("Job ID is required", 400);
        }

        // Get job and verify ownership
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
            return jsonError(`Cannot complete job with status: ${job.status}`, 400);
        }

        // Update job status, driver status, and remove current location (keep path history)
        await prisma.$transaction([
            prisma.job.update({
                where: { id: jobId },
                data: { status: "completed" },
            }),
            prisma.driver.update({
                where: { id: driverId },
                data: { status: "available" },
            }),
            // Remove current location entry (path history is preserved)
            prisma.driverLocation.deleteMany({
                where: { jobId },
            }),
        ]);

        return jsonOk({ success: true, status: "completed" });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        if (msg === "Unauthorized") return jsonError("Unauthorized", 401);
        console.error("[API] Complete job error:", e);
        return jsonError(msg, 500);
    }
}
