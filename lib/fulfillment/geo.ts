import type { LngLat } from "./types"

export function haversineDistanceMeters(a: LngLat, b: LngLat): number {
  const R = 6371000
  const φ1 = (a.lat * Math.PI) / 180
  const φ2 = (b.lat * Math.PI) / 180
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180

  const sΔφ = Math.sin(Δφ / 2)
  const sΔλ = Math.sin(Δλ / 2)

  const h =
    sΔφ * sΔφ + Math.cos(φ1) * Math.cos(φ2) * (sΔλ * sΔλ)
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))

  return R * c
}



