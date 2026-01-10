"use server"

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { Decimal } from "@prisma/client/runtime/index-browser"
import type { LngLat } from "@/app/dashboard/jobs/_types"
import { getRandomCarrier, generateFlightNumber } from "@/lib/carriers/carriers-data"
import { Prisma } from "@prisma/client"

const planIdSchema = z.string().uuid()

function toDecimal6(value: number): Decimal {
  return new Decimal(value.toFixed(6))
}

const lngLatSchema = z.object({
  lat: z.number().finite(),
  lng: z.number().finite(),
})

const groundPlannedSchema = z.object({
  routeType: z.enum(["fastest", "economy", "via_gas_station"]).optional(),
  distanceMeters: z.number().int().nonnegative(),
  durationSeconds: z.number().int().nonnegative(),
  estimatedFuelCost: z.number().int().nonnegative().optional(),
  routeGeometry: z.unknown().optional(),

  // Either {pickup, drop} for road-only or {from, to} for legs
  pickup: z
    .object({
      lat: z.number().finite(),
      lng: z.number().finite(),
      address: z.string().optional(),
    })
    .optional(),
  drop: z
    .object({
      lat: z.number().finite(),
      lng: z.number().finite(),
      address: z.string().optional(),
    })
    .optional(),
  from: z
    .object({
      lat: z.number().finite(),
      lng: z.number().finite(),
      address: z.string().optional(),
      name: z.string().optional(),
      code: z.string().optional(),
    })
    .optional(),
  to: z
    .object({
      lat: z.number().finite(),
      lng: z.number().finite(),
      address: z.string().optional(),
      name: z.string().optional(),
      code: z.string().optional(),
    })
    .optional(),
})

const trainPlannedSchema = z.object({
  trainNumber: z.string().min(1),
  trainName: z.string().min(1),
  fromStationCode: z.string().min(1),
  fromStationName: z.string().min(1),
  toStationCode: z.string().min(1),
  toStationName: z.string().min(1),
  durationMinutes: z.number().int().positive(),
})

const airPlannedSchema = z
  .object({
    fromAirportIcao: z.string().min(1),
    toAirportIcao: z.string().min(1),
    durationSeconds: z.number().int().positive().optional(),
  })
  .passthrough()

function addMinutes(d: Date, minutes: number): Date {
  return new Date(d.getTime() + minutes * 60 * 1000)
}

function getPointFromPlanned(
  planned: z.infer<typeof groundPlannedSchema>,
  which: "start" | "end"
): LngLat {
  const start =
    planned.pickup ??
    planned.from ??
    null
  const end =
    planned.drop ??
    planned.to ??
    null

  const p = which === "start" ? start : end
  if (!p) throw new Error("Ground segment planned data missing endpoints")
  const parsed = lngLatSchema.parse({ lat: p.lat, lng: p.lng })
  return { lat: parsed.lat, lng: parsed.lng }
}

function buildJobTitle(base: string, idx: number, total: number): string {
  if (total <= 1) return base
  return `${base} (Leg ${idx + 1}/${total})`
}

function generateAirReferenceCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `AIR-${timestamp}-${random}`
}

async function createAirShipment(tx: typeof prisma, args: { packageName: string; weightKg: number; fromIcao: string; toIcao: string; plannedDepartureAt: Date; plannedArrivalAt: Date }) {
  const carrier = getRandomCarrier()
  const flightNumber = generateFlightNumber(carrier)
  const referenceCode = generateAirReferenceCode()

  const shipment = await tx.shipment.create({
    data: {
      referenceCode,
      status: "created",
      metadata: {
        packageName: args.packageName,
        weightKg: args.weightKg,
      },
      segments: {
        create: {
          type: "air",
          sortOrder: 0,
          carrier: carrier.name,
          carrierTrackingId: `${carrier.code}-${Date.now()}`,
          flightNumber,
          fromAirportIcao: args.fromIcao,
          toAirportIcao: args.toIcao,
          icao24: "3c66a8",
          plannedDepartureAt: args.plannedDepartureAt,
          plannedArrivalAt: args.plannedArrivalAt,
        },
      },
      events: {
        create: {
          type: "created",
          title: "Shipment Created",
          description: `Auto-planned air leg (${args.fromIcao} → ${args.toIcao})`,
          occurredAt: new Date(),
        },
      },
    },
    select: { id: true },
  })

  return shipment.id
}

