import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { requireDriverSession } from "@/app/api/_utils/driver-session";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications/notify";

export const runtime = "nodejs";
// Increase timeout for job start transactions
export const maxDuration = 30;

interface StartJobBody {
    jobId: string;
}

export async function POST(req: Request) {
    try {
        const { driverId } = await requireDriverSession(req.headers);

        const body = (await req.json()) as StartJobBody;
        const { jobId } = body;

        if (!jobId) {
            return jsonError("Job ID is required", 400);
        }

        // Get job and verify ownership
        const job = await prisma.job.findUnique({
            where: { id: jobId },
            select: { id: true, title: true, driverId: true, status: true },
        });

        if (!job) {
            return jsonError("Job not found", 404);
        }

        if (job.driverId !== driverId) {
            return jsonError("Job does not belong to this driver", 403);
        }

        if (job.status !== "pending") {
            return jsonError(`Cannot start job with status: ${job.status}`, 400);
        }

        // Check if driver already has a job in progress
        const existingActiveJob = await prisma.job.findFirst({
            where: {
                driverId,
                status: "in_progress",
                id: { not: jobId },
            },
            select: { id: true },
        });

        if (existingActiveJob) {
            return jsonError("You already have another job in progress", 400);
        }

        // Update job status and driver status in a transaction
        await prisma.$transaction([
            prisma.job.update({
                where: { id: jobId },
                data: { status: "in_progress" },
            }),
            prisma.driver.update({
                where: { id: driverId },
                data: { status: "on_route" },
            }),
            // Ensure chat thread exists (idempotent)
            prisma.chatThread.upsert({
                where: { jobId },
                create: { jobId },
                update: {},
            }),
        ]);

        // Fire-and-forget admin notification (do not block driver flow)
        try {
            const driver = await prisma.driver.findUnique({
                where: { id: driverId },
                select: { name: true },
            });
            await notify.driverStartedJob({
                jobId: job.id,
                jobTitle: job.title,
                driverName: driver?.name ?? null,
            });
        } catch (e) {
            console.error("[Notifications] driverStartedJob notify error:", e);
        }

        return jsonOk({ success: true, status: "in_progress" });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        if (msg === "Unauthorized") return jsonError("Unauthorized", 401);
        console.error("[API] Start job error:", e);
        return jsonError(msg, 500);
    }
}
