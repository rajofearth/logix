"use server"

import type { DirectionsResult, GeoJsonFeature, LineStringGeometry, LngLat } from "../_types"
import { lngLatSchema } from "./jobSchemas"

type MapboxDirectionsResponse = {
  routes?: Array<{
    distance: number
    duration: number
    geometry: {
      coordinates: Array<[number, number]>
      type: "LineString"
    }
  }>
  code?: string
  message?: string
}

function getMapboxAccessToken(): string {
  const token = process.env.MAPBOX_ACCESS_TOKEN
  if (!token) {
    throw new Error("Missing MAPBOX_ACCESS_TOKEN on server")
  }
  return token
}

export async function getDirections(
  pickup: LngLat,
  drop: LngLat
): Promise<DirectionsResult> {
  const parsedPickup = lngLatSchema.parse(pickup)
  const parsedDrop = lngLatSchema.parse(drop)

  const token = getMapboxAccessToken()
  const coords = `${parsedPickup.lng},${parsedPickup.lat};${parsedDrop.lng},${parsedDrop.lat}`
  const url = new URL(`https://api.mapbox.com/directions/v5/mapbox/driving/${coords}`)
  url.searchParams.set("geometries", "geojson")
  url.searchParams.set("overview", "full")
  url.searchParams.set("alternatives", "false")
  url.searchParams.set("steps", "false")
  url.searchParams.set("access_token", token)

  const res = await fetch(url.toString(), { cache: "no-store" })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Mapbox Directions request failed (${res.status}): ${text}`)
  }

  const data = (await res.json()) as MapboxDirectionsResponse
  const route = data.routes?.[0]
  if (!route) {
    throw new Error(data.message ?? "No route returned from Mapbox Directions")
  }

  const geometry: LineStringGeometry = {
    type: "LineString",
    coordinates: route.geometry.coordinates,
  }

  const routeGeoJson: GeoJsonFeature<LineStringGeometry> = {
    type: "Feature",
    properties: {},
    geometry,
  }

  return {
    distanceMeters: Math.round(route.distance),
    durationSeconds: Math.round(route.duration),
    routeGeoJson,
  }
}


