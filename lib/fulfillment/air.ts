import type { LngLat } from "./types"
import { haversineDistanceMeters } from "./geo"
import { INDIA_AIRPORTS, type Airport } from "@/lib/airports/india-airports"

export type NearestAirport = Airport & { distanceMeters: number }

export function getNearestAirports(point: LngLat, limit: number = 2): NearestAirport[] {
  const scored = INDIA_AIRPORTS.map((a) => ({
    ...a,
    distanceMeters: haversineDistanceMeters(point, { lat: a.latitude, lng: a.longitude }),
  }))
  scored.sort((x, y) => x.distanceMeters - y.distanceMeters)
  return scored.slice(0, Math.max(1, limit))
}

export type AirLegEstimate = {
  distanceMeters: number
  durationSeconds: number
  estimatedCost: number
}

export function estimateAirLeg(from: LngLat, to: LngLat, weightKg: number): AirLegEstimate {
  const distanceMeters = Math.round(haversineDistanceMeters(from, to) * 1.08) // routing factor
  const cruiseMps = 230 // ~828 km/h
  const fixedSeconds = 2 * 60 * 60 // handling + taxi + sorting
  const durationSeconds = Math.round(distanceMeters / cruiseMps + fixedSeconds)

  // heuristic cost: base + per-kg-km
  const km = Math.max(1, distanceMeters / 1000)
  const base = 1200
  const perKgKm = 1.4
  const estimatedCost = Math.round(base + weightKg * km * perKgKm)

  return { distanceMeters, durationSeconds, estimatedCost }
}


