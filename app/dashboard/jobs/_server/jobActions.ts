"use server"

import type { JobDTO, JobUpsertInput, JobStatus, RouteType, GeoJsonFeature, LineStringGeometry, CargoUnit } from "../_types"
import { prisma } from "@/lib/prisma"
import { jobIdSchema, jobUpsertSchema, routeTypeSchema, routeGeoJsonSchema } from "./jobSchemas"
import { Decimal } from "@prisma/client/runtime/index-browser"
import { z } from "zod"
import { notify } from "@/lib/notifications/notify"

function decimalToNumber(value: unknown): number {
  if (typeof value === "number") return value
  if (typeof value === "string") return Number(value)
  if (value && typeof value === "object") {
    const maybe = value as { toNumber?: () => number }
    if (typeof maybe.toNumber === "function") return maybe.toNumber()
  }
  return Number(value)
}

function toDecimal6(value: number): Decimal {
  // keep consistent precision for Decimal(9,6)
  return new Decimal(value.toFixed(6))
}

function jobToDto(job: {
  id: string
  title: string
  weightKg: number
  cargoName: string | null
  cargoQuantity: unknown
  cargoUnit: string | null
  pickupAddress: string
  pickupLat: unknown
  pickupLng: unknown
  dropAddress: string
  dropLat: unknown
  dropLng: unknown
  pickupAt: Date
  dropWindowStartAt: Date
  dropWindowEndAt: Date
  distanceMeters: number
  durationSeconds: number | null
  routeType: string | null
  routeGeometry: unknown
  estimatedFuelCost: number | null
  status: string
  driverId: string | null
  driver?: { name: string } | null
  createdAt: Date
  updatedAt: Date
}): JobDTO {
  return {
    id: job.id,
    title: job.title,
    weightKg: job.weightKg,
    cargoName: job.cargoName,
    cargoQuantity: job.cargoQuantity ? decimalToNumber(job.cargoQuantity) : null,
    cargoUnit: job.cargoUnit as CargoUnit | null,
    pickupAddress: job.pickupAddress,
    pickupLat: decimalToNumber(job.pickupLat),
    pickupLng: decimalToNumber(job.pickupLng),
    dropAddress: job.dropAddress,
    dropLat: decimalToNumber(job.dropLat),
    dropLng: decimalToNumber(job.dropLng),
    pickupAt: job.pickupAt.toISOString(),
    dropWindowStartAt: job.dropWindowStartAt.toISOString(),
    dropWindowEndAt: job.dropWindowEndAt.toISOString(),
    distanceMeters: job.distanceMeters,
    durationSeconds: job.durationSeconds,
    routeType: job.routeType as RouteType | null,
    routeGeometry: job.routeGeometry as GeoJsonFeature<LineStringGeometry> | null,
    estimatedFuelCost: job.estimatedFuelCost,
    status: job.status as JobStatus,
    driverId: job.driverId,
    driverName: job.driver?.name ?? null,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  }
}

