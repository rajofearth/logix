"use server"

import { headers } from "next/headers"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import type { NotificationDTO, NotificationType } from "../_types"

type ListNotificationsInput = {
  filter?: "all" | NotificationType
  unreadOnly?: boolean
  cursor?: string
  limit?: number
}

type ListNotificationsResult = {
  notifications: NotificationDTO[]
  nextCursor: string | null
}

async function requireAdminUserId(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }
  return session.user.id
}

function toNotificationDto(row: {
  id: string
  readAt: Date | null
  event: {
    type: NotificationType
    title: string
    message: string
    actionUrl: string | null
    createdAt: Date
  }
}): NotificationDTO {
  return {
    id: row.id,
    type: row.event.type,
    title: row.event.title,
    message: row.event.message,
    timestamp: row.event.createdAt.toISOString(),
    read: row.readAt !== null,
    actionUrl: row.event.actionUrl ?? undefined,
  }
}

export async function listNotifications(
  input: ListNotificationsInput = {}
): Promise<ListNotificationsResult> {
  const userId = await requireAdminUserId()

  const limit = Math.max(1, Math.min(input.limit ?? 50, 200))
  const cursorDate = input.cursor ? new Date(input.cursor) : null

  const where: {
    userId: string
    archivedAt: null
    readAt?: null
    createdAt?: { lt: Date }
    event?: { type?: NotificationType }
  } = {
    userId,
    archivedAt: null,
  }

  if (input.unreadOnly) where.readAt = null
  if (cursorDate && !Number.isNaN(cursorDate.getTime())) {
    where.createdAt = { lt: cursorDate }
  }
  if (input.filter && input.filter !== "all") {
    where.event = { type: input.filter }
  }

  const receipts = await prisma.notificationReceipt.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    select: {
      id: true,
      readAt: true,
      createdAt: true,
      event: {
        select: {
          type: true,
          title: true,
          message: true,
          actionUrl: true,
          createdAt: true,
        },
      },
    },
  })

  const hasMore = receipts.length > limit
  const page = receipts.slice(0, limit)

  return {
    notifications: page.map((r) =>
      toNotificationDto({
        id: r.id,
        readAt: r.readAt,
        event: r.event,
      })
    ),
    nextCursor: hasMore ? page[page.length - 1]!.createdAt.toISOString() : null,
  }
}

export async function getUnreadCount(): Promise<number> {
  const userId = await requireAdminUserId()
  return prisma.notificationReceipt.count({
    where: {
      userId,
      archivedAt: null,
      readAt: null,
    },
  })
}

export async function markNotificationRead(id: string): Promise<void> {
  const userId = await requireAdminUserId()
  await prisma.notificationReceipt.updateMany({
    where: {
      id,
      userId,
      archivedAt: null,
      readAt: null,
    },
    data: { readAt: new Date() },
  })
}

export async function markAllNotificationsRead(): Promise<void> {
  const userId = await requireAdminUserId()
  await prisma.notificationReceipt.updateMany({
    where: {
      userId,
      archivedAt: null,
      readAt: null,
    },
    data: { readAt: new Date() },
  })
}

export async function archiveNotification(id: string): Promise<void> {
  const userId = await requireAdminUserId()
  await prisma.notificationReceipt.updateMany({
    where: {
      id,
      userId,
      archivedAt: null,
    },
    data: { archivedAt: new Date() },
  })
}


