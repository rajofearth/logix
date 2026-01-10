import type { NextRequest } from "next/server"

import { prisma } from "@/lib/prisma"
import type { NotificationDTO } from "@/app/dashboard/notifications/_types"
import { requireAdminSession } from "@/app/api/_utils/admin-session"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type NotificationRow = {
  id: string
  readAt: Date | null
  event: {
    type: NotificationDTO["type"]
    title: string
    message: string
    actionUrl: string | null
    createdAt: Date
  }
}

function toDto(row: NotificationRow): NotificationDTO {
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

export async function GET(req: NextRequest) {
  try {
    const { adminUserId: userId } = await requireAdminSession(req.headers)

    const encoder = new TextEncoder()
    let lastCreatedAt: Date | null = null
    let isActive = true

    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(
          encoder.encode(`event: connected\ndata: ${JSON.stringify({ ok: true })}\n\n`)
        )

        const poll = async () => {
          if (!isActive) return

          try {
            const where: {
              userId: string
              archivedAt: null
              createdAt?: { gt: Date }
            } = {
              userId,
              archivedAt: null,
            }

            if (lastCreatedAt) {
              where.createdAt = { gt: lastCreatedAt }
            }

            const rows = await prisma.notificationReceipt.findMany({
              where,
              orderBy: { createdAt: "asc" },
              take: 50,
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

            for (const r of rows) {
              if (!isActive) return
              lastCreatedAt = r.createdAt
              const dto = toDto({
                id: r.id,
                readAt: r.readAt,
                event: r.event,
              })
              try {
                controller.enqueue(
                  encoder.encode(`event: notification\ndata: ${JSON.stringify(dto)}\n\n`)
                )
              } catch (err) {
                // Controller might be closed, stop polling
                if (err instanceof TypeError && err.message.includes("closed")) {
                  isActive = false
                  return
                }
                throw err
              }
            }

            if (isActive) {
              try {
                controller.enqueue(encoder.encode(`: heartbeat\n\n`))
                setTimeout(poll, 2000)
              } catch (err) {
                if (err instanceof TypeError && err.message.includes("closed")) {
                  isActive = false
                  return
                }
                throw err
              }
            }
          } catch (e) {
            console.error("[SSE] notifications poll error:", e)
            if (isActive) {
              try {
                controller.enqueue(
                  encoder.encode(
                    `event: error\ndata: ${JSON.stringify({ message: "Server error" })}\n\n`
                  )
                )
                setTimeout(poll, 5000)
              } catch (err) {
                // Controller closed, stop polling
                if (err instanceof TypeError && err.message.includes("closed")) {
                  isActive = false
                  return
                }
                throw err
              }
            }
          }
        }

        poll()
      },
      cancel() {
        isActive = false
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error"
    if (msg === "Unauthorized") {
      return new Response("Unauthorized", { status: 401 })
    }
    console.error("[SSE] notifications stream error:", e)
    return new Response("Server error", { status: 500 })
  }
}


