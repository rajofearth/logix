"use server"

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { getMultipleRoutes } from "@/app/dashboard/jobs/_server/getMultipleRoutes"
import type { JobDTO, LngLat, RouteOption } from "@/app/dashboard/jobs/_types"
import { getJob } from "@/app/dashboard/jobs/_server/jobActions"
import { getNearestStations, estimateRailDistanceMeters } from "@/lib/fulfillment/nodes"
import { getNearestAirports, estimateAirLeg } from "@/lib/fulfillment/air"
import { computePlanScore, sortOptionsBestFirst } from "@/lib/fulfillment/scoring"
import type {
  CandidatePlanOption,
  CandidateSegment,
  FulfillmentObjective,
  ScoreBreakdown,
} from "@/lib/fulfillment/types"
import { irctcConnector } from "@/lib/trains"
import type { Prisma } from "@prisma/client"

const jobIdSchema = z.string().uuid()

type PlanResult = {
  planId: string
  selectedPlanKey: string
  options: CandidatePlanOption[]
}

function minutesFromSeconds(seconds: number): number {
  return Math.max(0, Math.round(seconds / 60))
}

function parseDurationMinutes(input: string): number | null {
  const s = input.trim()

  // common "HH:MM"
  const hhmm = /^(\d{1,2}):(\d{2})$/.exec(s)
  if (hhmm) {
    const h = Number(hhmm[1])
    const m = Number(hhmm[2])
    if (Number.isFinite(h) && Number.isFinite(m)) return h * 60 + m
  }

  // "Xh Ym" or "X h Y m"
  const hm = /(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?/i.exec(s)
  if (hm) {
    const h = hm[1] ? Number(hm[1]) : 0
    const m = hm[2] ? Number(hm[2]) : 0
    const total = h * 60 + m
    return total > 0 ? total : null
  }

  return null
}

function estimateTrainCostRupees(weightKg: number, distanceMeters: number): number {
  // heuristic: base + per-kg-km (can be replaced by real tariffs)
  const km = Math.max(1, distanceMeters / 1000)
  const base = 250
  const perKgKm = 0.35
  return Math.round(base + weightKg * km * perKgKm)
}

function buildRoadOnlyOption(
  job: JobDTO,
  route: RouteOption,
  objective: FulfillmentObjective
): CandidatePlanOption {
  const etaMinutes = minutesFromSeconds(route.durationSeconds)
  const breakdown: ScoreBreakdown = {
    etaMinutes,
    estimatedCost: route.estimatedFuelCost,
    reliability: 0.85,
    penaltyLateMinutes: 0,
  }

  const score = computePlanScore(breakdown, objective)

  const segments: CandidateSegment[] = [
    {
      mode: "ground",
      title: "Ground delivery",
      planned: {
        pickup: { lat: job.pickupLat, lng: job.pickupLng, address: job.pickupAddress },
        drop: { lat: job.dropLat, lng: job.dropLng, address: job.dropAddress },
        routeType: route.type,
        distanceMeters: route.distanceMeters,
        durationSeconds: route.durationSeconds,
        estimatedFuelCost: route.estimatedFuelCost,
        routeGeometry: route.routeGeoJson,
      },
    },
  ]

  return {
    key: `road_${route.type}`,
    label: `Road-only (${route.type})`,
    segments,
    score,
    breakdown,
  }
}

async function buildRoadTrainRoadOption(
  job: JobDTO,
  objective: FulfillmentObjective
): Promise<CandidatePlanOption | null> {
  const pickup: LngLat = { lat: job.pickupLat, lng: job.pickupLng }
  const drop: LngLat = { lat: job.dropLat, lng: job.dropLng }

  const [fromStation] = getNearestStations(pickup, 1)
  const [toStation] = getNearestStations(drop, 1)

  if (!fromStation || !toStation) return null

  // Parallelize train search and ground legs.
  const [trainSearch, pickupToStation, stationToDrop] = await Promise.all([
    irctcConnector.searchTrains(fromStation.code, toStation.code),
    getMultipleRoutes(pickup, { lat: fromStation.latitude, lng: fromStation.longitude }),
    getMultipleRoutes({ lat: toStation.latitude, lng: toStation.longitude }, drop),
  ])

  if (!trainSearch.success || trainSearch.data.length === 0) return null

  const bestTrain = trainSearch.data[0]
  const trainDurationMinutes = parseDurationMinutes(bestTrain.duration) ?? null
  if (!trainDurationMinutes) return null

  const leg1 = pickupToStation.routes[0]
  const leg3 = stationToDrop.routes[0]
  if (!leg1 || !leg3) return null

  const railDistanceMeters = estimateRailDistanceMeters(
    { lat: fromStation.latitude, lng: fromStation.longitude },
    { lat: toStation.latitude, lng: toStation.longitude }
  )

  const cost =
    leg1.estimatedFuelCost +
    leg3.estimatedFuelCost +
    estimateTrainCostRupees(job.weightKg, railDistanceMeters)

  const etaMinutes =
    minutesFromSeconds(leg1.durationSeconds) +
    trainDurationMinutes +
    minutesFromSeconds(leg3.durationSeconds)

  const breakdown: ScoreBreakdown = {
    etaMinutes,
    estimatedCost: cost,
    reliability: 0.75,
    penaltyLateMinutes: 0,
  }

  const score = computePlanScore(breakdown, objective)

  const segments: CandidateSegment[] = [
    {
      mode: "ground",
      title: `Pickup to station (${fromStation.code})`,
      planned: {
        from: { lat: job.pickupLat, lng: job.pickupLng, address: job.pickupAddress },
        to: { lat: fromStation.latitude, lng: fromStation.longitude, name: fromStation.name, code: fromStation.code },
        routeType: leg1.type,
        distanceMeters: leg1.distanceMeters,
        durationSeconds: leg1.durationSeconds,
        estimatedFuelCost: leg1.estimatedFuelCost,
        routeGeometry: leg1.routeGeoJson,
      },
    },
    {
      mode: "train",
      title: `Train (${fromStation.code} → ${toStation.code})`,
      planned: {
        trainNumber: bestTrain.trainNumber,
        trainName: bestTrain.trainName,
        fromStationCode: fromStation.code,
        fromStationName: fromStation.name,
        toStationCode: toStation.code,
        toStationName: toStation.name,
        durationMinutes: trainDurationMinutes,
        estimatedRailDistanceMeters: railDistanceMeters,
        runningDays: bestTrain.runningDays,
      },
    },
    {
      mode: "ground",
      title: `Station to drop (${toStation.code})`,
      planned: {
        from: { lat: toStation.latitude, lng: toStation.longitude, name: toStation.name, code: toStation.code },
        to: { lat: job.dropLat, lng: job.dropLng, address: job.dropAddress },
        routeType: leg3.type,
        distanceMeters: leg3.distanceMeters,
        durationSeconds: leg3.durationSeconds,
        estimatedFuelCost: leg3.estimatedFuelCost,
        routeGeometry: leg3.routeGeoJson,
      },
    },
  ]

  return {
    key: "road_train_road",
    label: "Road + Train + Road",
    segments,
    score,
    breakdown,
  }
}

async function buildRoadAirRoadOption(
  job: JobDTO,
  objective: FulfillmentObjective
): Promise<CandidatePlanOption | null> {
  const pickup: LngLat = { lat: job.pickupLat, lng: job.pickupLng }
  const drop: LngLat = { lat: job.dropLat, lng: job.dropLng }

  const [fromAirport] = getNearestAirports(pickup, 1)
  const [toAirport] = getNearestAirports(drop, 1)
  if (!fromAirport || !toAirport) return null

  // ground legs to/from airports (parallel)
  const [pickupToAirport, airportToDrop] = await Promise.all([
    getMultipleRoutes(pickup, { lat: fromAirport.latitude, lng: fromAirport.longitude }),
    getMultipleRoutes({ lat: toAirport.latitude, lng: toAirport.longitude }, drop),
  ])

  const leg1 = pickupToAirport.routes[0]
  const leg3 = airportToDrop.routes[0]
  if (!leg1 || !leg3) return null

  const airEstimate = estimateAirLeg(
    { lat: fromAirport.latitude, lng: fromAirport.longitude },
    { lat: toAirport.latitude, lng: toAirport.longitude },
    job.weightKg
  )

  const cost = leg1.estimatedFuelCost + leg3.estimatedFuelCost + airEstimate.estimatedCost
  const etaMinutes =
    minutesFromSeconds(leg1.durationSeconds) +
    minutesFromSeconds(airEstimate.durationSeconds) +
    minutesFromSeconds(leg3.durationSeconds)

  const breakdown: ScoreBreakdown = {
    etaMinutes,
    estimatedCost: cost,
    reliability: 0.8,
    penaltyLateMinutes: 0,
  }

  const score = computePlanScore(breakdown, objective)

  const segments: CandidateSegment[] = [
    {
      mode: "ground",
      title: `Pickup to airport (${fromAirport.iata})`,
      planned: {
        from: { lat: job.pickupLat, lng: job.pickupLng, address: job.pickupAddress },
        to: { lat: fromAirport.latitude, lng: fromAirport.longitude, name: fromAirport.name, code: fromAirport.icao, iata: fromAirport.iata },
        routeType: leg1.type,
        distanceMeters: leg1.distanceMeters,
        durationSeconds: leg1.durationSeconds,
        estimatedFuelCost: leg1.estimatedFuelCost,
        routeGeometry: leg1.routeGeoJson,
      },
    },
    {
      mode: "air",
      title: `Air (${fromAirport.iata} → ${toAirport.iata})`,
      planned: {
        fromAirportIcao: fromAirport.icao,
        toAirportIcao: toAirport.icao,
        fromAirportIata: fromAirport.iata,
        toAirportIata: toAirport.iata,
        estimatedAirDistanceMeters: airEstimate.distanceMeters,
        durationSeconds: airEstimate.durationSeconds,
        estimatedCost: airEstimate.estimatedCost,
      },
    },
    {
      mode: "ground",
      title: `Airport to drop (${toAirport.iata})`,
      planned: {
        from: { lat: toAirport.latitude, lng: toAirport.longitude, name: toAirport.name, code: toAirport.icao, iata: toAirport.iata },
        to: { lat: job.dropLat, lng: job.dropLng, address: job.dropAddress },
        routeType: leg3.type,
        distanceMeters: leg3.distanceMeters,
        durationSeconds: leg3.durationSeconds,
        estimatedFuelCost: leg3.estimatedFuelCost,
        routeGeometry: leg3.routeGeoJson,
      },
    },
  ]

  return {
    key: "road_air_road",
    label: "Road + Air + Road",
    segments,
    score,
    breakdown,
  }
}

function applyDeliveryWindowPenalty(job: JobDTO, breakdown: ScoreBreakdown): ScoreBreakdown {
  const start = new Date(job.dropWindowStartAt).getTime()
  const end = new Date(job.dropWindowEndAt).getTime()
  const pickupAt = new Date(job.pickupAt).getTime()
  const etaMs = pickupAt + breakdown.etaMinutes * 60 * 1000

  const lateMinutes = etaMs > end ? Math.ceil((etaMs - end) / 60000) : 0
  const earlyMinutes = etaMs < start ? Math.ceil((start - etaMs) / 60000) : 0

  // late penalty dominates; early penalty is smaller (can be refined)
  return {
    ...breakdown,
    penaltyLateMinutes: lateMinutes + Math.round(earlyMinutes * 0.25),
  }
}

export async function planFulfillment(
  jobId: string,
  objective: FulfillmentObjective = "balanced"
): Promise<PlanResult> {
  const parsedJobId = jobIdSchema.parse(jobId)
  const job = await getJob(parsedJobId)

  const candidates: CandidatePlanOption[] = []

  // Run candidate generation in parallel to keep server action latency low.
  const [roadRoutes, trainOption, airOption] = await Promise.all([
    getMultipleRoutes(
      { lat: job.pickupLat, lng: job.pickupLng },
      { lat: job.dropLat, lng: job.dropLng }
    ),
    buildRoadTrainRoadOption(job, objective),
    buildRoadAirRoadOption(job, objective),
  ])

  // Road-only candidates (based on Mapbox alternatives)
  for (const r of roadRoutes.routes) {
    const option = buildRoadOnlyOption(job, r, objective)
    option.breakdown = applyDeliveryWindowPenalty(job, option.breakdown)
    option.score = computePlanScore(option.breakdown, objective)
    candidates.push(option)
  }

  if (trainOption) {
    trainOption.breakdown = applyDeliveryWindowPenalty(job, trainOption.breakdown)
    trainOption.score = computePlanScore(trainOption.breakdown, objective)
    candidates.push(trainOption)
  }

  if (airOption) {
    airOption.breakdown = applyDeliveryWindowPenalty(job, airOption.breakdown)
    airOption.score = computePlanScore(airOption.breakdown, objective)
    candidates.push(airOption)
  }

  const sorted = sortOptionsBestFirst(candidates)
  if (sorted.length === 0) {
    throw new Error("No fulfillment options available for this job")
  }

  const selected = sorted[0]

  const created = await prisma.fulfillmentPlan.create({
    data: {
      masterJobId: parsedJobId,
      status: "draft",
      objective,
      selectedPlanKey: selected.key,
      options: sorted as Prisma.InputJsonValue,
      segments: {
        create: selected.segments.map((s, idx) => ({
          sortOrder: idx,
          mode: s.mode,
          status: "planned",
          planned: (s.planned ?? {}) as Prisma.InputJsonValue,
        })),
      },
    },
    select: {
      id: true,
      selectedPlanKey: true,
    },
  })

  return {
    planId: created.id,
    selectedPlanKey: created.selectedPlanKey ?? selected.key,
    options: sorted,
  }
}

export async function selectFulfillmentOption(
  planId: string,
  selectedPlanKey: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const plan = await prisma.fulfillmentPlan.findUnique({
      where: { id: planId },
      select: {
        id: true,
        status: true,
        options: true,
      },
    })

    if (!plan) return { success: false, error: "Plan not found" }
    if (plan.status !== "draft") return { success: false, error: "Plan is not editable" }

    const options = (plan.options as CandidatePlanOption[] | null) ?? []
    const chosen = options.find((o) => o.key === selectedPlanKey)
    if (!chosen) return { success: false, error: "Option not found" }

    await prisma.$transaction([
      prisma.fulfillmentSegment.deleteMany({
        where: { planId: plan.id },
      }),
      prisma.fulfillmentPlan.update({
        where: { id: plan.id },
        data: {
          selectedPlanKey,
          updatedAt: new Date(),
        },
      }),
      ...(chosen.segments.length > 0
        ? [
            prisma.fulfillmentSegment.createMany({
              data: chosen.segments.map((s, idx) => ({
                planId: plan.id,
                sortOrder: idx,
                mode: s.mode,
                status: "planned",
                planned: (s.planned ?? {}) as Prisma.InputJsonValue,
              })),
            }),
          ]
        : []),
    ])

    return { success: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to select option"
    return { success: false, error: msg }
  }
}


