"use server"

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { Decimal } from "@prisma/client/runtime/index-browser"
import type { LngLat } from "@/app/dashboard/jobs/_types"
import { getRandomCarrier, generateFlightNumber } from "@/lib/carriers/carriers-data"

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
    const plan = await prisma.fulfillmentPlan.findUnique({
      where: { id: parsedPlanId },
      select: { id: true, status: true },
    })
    if (!plan) return { success: false, error: "Plan not found" }
    if (plan.status !== "draft") return { success: false, error: "Plan is not executable" }

    await prisma.fulfillmentPlan.update({
      where: { id: plan.id },
      data: {
        status: "executing",
        updatedAt: new Date(),
      },
    })

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
  planId: string,
  opts?: { interactive?: boolean }
): Promise<
  | { success: true; done: boolean; planStatus: string; needsUserAction?: boolean; segmentId?: string; mode?: "ground" | "train" | "air"; jobId?: string; trainShipmentId?: string; shipmentId?: string }
  | { success: false; error: string }
> {
  const interactive = opts?.interactive ?? false
  let nextSegmentId: string | null = null
  try {
    const parsedPlanId = planIdSchema.parse(planId)

    const plan = await prisma.fulfillmentPlan.findUnique({
      where: { id: parsedPlanId },
      include: {
        segments: {
          orderBy: { sortOrder: "asc" },
        },
      },
    })
    if (!plan) return { success: false, error: "Plan not found" }
    if (plan.status !== "executing") {
      return { success: false, error: "Plan is not currently executing" }
    }

    const segments = plan.segments.map((s) => ({
      id: s.id,
      planId: s.planId,
      sortOrder: s.sortOrder,
      mode: s.mode,
      status: s.status,
      planned: s.planned,
      jobId: s.jobId,
      shipmentId: s.shipmentId,
      trainShipmentId: s.trainShipmentId,
    }))

    const next = segments.find((s) => s.status === "planned") ?? null
    if (!next) {
      await prisma.fulfillmentPlan.update({
        where: { id: plan.id },
        data: {
          status: "completed",
          updatedAt: new Date(),
        },
      })
      return { success: true, done: true, planStatus: "completed" }
    }
    nextSegmentId = next.id

    const masterJob = await prisma.job.findUnique({
      where: { id: plan.masterJobId },
      select: {
        id: true,
        title: true,
        weightKg: true,
        cargoName: true,
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
    await prisma.fulfillmentSegment.update({
      where: { id: next.id },
      data: {
        status: "in_progress",
        updatedAt: new Date(),
      },
    })

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

      await prisma.fulfillmentSegment.update({
        where: { id: next.id },
        data: {
          jobId: createdJob.id,
          status: interactive ? "in_progress" : "completed",
          updatedAt: new Date(),
        },
      })

      if (interactive) {
        return {
          success: true,
          done: false,
          planStatus: "executing",
          needsUserAction: true,
          segmentId: next.id,
          mode: "ground",
          jobId: createdJob.id,
        }
      }
    }

    if (next.mode === "train") {
      const planned = trainPlannedSchema.parse(next.planned ?? {})
      const scheduledDep = addMinutes(cursorTime, 30)
      const scheduledArr = addMinutes(scheduledDep, planned.durationMinutes)

      const createdTrain = await prisma.trainShipment.create({
        data: {
          referenceCode: `TRN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
          status: "created",
          packageName: masterJob.cargoName ?? masterJob.title,
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
              description: `Auto-planned from fulfillment plan ${plan.id}`,
              occurredAt: new Date(),
            },
          },
        },
        select: { id: true },
      })

      await prisma.fulfillmentSegment.update({
        where: { id: next.id },
        data: {
          trainShipmentId: createdTrain.id,
          status: interactive ? "in_progress" : "completed",
          updatedAt: new Date(),
        },
      })

      if (interactive) {
        return {
          success: true,
          done: false,
          planStatus: "executing",
          needsUserAction: true,
          segmentId: next.id,
          mode: "train",
          trainShipmentId: createdTrain.id,
        }
      }
    }

    if (next.mode === "air") {
      const planned = airPlannedSchema.parse(next.planned ?? {})
      const durationSeconds = planned.durationSeconds ?? 3 * 60 * 60
      const plannedDepartureAt = addMinutes(cursorTime, 60)
      const plannedArrivalAt = addMinutes(plannedDepartureAt, Math.max(1, Math.round(durationSeconds / 60)))

      const shipmentId = await createAirShipment(prisma, {
        packageName: masterJob.cargoName ?? masterJob.title,
        weightKg: masterJob.weightKg,
        fromIcao: planned.fromAirportIcao,
        toIcao: planned.toAirportIcao,
        plannedDepartureAt,
        plannedArrivalAt,
      })

      await prisma.fulfillmentSegment.update({
        where: { id: next.id },
        data: {
          shipmentId,
          status: interactive ? "in_progress" : "completed",
          updatedAt: new Date(),
        },
      })

      if (interactive) {
        return {
          success: true,
          done: false,
          planStatus: "executing",
          needsUserAction: true,
          segmentId: next.id,
          mode: "air",
          shipmentId,
        }
      }
    }

    // If that was the last segment, mark plan completed.
    const remaining = await prisma.fulfillmentSegment.count({
      where: {
        planId: plan.id,
        status: "planned",
      },
    })
    if (remaining === 0) {
      await prisma.fulfillmentPlan.update({
        where: { id: plan.id },
        data: {
          status: "completed",
          updatedAt: new Date(),
        },
      })
      return { success: true, done: true, planStatus: "completed" }
    }

    return { success: true, done: false, planStatus: "executing" }
  } catch (e) {
    if (nextSegmentId) {
      try {
        await prisma.fulfillmentSegment.update({
          where: { id: nextSegmentId },
          data: {
            status: "failed",
            updatedAt: new Date(),
          },
        })
      } catch {
        // ignore
      }
      try {
        const segment = await prisma.fulfillmentSegment.findUnique({
          where: { id: nextSegmentId },
          select: { planId: true },
        })
        if (segment) {
          await prisma.fulfillmentPlan.update({
            where: { id: segment.planId },
            data: {
              status: "failed",
              updatedAt: new Date(),
            },
          })
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
    const plan = await prisma.fulfillmentPlan.findUnique({
      where: { id: planId },
      include: {
        segments: {
          select: {
            jobId: true,
            trainShipmentId: true,
          },
        },
      },
    })
    if (plan) {
      for (const segment of plan.segments) {
        if (segment.jobId) createdJobIds.push(segment.jobId)
        if (segment.trainShipmentId) createdTrainShipmentIds.push(segment.trainShipmentId)
      }
    }
    const masterJobId = plan?.masterJobId ?? ""

    return { success: true, masterJobId, planId, createdJobIds, createdTrainShipmentIds }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to execute plan"
    return { success: false, error: msg }
  }
}

export async function completeFulfillmentSegment(
  planId: string,
  segmentId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const parsedPlanId = planIdSchema.parse(planId)
    const parsedSegmentId = z.string().uuid().parse(segmentId)

    const segment = await prisma.fulfillmentSegment.findUnique({
      where: { id: parsedSegmentId },
      select: {
        id: true,
        planId: true,
        status: true,
      },
    })

    if (!segment) return { success: false, error: "Segment not found" }
    if (segment.planId !== parsedPlanId) return { success: false, error: "Segment does not belong to plan" }
    if (segment.status !== "in_progress") return { success: false, error: "Segment is not in progress" }

    await prisma.fulfillmentSegment.update({
      where: { id: parsedSegmentId },
      data: {
        status: "completed",
        updatedAt: new Date(),
      },
    })

    // Check if all segments are completed
    const remaining = await prisma.fulfillmentSegment.count({
      where: {
        planId: parsedPlanId,
        status: { in: ["planned", "in_progress"] },
      },
    })

    if (remaining === 0) {
      await prisma.fulfillmentPlan.update({
        where: { id: parsedPlanId },
        data: {
          status: "completed",
          updatedAt: new Date(),
        },
      })
    }

    return { success: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to complete segment"
    return { success: false, error: msg }
  }
}

export async function getFulfillmentPlan(planId: string) {
  const parsedPlanId = planIdSchema.parse(planId)
  return await prisma.fulfillmentPlan.findUnique({
    where: { id: parsedPlanId },
    include: {
      segments: {
        orderBy: { sortOrder: "asc" },
      },
    },
  })
}



