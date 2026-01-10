import { z } from "zod"

const lngSchema = z
  .number()
  .finite()
  .refine((v) => v >= -180 && v <= 180, "lng must be between -180 and 180")

const latSchema = z
  .number()
  .finite()
  .refine((v) => v >= -90 && v <= 90, "lat must be between -90 and 90")

const isoDateTimeSchema = z
  .string()
  .min(1, "required")
  .refine((v) => !Number.isNaN(new Date(v).getTime()), "invalid datetime")

export const jobIdSchema = z.string().uuid()

export const routeTypeSchema = z.enum(["fastest", "economy", "via_gas_station"])

export const lineStringGeometrySchema = z.object({
  type: z.literal("LineString"),
  coordinates: z.array(z.tuple([z.number(), z.number()])),
})

export const routeGeoJsonSchema = z.object({
  type: z.literal("Feature"),
  properties: z.object({}).optional(),
  geometry: lineStringGeometrySchema,
})

export const cargoUnitSchema = z.enum(["kg", "ltr", "pcs", "box", "pkg"])

export const jobUpsertSchema = z
  .object({
    title: z.string().min(1).max(200),
    weightKg: z.number().int().positive(),
    cargoName: z.string().max(200).nullish(),
    cargoQuantity: z.number().nonnegative().nullish(),
    cargoUnit: cargoUnitSchema.nullish(),
    pickupAddress: z.string().min(1).max(500),
    pickupLng: lngSchema,
    pickupLat: latSchema,
    dropAddress: z.string().min(1).max(500),
    dropLng: lngSchema,
    dropLat: latSchema,
    pickupAt: isoDateTimeSchema,
    dropWindowStartAt: isoDateTimeSchema,
    dropWindowEndAt: isoDateTimeSchema,
    distanceMeters: z.number().int().nonnegative(),
    durationSeconds: z.number().int().nonnegative().nullish(),
    routeType: routeTypeSchema.nullish(),
    routeGeometry: routeGeoJsonSchema.nullish(),
    estimatedFuelCost: z.number().int().nonnegative().nullish(),
    driverId: z.string().uuid().nullish(),
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

export const lngLatSchema = z.object({
  lng: lngSchema,
  lat: latSchema,
})


