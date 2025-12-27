"use server"

import type { JobDTO, JobUpsertInput } from "../_types"
import { prisma } from "@/lib/prisma"
import { jobIdSchema, jobUpsertSchema } from "./jobSchemas"
import { Decimal } from "@prisma/client/runtime/index-browser"

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
  createdAt: Date
  updatedAt: Date
}): JobDTO {
  return {
    id: job.id,
    title: job.title,
    weightKg: job.weightKg,
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
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  }
}

export async function listJobs(): Promise<JobDTO[]> {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
  })
  return jobs.map(jobToDto)
}

export async function getJob(id: string): Promise<JobDTO> {
  const parsedId = jobIdSchema.parse(id)
  const job = await prisma.job.findUnique({
    where: { id: parsedId },
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
    },
  })
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
    },
  })
  return jobToDto(updated)
}

export async function deleteJob(id: string): Promise<void> {
  const parsedId = jobIdSchema.parse(id)
  await prisma.job.delete({ where: { id: parsedId } })
}


