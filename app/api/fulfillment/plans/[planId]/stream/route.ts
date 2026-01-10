import type { NextRequest } from "next/server"

import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { requireAdminSession } from "@/app/api/_utils/admin-session"
import { Prisma } from "@prisma/client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const planIdSchema = z.string().uuid()

type PlanUpdateDto = {
  id: string
  masterJobId: string
  status: string
  objective: string
  selectedPlanKey: string | null
  updatedAt: string
  segments: Array<{
    id: string
    sortOrder: number
    mode: string
    status: string
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
    const parsedPlanId = planIdSchema.parse(planId)

    const existsRows = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      select id from fulfillment_plans where id = ${parsedPlanId}::uuid limit 1
    `)
    if (existsRows.length === 0) return new Response("Plan not found", { status: 404 })

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
            const planRows = await prisma.$queryRaw<
              Array<{
                id: string
                master_job_id: string
                status: string
                objective: string
                selected_plan_key: string | null
                updated_at: Date
              }>
            >(Prisma.sql`
              select
                id,
                master_job_id,
                status::text as status,
                objective::text as objective,
                selected_plan_key,
                updated_at
              from fulfillment_plans
              where id = ${parsedPlanId}::uuid
              limit 1
            `)

            const planRow = planRows[0] ?? null
            if (!planRow) {
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

            const segmentRows = await prisma.$queryRaw<
              Array<{
                id: string
                sort_order: number
                mode: string
                status: string
                job_id: string | null
                shipment_id: string | null
                train_shipment_id: string | null
                updated_at: Date
              }>
            >(Prisma.sql`
              select
                id,
                sort_order,
                mode::text as mode,
                status::text as status,
                job_id,
                shipment_id,
                train_shipment_id,
                updated_at
              from fulfillment_segments
              where plan_id = ${parsedPlanId}::uuid
              order by sort_order asc
            `)

            let updatedAt = planRow.updated_at
            for (const s of segmentRows) {
              updatedAt = maxDate(updatedAt, s.updated_at)
            }

            if (!lastUpdatedAt || updatedAt > lastUpdatedAt) {
              lastUpdatedAt = updatedAt
              const dto: PlanUpdateDto = {
                id: planRow.id,
                masterJobId: planRow.master_job_id,
                status: planRow.status,
                objective: planRow.objective,
                selectedPlanKey: planRow.selected_plan_key,
                updatedAt: planRow.updated_at.toISOString(),
                segments: segmentRows.map((s) => ({
                  id: s.id,
                  sortOrder: s.sort_order,
                  mode: s.mode,
                  status: s.status,
                  jobId: s.job_id,
                  shipmentId: s.shipment_id,
                  trainShipmentId: s.train_shipment_id,
                  updatedAt: s.updated_at.toISOString(),
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

            const terminal = ["completed", "failed", "cancelled"].includes(planRow.status)
            if (terminal) {
              if (isActive) {
                try {
                  controller.enqueue(encoder.encode(sseEvent("completed", { status: planRow.status })))
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

