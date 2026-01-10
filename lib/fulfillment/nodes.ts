import { STATIONS, type StationData } from "@/lib/trains/station-data"
import type { LngLat } from "./types"
import { haversineDistanceMeters } from "./geo"

export type NearestStation = StationData & { distanceMeters: number }

export function getNearestStations(
  point: LngLat,
  limit: number = 3
): NearestStation[] {
  const scored = STATIONS.map((s) => {
    const d = haversineDistanceMeters(point, {
      lat: s.latitude,
      lng: s.longitude,
    })
    return { ...s, distanceMeters: d }
  })
  scored.sort((a, b) => a.distanceMeters - b.distanceMeters)
  return scored.slice(0, Math.max(1, limit))
}

export function estimateRailDistanceMeters(from: LngLat, to: LngLat): number {
  // crude approximation: rail routes are typically longer than straight-line distance
  const direct = haversineDistanceMeters(from, to)
  return Math.round(direct * 1.3)
}



