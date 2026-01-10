import type { NextRequest } from "next/server"

import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { requireAdminSession } from "@/app/api/_utils/admin-session"
import type {
  FulfillmentObjective,
  FulfillmentPlanStatus,
  FulfillmentSegmentMode,
  FulfillmentSegmentStatus,
} from "@prisma/client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const planIdSchema = z.string().uuid()

type PlanUpdateDto = {
  id: string
  masterJobId: string
  status: FulfillmentPlanStatus
  objective: FulfillmentObjective
  selectedPlanKey: string | null
  updatedAt: string
  segments: Array<{
    id: string
    sortOrder: number
    mode: FulfillmentSegmentMode
    status: FulfillmentSegmentStatus
    jobId: string | null
    shipmentId: string | null
    trainShipmentId: string | null
    updatedAt: string
  }>
}

function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

function maxDate(a: Date, b: Date): Date {
  return a.getTime() >= b.getTime() ? a : b
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    await requireAdminSession(req.headers)
    const { planId } = await params
    const parsed = planIdSchema.safeParse(planId)
    if (!parsed.success) return new Response("Invalid planId", { status: 400 })
    const parsedPlanId = parsed.data

    const exists = await prisma.fulfillmentPlan.findUnique({
      where: { id: parsedPlanId },
      select: { id: true },
    })
    if (!exists) return new Response("Plan not found", { status: 404 })

    const encoder = new TextEncoder()
    let isActive = true
    let lastUpdatedAt: Date | null = null

    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(
          encoder.encode(sseEvent("connected", { ok: true, planId: parsedPlanId }))
        )

        const poll = async () => {
          if (!isActive) return
          try {
            const plan = await prisma.fulfillmentPlan.findUnique({
              where: { id: parsedPlanId },
              select: {
                id: true,
                masterJobId: true,
                status: true,
                objective: true,
                selectedPlanKey: true,
                updatedAt: true,
              },
            })
            if (!plan) {
              try {
                controller.enqueue(encoder.encode(sseEvent("error", { message: "Plan not found" })))
              } catch {
                // Controller might be closed
              }
              isActive = false
              try {
                controller.close()
              } catch {
                // Already closed
              }
              return
            }

            const segments = await prisma.fulfillmentSegment.findMany({
              where: { planId: parsedPlanId },
              orderBy: { sortOrder: "asc" },
              select: {
                id: true,
                sortOrder: true,
                mode: true,
                status: true,
                jobId: true,
                shipmentId: true,
                trainShipmentId: true,
                updatedAt: true,
              },
            })

            let updatedAt = plan.updatedAt
            for (const s of segments) {
              updatedAt = maxDate(updatedAt, s.updatedAt)
            }

            if (!lastUpdatedAt || updatedAt > lastUpdatedAt) {
              lastUpdatedAt = updatedAt
              const dto: PlanUpdateDto = {
                id: plan.id,
                masterJobId: plan.masterJobId,
                status: plan.status,
                objective: plan.objective,
                selectedPlanKey: plan.selectedPlanKey,
                updatedAt: plan.updatedAt.toISOString(),
                segments: segments.map((s) => ({
                  id: s.id,
                  sortOrder: s.sortOrder,
                  mode: s.mode,
                  status: s.status,
                  jobId: s.jobId,
                  shipmentId: s.shipmentId,
                  trainShipmentId: s.trainShipmentId,
                  updatedAt: s.updatedAt.toISOString(),
                })),
              }
              if (isActive) {
                try {
                  controller.enqueue(encoder.encode(sseEvent("plan_update", dto)))
                } catch (err) {
                  // Controller might be closed
                  if (err instanceof TypeError && err.message.includes("closed")) {
                    isActive = false
                    return
                  }
                  throw err
                }
              }
            }

            const terminal = ["completed", "failed", "cancelled"].includes(plan.status)
            if (terminal) {
              if (isActive) {
                try {
                  controller.enqueue(encoder.encode(sseEvent("completed", { status: plan.status })))
                } catch {
                  // Controller might be closed
                }
              }
              isActive = false
              try {
                controller.close()
              } catch {
                // Already closed
              }
              return
            }

            if (isActive) {
              try {
                controller.enqueue(encoder.encode(`: heartbeat\n\n`))
                setTimeout(poll, 2000)
              } catch (err) {
                // Controller closed, stop polling
                if (err instanceof TypeError && err.message.includes("closed")) {
                  isActive = false
                  return
                }
                throw err
              }
            }
          } catch (e) {
            console.error("[SSE] fulfillment plan poll error:", e)
            if (isActive) {
              try {
                controller.enqueue(encoder.encode(sseEvent("error", { message: "Server error" })))
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
    if (msg === "Unauthorized") return new Response("Unauthorized", { status: 401 })
    console.error("[SSE] fulfillment plan stream error:", e)
    return new Response("Server error", { status: 500 })
  }
}

