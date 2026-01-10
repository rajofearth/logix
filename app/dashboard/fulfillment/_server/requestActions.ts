"use server"

import { z } from "zod"

import { createJob } from "@/app/dashboard/jobs/_server/jobActions"
import { getMultipleRoutes } from "@/app/dashboard/jobs/_server/getMultipleRoutes"
import type { JobDTO, RouteType, CargoUnit } from "@/app/dashboard/jobs/_types"
import { cargoUnitSchema } from "@/app/dashboard/jobs/_server/jobSchemas"

const routeTypeSchema = z.enum(["fastest", "economy", "via_gas_station"])

const requestSchema = z
  .object({
    title: z.string().min(1).max(200),
    weightKg: z.number().int().positive(),
    cargoName: z.string().max(200).nullish(),
    cargoQuantity: z.number().nonnegative().nullish(),
    cargoUnit: cargoUnitSchema.nullish(),
    pickupAddress: z.string().min(1).max(500),
    dropAddress: z.string().min(1).max(500),
    pickup: z.object({
      lat: z.number().finite(),
      lng: z.number().finite(),
    }),
    drop: z.object({
      lat: z.number().finite(),
      lng: z.number().finite(),
    }),
    pickupAt: z.string().datetime(),
    dropWindowStartAt: z.string().datetime(),
    dropWindowEndAt: z.string().datetime(),
    preferredRouteType: routeTypeSchema.optional(),
  })
  .superRefine((val, ctx) => {
    const pickupAt = new Date(val.pickupAt).getTime()
    const dropStart = new Date(val.dropWindowStartAt).getTime()
    const dropEnd = new Date(val.dropWindowEndAt).getTime()

    if (dropStart > dropEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "dropWindowStartAt must be <= dropWindowEndAt",
        path: ["dropWindowStartAt"],
      })
    }
    if (pickupAt > dropEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "pickupAt must be <= dropWindowEndAt",
        path: ["pickupAt"],
      })
    }
  })

export type CreateMasterJobFromRequestInput = z.infer<typeof requestSchema>

export async function createMasterJobFromRequest(
  input: CreateMasterJobFromRequestInput
): Promise<JobDTO> {
  const parsed = requestSchema.parse(input)

  const routeRes = await getMultipleRoutes(
    { lat: parsed.pickup.lat, lng: parsed.pickup.lng },
    { lat: parsed.drop.lat, lng: parsed.drop.lng }
  )

  const preferred: RouteType = parsed.preferredRouteType ?? "fastest"
  const chosen =
    routeRes.routes.find((r) => r.type === preferred) ?? routeRes.routes[0]

  if (!chosen) {
    throw new Error("No route options available for this request")
  }

  return createJob({
    title: parsed.title.trim(),
    weightKg: parsed.weightKg,
    cargoName: parsed.cargoName?.trim() || null,
    cargoQuantity: parsed.cargoQuantity ?? null,
    cargoUnit: parsed.cargoUnit ?? null,
    pickupAddress: parsed.pickupAddress.trim(),
    pickupLat: parsed.pickup.lat,
    pickupLng: parsed.pickup.lng,
    dropAddress: parsed.dropAddress.trim(),
    dropLat: parsed.drop.lat,
    dropLng: parsed.drop.lng,
    pickupAt: parsed.pickupAt,
    dropWindowStartAt: parsed.dropWindowStartAt,
    dropWindowEndAt: parsed.dropWindowEndAt,
    distanceMeters: chosen.distanceMeters,
    durationSeconds: chosen.durationSeconds,
    routeType: chosen.type,
    routeGeometry: chosen.routeGeoJson,
    estimatedFuelCost: chosen.estimatedFuelCost,
    driverId: null,
  })
}

