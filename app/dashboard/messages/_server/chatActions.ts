"use server"

import { z } from "zod"
import { headers } from "next/headers"

import { requireAdminSession } from "@/app/api/_utils/admin-session"
import { prisma } from "@/lib/prisma"
import { notifyThread } from "@/lib/chat/realtime"
import type { ChatMessage } from "../_types"

const getThreadSchema = z.object({
  jobId: z.string().uuid(),
})

const listMessagesSchema = z.object({
  threadId: z.string().uuid(),
  after: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(200).optional(),
})

const sendSchema = z.object({
  threadId: z.string().uuid(),
  content: z.string().trim().min(1).max(5000),
})

function toChatMessage(row: {
  id: string
  threadId: string
  senderType: "admin" | "driver"
  content: string
  createdAt: Date
}): ChatMessage {
  return {
    id: row.id,
    threadId: row.threadId,
    senderType: row.senderType,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function getOrCreateThreadForJob(jobId: string): Promise<{ threadId: string } | null> {
  const { adminUserId: _adminUserId } = await requireAdminSession(await headers())
  const parsed = getThreadSchema.parse({ jobId })

  const job = await prisma.job.findUnique({
    where: { id: parsed.jobId },
    select: { id: true, status: true, driverId: true },
  })

  if (!job || !job.driverId) return null
  if (job.status !== "in_progress") return null

  const thread = await prisma.chatThread.upsert({
    where: { jobId: job.id },
    create: { jobId: job.id },
    update: {},
    select: { id: true },
  })

  return { threadId: thread.id }
}

export async function listMessages(
  threadId: string,
  after?: string,
  limit?: number
): Promise<ChatMessage[]> {
  const { adminUserId: _adminUserId } = await requireAdminSession(await headers())
  const parsed = listMessagesSchema.parse({ threadId, after, limit })

  const afterDate = parsed.after ? new Date(parsed.after) : null
  const take = parsed.limit ?? 100

  const rows = await prisma.chatMessage.findMany({
    where: {
      threadId: parsed.threadId,
      ...(afterDate ? { createdAt: { gt: afterDate } } : {}),
    },
    orderBy: { createdAt: "asc" },
    take,
    select: {
      id: true,
      threadId: true,
      senderType: true,
      content: true,
      createdAt: true,
    },
  })

  return rows.map(toChatMessage)
}

export async function sendAdminMessage(threadId: string, content: string): Promise<ChatMessage> {
  const { adminUserId } = await requireAdminSession(await headers())
  const parsed = sendSchema.parse({ threadId, content })

  const thread = await prisma.chatThread.findUnique({
    where: { id: parsed.threadId },
    select: {
      id: true,
      job: { select: { status: true, driver: { select: { status: true } } } },
    },
  })

  if (!thread) {
    throw new Error("Thread not found")
  }
  if (thread.job.status !== "in_progress") {
    throw new Error("Chat is only allowed while job is in progress")
  }
  if (thread.job.driver?.status !== "on_route") {
    throw new Error("Chat is only allowed while driver is on route")
  }

  const created = await prisma.chatMessage.create({
    data: {
      threadId: parsed.threadId,
      senderType: "admin",
      senderAdminId: adminUserId,
      content: parsed.content,
    },
    select: {
      id: true,
      threadId: true,
      senderType: true,
      content: true,
      createdAt: true,
    },
  })

  await notifyThread(parsed.threadId, {
    type: "message_created",
    threadId: parsed.threadId,
    messageId: created.id,
    createdAt: created.createdAt.toISOString(),
  })

  return toChatMessage(created)
}


