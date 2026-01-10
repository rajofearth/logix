"use server"

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { Decimal } from "@prisma/client/runtime/index-browser"

const planIdSchema = z.string().uuid()

function decimalToNumber(value: unknown): number {
  if (typeof value === "number") return value
  if (typeof value === "string") return Number(value)
  if (value && typeof value === "object") {
    const maybe = value as { toNumber?: () => number }
    if (typeof maybe.toNumber === "function") return maybe.toNumber()
  }
  return Number(value)
}

export type FulfillmentRequestDTO = {
  id: string
  title: string
  pickupAddress: string
  dropAddress: string
  status: string
  createdAt: string
  updatedAt: string
  plans: FulfillmentPlanListItemDTO[]
}

export type FulfillmentPlanListItemDTO = {
  id: string
  status: string
  objective: string
  selectedPlanKey: string | null
  createdAt: string
  updatedAt: string
}

export type FulfillmentPlanDetailsDTO = {
  id: string
  masterJobId: string
  status: string
  objective: string
  selectedPlanKey: string | null
  createdAt: string
  updatedAt: string
  masterJob: {
    id: string
    title: string
    pickupAddress: string
    dropAddress: string
    weightKg: number
    cargoName: string | null
    status: string
    createdAt: string
  }
  segments: FulfillmentSegmentDTO[]
}

export type FulfillmentSegmentDTO = {
  id: string
  sortOrder: number
  mode: string
  status: string
  jobId: string | null
  shipmentId: string | null
  trainShipmentId: string | null
  createdAt: string
  updatedAt: string
}

const listInputSchema = z.object({
  limit: z.number().int().positive().max(100).default(20),
  cursor: z.string().uuid().optional(),
})

export async function listFulfillmentRequestsWithPlans(
  input?: z.infer<typeof listInputSchema>
): Promise<{ requests: FulfillmentRequestDTO[]; nextCursor: string | null }> {
  const parsed = listInputSchema.parse(input ?? {})
  
  const jobs = await prisma.job.findMany({
    where: {
      fulfillmentPlans: {
        some: {},
      },
    },
    include: {
      fulfillmentPlans: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          status: true,
          objective: true,
          selectedPlanKey: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: parsed.limit + 1,
    ...(parsed.cursor ? { cursor: { id: parsed.cursor }, skip: 1 } : {}),
  })

  const hasNext = jobs.length > parsed.limit
  const items = hasNext ? jobs.slice(0, parsed.limit) : jobs
  const nextCursor = hasNext && items.length > 0 ? items[items.length - 1]?.id ?? null : null

  const requests: FulfillmentRequestDTO[] = items.map((job) => ({
    id: job.id,
    title: job.title,
    pickupAddress: job.pickupAddress,
    dropAddress: job.dropAddress,
    status: job.status,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
    plans: job.fulfillmentPlans.map((plan) => ({
      id: plan.id,
      status: plan.status,
      objective: plan.objective,
      selectedPlanKey: plan.selectedPlanKey,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    })),
  }))

  return {
    requests,
    nextCursor,
  }
}

export async function getFulfillmentPlanDetails(
  planId: string
): Promise<FulfillmentPlanDetailsDTO> {
  const parsedPlanId = planIdSchema.parse(planId)

  const plan = await prisma.fulfillmentPlan.findUnique({
    where: { id: parsedPlanId },
    include: {
      masterJob: {
        select: {
          id: true,
          title: true,
          pickupAddress: true,
          dropAddress: true,
          weightKg: true,
          cargoName: true,
          status: true,
          createdAt: true,
        },
      },
      segments: {
        orderBy: {
          sortOrder: "asc",
        },
        select: {
          id: true,
          sortOrder: true,
          mode: true,
          status: true,
          jobId: true,
          shipmentId: true,
          trainShipmentId: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  })

  if (!plan) {
    throw new Error("Plan not found")
  }

  return {
    id: plan.id,
    masterJobId: plan.masterJobId,
    status: plan.status,
    objective: plan.objective,
    selectedPlanKey: plan.selectedPlanKey,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
    masterJob: {
      id: plan.masterJob.id,
      title: plan.masterJob.title,
      pickupAddress: plan.masterJob.pickupAddress,
      dropAddress: plan.masterJob.dropAddress,
      weightKg: plan.masterJob.weightKg,
      cargoName: plan.masterJob.cargoName,
      status: plan.masterJob.status,
      createdAt: plan.masterJob.createdAt.toISOString(),
    },
    segments: plan.segments.map((seg) => ({
      id: seg.id,
      sortOrder: seg.sortOrder,
      mode: seg.mode,
      status: seg.status,
      jobId: seg.jobId,
      shipmentId: seg.shipmentId,
      trainShipmentId: seg.trainShipmentId,
      createdAt: seg.createdAt.toISOString(),
      updatedAt: seg.updatedAt.toISOString(),
    })),
  }
}
