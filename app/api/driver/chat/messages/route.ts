import type { NextRequest } from "next/server";

import { z } from "zod";

import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { requireDriverSession } from "@/app/api/_utils/driver-session";
import { prisma } from "@/lib/prisma";
import { notifyThread } from "@/lib/chat/realtime";
import type { ChatMessageDTO } from "@/app/api/chat/_types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const getSchema = z.object({
  jobId: z.string().uuid(),
  after: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

const postSchema = z.object({
  jobId: z.string().uuid(),
  content: z.string().trim().min(1).max(5000),
});

function toMessageDto(row: {
  id: string;
  threadId: string;
  senderType: "admin" | "driver";
  content: string;
  createdAt: Date;
}): ChatMessageDTO {
  return {
    id: row.id,
    threadId: row.threadId,
    senderType: row.senderType,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
  };
}

/**
 * Driver: list messages for a job thread (must belong to driver).
 */
export async function GET(req: NextRequest) {
  try {
    const { driverId } = await requireDriverSession(req.headers);

    const parsed = getSchema.safeParse({
      jobId: req.nextUrl.searchParams.get("jobId"),
      after: req.nextUrl.searchParams.get("after") ?? undefined,
      limit: req.nextUrl.searchParams.get("limit") ?? undefined,
    });
    if (!parsed.success) return jsonError("Invalid query params", 400);

    const after = parsed.data.after ? new Date(parsed.data.after) : null;
    const limit = parsed.data.limit ?? 50;

    const thread = await prisma.chatThread.findUnique({
      where: { jobId: parsed.data.jobId },
      select: {
        id: true,
        job: { select: { driverId: true } },
      },
    });

    if (!thread) return jsonError("Thread not found", 404);
    if (thread.job.driverId !== driverId) return jsonError("Forbidden", 403);

    const messages = await prisma.chatMessage.findMany({
      where: {
        threadId: thread.id,
        ...(after ? { createdAt: { gt: after } } : {}),
      },
      orderBy: { createdAt: "asc" },
      take: limit,
      select: {
        id: true,
        threadId: true,
        senderType: true,
        content: true,
        createdAt: true,
      },
    });

    return jsonOk({ threadId: thread.id, messages: messages.map(toMessageDto) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg === "Unauthorized") return jsonError("Unauthorized", 401);
    console.error("[API] driver chat messages list error:", e);
    return jsonError("Server error", 500);
  }
}

/**
 * Driver: send message for a job thread (must belong to driver, job in progress, driver on route).
 */
export async function POST(req: NextRequest) {
  try {
    const { driverId } = await requireDriverSession(req.headers);

    const body = postSchema.safeParse((await req.json()) as unknown);
    if (!body.success) return jsonError("Invalid body", 400);

    const job = await prisma.job.findUnique({
      where: { id: body.data.jobId },
      select: {
        id: true,
        status: true,
        driverId: true,
        driver: { select: { status: true } },
        chatThread: { select: { id: true } },
      },
    });

    if (!job) return jsonError("Job not found", 404);
    if (job.driverId !== driverId) return jsonError("Forbidden", 403);
    if (job.status !== "in_progress") {
      return jsonError("Chat is only allowed while job is in progress", 403);
    }
    if (job.driver?.status !== "on_route") {
      return jsonError("Chat is only allowed while driver is on route", 403);
    }

    const threadId =
      job.chatThread?.id ??
      (
        await prisma.chatThread.create({
          data: { jobId: job.id },
          select: { id: true },
        })
      ).id;

    const created = await prisma.chatMessage.create({
      data: {
        threadId,
        senderType: "driver",
        senderDriverId: driverId,
        content: body.data.content,
      },
      select: {
        id: true,
        threadId: true,
        senderType: true,
        content: true,
        createdAt: true,
      },
    });

    await notifyThread(threadId, {
      type: "message_created",
      threadId,
      messageId: created.id,
      createdAt: created.createdAt.toISOString(),
    });

    return jsonOk({ message: toMessageDto(created) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg === "Unauthorized") return jsonError("Unauthorized", 401);
    console.error("[API] driver chat message send error:", e);
    return jsonError("Server error", 500);
  }
}