function computeCursorTimeBeforeSegment(args: {
  masterPickupAt: Date
  segments: Array<{ mode: string; planned: unknown }>
  targetSortOrder: number
}): Date {
  let cursorTime = args.masterPickupAt
  for (let i = 0; i < args.segments.length; i++) {
    if (i >= args.targetSortOrder) break
    const seg = args.segments[i]
    if (!seg) continue

    if (seg.mode === "ground") {
      const planned = groundPlannedSchema.parse(seg.planned ?? {})
      const minutes = Math.max(1, Math.round(planned.durationSeconds / 60))
      cursorTime = addMinutes(cursorTime, minutes)
      continue
    }
    if (seg.mode === "train") {
      const planned = trainPlannedSchema.parse(seg.planned ?? {})
      cursorTime = addMinutes(cursorTime, 30 + planned.durationMinutes)
      continue
    }
    if (seg.mode === "air") {
      const planned = airPlannedSchema.parse(seg.planned ?? {})
      const seconds = planned.durationSeconds ?? 3 * 60 * 60 // fallback 3h
      cursorTime = addMinutes(cursorTime, Math.max(1, Math.round(seconds / 60)))
      continue
    }
  }
  return cursorTime
}

export async function startFulfillmentExecution(
  planId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const parsedPlanId = planIdSchema.parse(planId)
    const rows = await prisma.$queryRaw<Array<{ id: string; status: string }>>(Prisma.sql`
      select id, status::text as status
      from fulfillment_plans
      where id = ${parsedPlanId}::uuid
      limit 1
    `)
    const plan = rows[0] ?? null
    if (!plan) return { success: false, error: "Plan not found" }
    if (plan.status !== "draft") return { success: false, error: "Plan is not executable" }

    await prisma.$executeRaw(Prisma.sql`
      update fulfillment_plans
      set status = 'executing'::"FulfillmentPlanStatus", updated_at = now()
      where id = ${plan.id}::uuid
    `)

    return { success: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to start execution"
    return { success: false, error: msg }
  }
}

type DbSegmentRow = {
  id: string
  planId: string
  sortOrder: number
  mode: "ground" | "train" | "air"
  status: string
  planned: unknown
  jobId: string | null
  shipmentId: string | null
  trainShipmentId: string | null
}

export async function executeNextFulfillmentStep(
  planId: string
): Promise<
  | { success: true; done: boolean; planStatus: string }
  | { success: false; error: string }
