import type { NextRequest } from "next/server";

import { z } from "zod";

import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { requireDriverSession } from "@/app/api/_utils/driver-session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const querySchema = z.object({
  jobId: z.string().uuid(),
});

/**
 * Driver: returns/creates the chat thread for a job (must belong to driver).
 */
export async function GET(req: NextRequest) {
  try {
    const { driverId } = await requireDriverSession(req.headers);

    const parsed = querySchema.safeParse({
      jobId: req.nextUrl.searchParams.get("jobId"),
    });
    if (!parsed.success) return jsonError("Invalid jobId", 400);

    const job = await prisma.job.findUnique({
      where: { id: parsed.data.jobId },
      select: { id: true, driverId: true },
    });

    if (!job) return jsonError("Job not found", 404);
    if (job.driverId !== driverId) return jsonError("Forbidden", 403);

    const thread = await prisma.chatThread.upsert({
      where: { jobId: job.id },
      create: { jobId: job.id },
      update: {},
      select: { id: true, jobId: true },
    });

    return jsonOk({ thread });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg === "Unauthorized") return jsonError("Unauthorized", 401);
    console.error("[API] driver chat thread error:", e);
    return jsonError("Server error", 500);
  }
}


