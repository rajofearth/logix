import type { NextRequest } from "next/server";

import { z } from "zod";

import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { requireAdminSession } from "@/app/api/_utils/admin-session";
import { prisma } from "@/lib/prisma";
import { notifyThread } from "@/lib/chat/realtime";
import type { ChatMessageDTO } from "@/app/api/chat/_types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const getSchema = z.object({
  after: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

const postSchema = z.object({
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    await requireAdminSession(req.headers);
    const { threadId } = await params;
    if (!threadId) return jsonError("threadId is required", 400);

    const parsed = getSchema.safeParse({
      after: req.nextUrl.searchParams.get("after") ?? undefined,
      limit: req.nextUrl.searchParams.get("limit") ?? undefined,
    });
    if (!parsed.success) return jsonError("Invalid query params", 400);

    const limit = parsed.data.limit ?? 50;
    const after = parsed.data.after ? new Date(parsed.data.after) : null;

    const messages = await prisma.chatMessage.findMany({
      where: {
        threadId,
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

    return jsonOk({ messages: messages.map(toMessageDto) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg === "Unauthorized") return jsonError("Unauthorized", 401);
    console.error("[API] chat messages list error:", e);
    return jsonError("Server error", 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { adminUserId } = await requireAdminSession(req.headers);
    const { threadId } = await params;
    if (!threadId) return jsonError("threadId is required", 400);

    const body = postSchema.safeParse((await req.json()) as unknown);
    if (!body.success) return jsonError("Invalid body", 400);

    // Enforce: only allow sending while job is in_progress and driver is on_route
    const thread = await prisma.chatThread.findUnique({
      where: { id: threadId },
      select: {
        id: true,
        job: {
          select: {
            status: true,
            driver: { select: { status: true } },
          },
        },
      },
    });

    if (!thread) return jsonError("Thread not found", 404);
    if (thread.job.status !== "in_progress") {
      return jsonError("Chat is only allowed while job is in progress", 403);
    }
    if (thread.job.driver?.status !== "on_route") {
      return jsonError("Chat is only allowed while driver is on route", 403);
    }

    const created = await prisma.chatMessage.create({
      data: {
        threadId,
        senderType: "admin",
        senderAdminId: adminUserId,
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
    console.error("[API] chat message send error:", e);
    return jsonError("Server error", 500);
  }
}


