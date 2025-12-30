import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    const { jobId } = await params;

    if (!jobId) {
        return new Response("Job ID is required", { status: 400 });
    }

    // Verify job exists
    const job = await prisma.job.findUnique({
        where: { id: jobId },
        select: { id: true, status: true },
    });

    if (!job) {
        return new Response("Job not found", { status: 404 });
    }

    const encoder = new TextEncoder();
    let lastUpdatedAt: Date | null = null;
    let isActive = true;

    const stream = new ReadableStream({
        async start(controller) {
            // Send initial connection event
            controller.enqueue(
                encoder.encode(`event: connected\ndata: ${JSON.stringify({ jobId })}\n\n`)
            );

            // Poll for updates every 2 seconds
            const poll = async () => {
                if (!isActive) return;

                try {
                    // Check if job is still in progress
                    const currentJob = await prisma.job.findUnique({
                        where: { id: jobId },
                        select: { status: true },
                    });

                    if (currentJob?.status === "completed" || currentJob?.status === "cancelled") {
                        controller.enqueue(
                            encoder.encode(
                                `event: completed\ndata: ${JSON.stringify({ status: currentJob.status })}\n\n`
                            )
                        );
                        isActive = false;
                        controller.close();
                        return;
                    }

                    // Get current location
                    const location = await prisma.driverLocation.findUnique({
                        where: { jobId },
                        select: {
                            latitude: true,
                            longitude: true,
                            speedMps: true,
                            heading: true,
                            routeGeometry: true,
                            updatedAt: true,
                        },
                    });

                    // Only send if there's new data
                    if (location && (!lastUpdatedAt || location.updatedAt > lastUpdatedAt)) {
                        lastUpdatedAt = location.updatedAt;

                        const data = {
                            latitude: decimalToNumber(location.latitude),
                            longitude: decimalToNumber(location.longitude),
                            speedMps: location.speedMps
                                ? decimalToNumber(location.speedMps)
                                : null,
                            heading: location.heading,
                            routeGeometry: location.routeGeometry,
                            updatedAt: location.updatedAt.toISOString(),
                        };

                        controller.enqueue(
                            encoder.encode(`event: location\ndata: ${JSON.stringify(data)}\n\n`)
                        );
                    }

                    // Send heartbeat to keep connection alive
                    controller.enqueue(encoder.encode(`: heartbeat\n\n`));

                    // Schedule next poll
                    setTimeout(poll, 2000);
                } catch (error) {
                    console.error("[SSE] Error polling location:", error);
                    if (isActive) {
                        controller.enqueue(
                            encoder.encode(
                                `event: error\ndata: ${JSON.stringify({ message: "Server error" })}\n\n`
                            )
                        );
                        setTimeout(poll, 5000); // Retry after 5s on error
                    }
                }
            };

            // Start polling
            poll();
        },
        cancel() {
            isActive = false;
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no", // Disable nginx buffering
        },
    });
}
