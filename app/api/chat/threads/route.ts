import type { NextRequest } from "next/server";

import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { requireAdminSession } from "@/app/api/_utils/admin-session";
import { prisma } from "@/lib/prisma";
import type { ChatThreadDTO } from "@/app/api/chat/_types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toThreadDto(row: {
  id: string;
  job: { id: string; title: string; driver: { id: string; name: string; photoUrl: string | null; status: "available" | "on_route" | "off_duty" } | null };
  messages: Array<{
    id: string;
    threadId: string;
    senderType: "admin" | "driver";
    content: string;
    createdAt: Date;
  }>;
}): ChatThreadDTO | null {
  if (!row.job.driver) return null;
  const last = row.messages[0] ?? null;
  return {
    id: row.id,
    jobId: row.job.id,
    jobTitle: row.job.title,
    driver: row.job.driver,
    lastMessage: last
      ? {
          id: last.id,
          threadId: last.threadId,
          senderType: last.senderType,
          content: last.content,
          createdAt: last.createdAt.toISOString(),
        }
      : null,
  };
}

/**
 * List active (in_progress) chat threads for admins.
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdminSession(req.headers);

    const threads = await prisma.chatThread.findMany({
      where: {
        job: {
          status: "in_progress",
          driverId: { not: null },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: {
        id: true,
        job: {
          select: {
            id: true,
            title: true,
            driver: {
              select: {
                id: true,
                name: true,
                photoUrl: true,
                status: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            threadId: true,
            senderType: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });

    const dtos = threads
      .map(toThreadDto)
      .filter((x): x is ChatThreadDTO => x !== null);

    return jsonOk({ threads: dtos });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg === "Unauthorized") return jsonError("Unauthorized", 401);
    console.error("[API] chat threads list error:", e);
    return jsonError("Server error", 500);
  }
}


