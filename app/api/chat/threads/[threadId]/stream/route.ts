import type { NextRequest } from "next/server";

import { z } from "zod";

import { requireAdminSession } from "@/app/api/_utils/admin-session";
import { prisma } from "@/lib/prisma";
import { chatChannel, type ChatRealtimePayload } from "@/lib/chat/realtime";
import { getPgPool } from "@/lib/pg";
import type { ChatMessageDTO } from "@/app/api/chat/_types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const querySchema = z.object({
  after: z.string().datetime().optional(),
});

function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

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
    if (!threadId) return new Response("threadId is required", { status: 400 });

    const parsed = querySchema.safeParse({
      after: req.nextUrl.searchParams.get("after") ?? undefined,
    });
    if (!parsed.success) return new Response("Invalid query params", { status: 400 });

    const after = parsed.data.after ? new Date(parsed.data.after) : null;

    // Ensure thread exists (avoid leaking LISTEN channels)
    const exists = await prisma.chatThread.findUnique({
      where: { id: threadId },
      select: { id: true },
    });
    if (!exists) return new Response("Thread not found", { status: 404 });

    const encoder = new TextEncoder();
    let isActive = true;

    const pool = getPgPool();
    const pgClient = await pool.connect();
    const channel = chatChannel(threadId);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          await pgClient.query(`listen ${channel}`);
        } catch (e) {
          console.error("[SSE] chat listen error:", e);
          controller.error(e);
          pgClient.release();
          return;
        }

        controller.enqueue(encoder.encode(sseEvent("connected", { ok: true, threadId })));

        // Send any backlog (optional)
        if (after) {
          try {
            const backlog = await prisma.chatMessage.findMany({
              where: { threadId, createdAt: { gt: after } },
              orderBy: { createdAt: "asc" },
              take: 200,
              select: {
                id: true,
                threadId: true,
                senderType: true,
                content: true,
                createdAt: true,
              },
            });
            for (const m of backlog) {
              controller.enqueue(
                encoder.encode(sseEvent("message", toMessageDto(m)))
              );
            }
          } catch (e) {
            console.error("[SSE] chat backlog error:", e);
          }
        }

        const onNotification = (msg: { channel: string; payload?: string | null }) => {
          if (!isActive) return;
          if (msg.channel !== channel) return;
          if (!msg.payload) return;
          try {
            const payload = JSON.parse(msg.payload) as ChatRealtimePayload;
            controller.enqueue(encoder.encode(sseEvent("realtime", payload)));
          } catch (e) {
            console.error("[SSE] chat payload parse error:", e);
          }
        };

        const onError = (err: Error) => {
          if (!isActive) return;
          console.error("[SSE] chat pg client error:", err);
          controller.enqueue(encoder.encode(sseEvent("error", { message: "Server error" })));
        };

        // pg Client is an EventEmitter at runtime; narrow type locally for `.on(...)`.
        type PgEmitter = {
          on(event: "notification", cb: typeof onNotification): void;
          on(event: "error", cb: typeof onError): void;
        };
        const emitter = pgClient as unknown as PgEmitter;
        emitter.on("notification", onNotification);
        emitter.on("error", onError);

        const heartbeat = () => {
          if (!isActive) return;
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
          setTimeout(heartbeat, 20000);
        };
        heartbeat();
      },
      async cancel() {
        isActive = false;
        try {
          await pgClient.query(`unlisten ${channel}`);
        } catch {
          // ignore
        }
        pgClient.release();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg === "Unauthorized") return new Response("Unauthorized", { status: 401 });
    console.error("[SSE] chat stream error:", e);
    return new Response("Server error", { status: 500 });
  }
}