export async function listJobs(): Promise<JobDTO[]> {
  const jobs = await prisma.job.findMany({
    include: { driver: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  })
  return jobs.map(jobToDto)
}

export async function getJob(id: string): Promise<JobDTO> {
  const parsedId = jobIdSchema.parse(id)
  const job = await prisma.job.findUnique({
    where: { id: parsedId },
    include: { driver: { select: { name: true } } },
  })
  if (!job) {
    throw new Error("Job not found")
  }
  return jobToDto(job)
}

export async function createJob(input: JobUpsertInput): Promise<JobDTO> {
  const parsed = jobUpsertSchema.parse(input)
  const created = await prisma.job.create({
    data: {
      title: parsed.title,
      weightKg: parsed.weightKg,
      cargoName: parsed.cargoName ?? null,
      cargoQuantity: parsed.cargoQuantity ? new Decimal(parsed.cargoQuantity.toFixed(2)) : null,
      cargoUnit: parsed.cargoUnit ?? null,
      pickupAddress: parsed.pickupAddress,
      pickupLng: toDecimal6(parsed.pickupLng),
      pickupLat: toDecimal6(parsed.pickupLat),
      dropAddress: parsed.dropAddress,
      dropLng: toDecimal6(parsed.dropLng),
      dropLat: toDecimal6(parsed.dropLat),
      pickupAt: new Date(parsed.pickupAt),
      dropWindowStartAt: new Date(parsed.dropWindowStartAt),
      dropWindowEndAt: new Date(parsed.dropWindowEndAt),
      distanceMeters: parsed.distanceMeters,
      durationSeconds: parsed.durationSeconds ?? null,
      routeType: parsed.routeType ?? null,
      routeGeometry: parsed.routeGeometry ?? undefined,
      estimatedFuelCost: parsed.estimatedFuelCost ?? null,
      driverId: parsed.driverId ?? null,
    },
    include: { driver: { select: { name: true } } },
  })
  try {
    await notify.jobCreated({
      jobId: created.id,
      title: created.title,
      driverName: created.driver?.name ?? null,
    })
  } catch (e) {
    console.error("[Notifications] createJob notify error:", e)
  }
  return jobToDto(created)
}

export async function updateJob(
  id: string,
  input: JobUpsertInput
): Promise<JobDTO> {
  const parsedId = jobIdSchema.parse(id)
  const parsed = jobUpsertSchema.parse(input)
  const updated = await prisma.job.update({
    where: { id: parsedId },
    data: {
      title: parsed.title,
      weightKg: parsed.weightKg,
      cargoName: parsed.cargoName ?? null,
      cargoQuantity: parsed.cargoQuantity ? new Decimal(parsed.cargoQuantity.toFixed(2)) : null,
      cargoUnit: parsed.cargoUnit ?? null,
      pickupAddress: parsed.pickupAddress,
      pickupLng: toDecimal6(parsed.pickupLng),
      pickupLat: toDecimal6(parsed.pickupLat),
      dropAddress: parsed.dropAddress,
      dropLng: toDecimal6(parsed.dropLng),
      dropLat: toDecimal6(parsed.dropLat),
      pickupAt: new Date(parsed.pickupAt),
      dropWindowStartAt: new Date(parsed.dropWindowStartAt),
      dropWindowEndAt: new Date(parsed.dropWindowEndAt),
      distanceMeters: parsed.distanceMeters,
      durationSeconds: parsed.durationSeconds ?? null,
      routeType: parsed.routeType ?? null,
      routeGeometry: parsed.routeGeometry ?? undefined,
      estimatedFuelCost: parsed.estimatedFuelCost ?? null,
      driverId: parsed.driverId ?? null,
    },
    include: { driver: { select: { name: true } } },
  })
  try {
    await notify.jobUpdated({ jobId: updated.id, title: updated.title })
  } catch (e) {
    console.error("[Notifications] updateJob notify error:", e)
  }
  return jobToDto(updated)
}

export async function deleteJob(id: string): Promise<void> {
  const parsedId = jobIdSchema.parse(id)
  const existing = await prisma.job.findUnique({
    where: { id: parsedId },
    select: { title: true },
  })
  await prisma.job.delete({ where: { id: parsedId } })
  try {
    await notify.jobDeleted({ jobId: parsedId, title: existing?.title ?? null })
  } catch (e) {
    console.error("[Notifications] deleteJob notify error:", e)
  }
}

const assignDriverSchema = z.object({
  jobId: z.string().uuid(),
  driverId: z.string().uuid().nullable(),
})

export async function assignDriver(
  jobId: string,
  driverId: string | null
): Promise<JobDTO> {
  const parsed = assignDriverSchema.parse({ jobId, driverId })

  // If assigning a driver, verify they are available
  if (parsed.driverId) {
    const driver = await prisma.driver.findUnique({
      where: { id: parsed.driverId },
      select: { status: true },
    })
    if (!driver) {
      throw new Error("Driver not found")
    }
    if (driver.status !== "available") {
      throw new Error("Driver is not available")
    }
  }

  const updated = await prisma.job.update({
    where: { id: parsed.jobId },
    data: { driverId: parsed.driverId },
    include: { driver: { select: { name: true } } },
  })

  try {
    await notify.jobUpdated({ jobId: updated.id, title: updated.title })
  } catch (e) {
    console.error("[Notifications] assignDriver notify error:", e)
  }

  return jobToDto(updated)
}

const updateJobRouteSchema = z.object({
  jobId: z.string().uuid(),
  routeType: routeTypeSchema.nullish(),
  routeGeometry: routeGeoJsonSchema.nullish(),
  distanceMeters: z.number().int().nonnegative().nullish(),
  durationSeconds: z.number().int().nonnegative().nullish(),
  estimatedFuelCost: z.number().int().nonnegative().nullish(),
})

export async function updateJobRoute(
  jobId: string,
  routeType: RouteType | null,
  routeGeometry: GeoJsonFeature<LineStringGeometry> | null,
  distanceMeters: number | null,
  durationSeconds: number | null,
  estimatedFuelCost: number | null
): Promise<JobDTO> {
  const parsed = updateJobRouteSchema.parse({
    jobId,
    routeType,
    routeGeometry,
    distanceMeters,
    durationSeconds,
    estimatedFuelCost,
  })

  const updated = await prisma.job.update({
    where: { id: parsed.jobId },
    data: {
      routeType: parsed.routeType ?? null,
      routeGeometry: parsed.routeGeometry ?? undefined,
      distanceMeters: parsed.distanceMeters ?? undefined,
      durationSeconds: parsed.durationSeconds ?? null,
      estimatedFuelCost: parsed.estimatedFuelCost ?? null,
    },
    include: { driver: { select: { name: true } } },
  })

  try {
    await notify.jobUpdated({ jobId: updated.id, title: updated.title })
  } catch (e) {
    console.error("[Notifications] updateJobRoute notify error:", e)
  }

  return jobToDto(updated)
}