> {
  let nextSegmentId: string | null = null
  try {
    const parsedPlanId = planIdSchema.parse(planId)

    const planRows = await prisma.$queryRaw<
      Array<{ id: string; master_job_id: string; status: string }>
    >(Prisma.sql`
      select id, master_job_id, status::text as status
      from fulfillment_plans
      where id = ${parsedPlanId}::uuid
      limit 1
    `)
    const planRow = planRows[0] ?? null
    if (!planRow) return { success: false, error: "Plan not found" }
    if (planRow.status !== "executing") {
      return { success: false, error: "Plan is not currently executing" }
    }

    const segments = await prisma.$queryRaw<DbSegmentRow[]>(Prisma.sql`
      select
        id,
        plan_id as "planId",
        sort_order as "sortOrder",
        mode::text as mode,
        status::text as status,
        planned,
        job_id as "jobId",
        shipment_id as "shipmentId",
        train_shipment_id as "trainShipmentId"
      from fulfillment_segments
      where plan_id = ${planRow.id}::uuid
      order by sort_order asc
    `)

    const next = segments.find((s) => s.status === "planned") ?? null
    if (!next) {
      await prisma.$executeRaw(Prisma.sql`
        update fulfillment_plans
        set status = 'completed'::"FulfillmentPlanStatus", updated_at = now()
        where id = ${planRow.id}::uuid
      `)
      return { success: true, done: true, planStatus: "completed" }
    }
    nextSegmentId = next.id

    const masterJob = await prisma.job.findUnique({
      where: { id: planRow.master_job_id },
      select: {
        id: true,
        title: true,
        weightKg: true,
        pickupAddress: true,
        dropAddress: true,
        pickupAt: true,
        dropWindowStartAt: true,
        dropWindowEndAt: true,
      },
    })
    if (!masterJob) return { success: false, error: "Master job not found" }

    const cursorTime = computeCursorTimeBeforeSegment({
      masterPickupAt: masterJob.pickupAt,
      segments: segments.map((s) => ({ mode: s.mode, planned: s.planned })),
      targetSortOrder: next.sortOrder,
    })

    // Mark the segment in-progress first (visible to SSE)
    await prisma.$executeRaw(Prisma.sql`
      update fulfillment_segments
      set status = 'in_progress'::"FulfillmentSegmentStatus", updated_at = now()
      where id = ${next.id}::uuid
    `)

    if (next.mode === "ground") {
      const planned = groundPlannedSchema.parse(next.planned ?? {})
      const start = getPointFromPlanned(planned, "start")
      const end = getPointFromPlanned(planned, "end")

      const groundSegments = segments.filter((s) => s.mode === "ground")
      const alreadyCreated = groundSegments.filter((s) => s.jobId !== null).length
      const title = buildJobTitle(masterJob.title, alreadyCreated, groundSegments.length)

      const createdJob = await prisma.job.create({
        data: {
          parentJobId: masterJob.id,
          title,
          weightKg: masterJob.weightKg,
          pickupAddress:
            planned.pickup?.address ??
            planned.from?.address ??
            planned.from?.name ??
            masterJob.pickupAddress,
          pickupLat: toDecimal6(start.lat),
          pickupLng: toDecimal6(start.lng),
          dropAddress:
            planned.drop?.address ??
            planned.to?.address ??
            planned.to?.name ??
            masterJob.dropAddress,
          dropLat: toDecimal6(end.lat),
          dropLng: toDecimal6(end.lng),
          pickupAt: cursorTime,
          dropWindowStartAt: masterJob.dropWindowStartAt,
          dropWindowEndAt: masterJob.dropWindowEndAt,
          distanceMeters: planned.distanceMeters,
          durationSeconds: planned.durationSeconds,
          estimatedFuelCost: planned.estimatedFuelCost ?? null,
          routeType: planned.routeType ?? null,
          routeGeometry: planned.routeGeometry ?? undefined,
          driverId: null,
          status: "pending",
        },
        select: { id: true },
      })

      await prisma.$executeRaw(Prisma.sql`
        update fulfillment_segments
        set job_id = ${createdJob.id}::uuid, status = 'completed'::"FulfillmentSegmentStatus", updated_at = now()
        where id = ${next.id}::uuid
      `)
    }

    if (next.mode === "train") {
      const planned = trainPlannedSchema.parse(next.planned ?? {})
      const scheduledDep = addMinutes(cursorTime, 30)
      const scheduledArr = addMinutes(scheduledDep, planned.durationMinutes)

      const createdTrain = await prisma.trainShipment.create({
        data: {
          referenceCode: `TRN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
          status: "created",
          packageName: masterJob.title,
          weightKg: new Decimal(masterJob.weightKg),
          packageCount: 1,
          description: null,
          trainNumber: planned.trainNumber,
          trainName: planned.trainName,
          coachType: null,
          pnr: null,
          fromStationCode: planned.fromStationCode,
          fromStationName: planned.fromStationName,
          toStationCode: planned.toStationCode,
          toStationName: planned.toStationName,
          journeyDate: scheduledDep,
          scheduledDep,
          scheduledArr,
          events: {
            create: {
              type: "created",
              title: "Shipment Created",
              description: `Auto-planned from fulfillment plan ${planRow.id}`,
              occurredAt: new Date(),
            },
          },
        },
        select: { id: true },
      })

      await prisma.$executeRaw(Prisma.sql`
        update fulfillment_segments
        set train_shipment_id = ${createdTrain.id}::uuid, status = 'completed'::"FulfillmentSegmentStatus", updated_at = now()
        where id = ${next.id}::uuid
      `)
    }

    if (next.mode === "air") {
      const planned = airPlannedSchema.parse(next.planned ?? {})
      const durationSeconds = planned.durationSeconds ?? 3 * 60 * 60
      const plannedDepartureAt = addMinutes(cursorTime, 60)
      const plannedArrivalAt = addMinutes(plannedDepartureAt, Math.max(1, Math.round(durationSeconds / 60)))

      const shipmentId = await createAirShipment(prisma, {
        packageName: masterJob.title,
        weightKg: masterJob.weightKg,
        fromIcao: planned.fromAirportIcao,
        toIcao: planned.toAirportIcao,
        plannedDepartureAt,
        plannedArrivalAt,
      })

      await prisma.$executeRaw(Prisma.sql`
        update fulfillment_segments
        set shipment_id = ${shipmentId}::uuid, status = 'completed'::"FulfillmentSegmentStatus", updated_at = now()
        where id = ${next.id}::uuid
      `)
    }

    // If that was the last segment, mark plan completed.
    const remainingRows = await prisma.$queryRaw<Array<{ c: number }>>(Prisma.sql`
      select count(*)::int as c
      from fulfillment_segments
      where plan_id = ${planRow.id}::uuid and status = 'planned'::"FulfillmentSegmentStatus"
    `)
    const remaining = remainingRows[0]?.c ?? 0
    if (remaining === 0) {
      await prisma.$executeRaw(Prisma.sql`
        update fulfillment_plans
        set status = 'completed'::"FulfillmentPlanStatus", updated_at = now()
        where id = ${planRow.id}::uuid
      `)
      return { success: true, done: true, planStatus: "completed" }
    }

    return { success: true, done: false, planStatus: "executing" }
  } catch (e) {
    if (nextSegmentId) {
      try {
        await prisma.$executeRaw(Prisma.sql`
          update fulfillment_segments
          set status = 'failed'::"FulfillmentSegmentStatus", updated_at = now()
          where id = ${nextSegmentId}::uuid
        `)
      } catch {
        // ignore
      }
      try {
        const segRows = await prisma.$queryRaw<Array<{ plan_id: string }>>(Prisma.sql`
          select plan_id from fulfillment_segments where id = ${nextSegmentId}::uuid limit 1
        `)
        const segPlanId = segRows[0]?.plan_id ?? null
        if (segPlanId) {
          await prisma.$executeRaw(Prisma.sql`
            update fulfillment_plans
            set status = 'failed'::"FulfillmentPlanStatus", updated_at = now()
            where id = ${segPlanId}::uuid
          `)
        }
      } catch {
        // ignore
      }
    }
    const msg = e instanceof Error ? e.message : "Failed to execute next step"
    return { success: false, error: msg }
  }
}

export async function executeFulfillmentPlan(
  planId: string
): Promise<
  | { success: true; masterJobId: string; planId: string; createdJobIds: string[]; createdTrainShipmentIds: string[] }
  | { success: false; error: string }
> {
  try {
    const start = await startFulfillmentExecution(planId)
    if (!start.success) return start

    const createdJobIds: string[] = []
    const createdTrainShipmentIds: string[] = []

    for (let i = 0; i < 50; i++) {
      const step = await executeNextFulfillmentStep(planId)
      if (!step.success) return step
      if (step.done) break
    }

    // Best-effort: collect created ids from segments
    const segRows = await prisma.$queryRaw<
      Array<{ master_job_id: string; job_id: string | null; train_shipment_id: string | null }>
    >(Prisma.sql`
      select p.master_job_id, s.job_id, s.train_shipment_id
      from fulfillment_plans p
      left join fulfillment_segments s on s.plan_id = p.id
      where p.id = ${planId}::uuid
    `)
    for (const r of segRows) {
      if (r.job_id) createdJobIds.push(r.job_id)
      if (r.train_shipment_id) createdTrainShipmentIds.push(r.train_shipment_id)
    }
    const masterJobId = segRows[0]?.master_job_id ?? ""

    return { success: true, masterJobId, planId, createdJobIds, createdTrainShipmentIds }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to execute plan"
    return { success: false, error: msg }
  }
}

export async function getFulfillmentPlan(planId: string) {
  const parsedPlanId = planIdSchema.parse(planId)
  const planRows = await prisma.$queryRaw<
    Array<{ id: string; master_job_id: string; status: string; objective: string; selected_plan_key: string | null; options: unknown; updated_at: Date }>
  >(Prisma.sql`
    select id, master_job_id, status::text as status, objective::text as objective, selected_plan_key, options, updated_at
    from fulfillment_plans
    where id = ${parsedPlanId}::uuid
    limit 1
  `)
  const plan = planRows[0] ?? null
  if (!plan) return null
  const segments = await prisma.$queryRaw<DbSegmentRow[]>(Prisma.sql`
    select
      id,
      plan_id as "planId",
      sort_order as "sortOrder",
      mode::text as mode,
      status::text as status,
      planned,
      job_id as "jobId",
      shipment_id as "shipmentId",
      train_shipment_id as "trainShipmentId"
    from fulfillment_segments
    where plan_id = ${parsedPlanId}::uuid
    order by sort_order asc
  `)
  return { ...plan, segments }
}



