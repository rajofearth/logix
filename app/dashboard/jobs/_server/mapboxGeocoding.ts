"use server"

import type { LngLat } from "../_types"
import { lngLatSchema } from "./jobSchemas"

type MapboxGeocodingResponse = {
  features?: Array<{
    place_name?: string
    text?: string
  }>
  message?: string
}

function getMapboxAccessToken(): string {
  const token = process.env.MAPBOX_ACCESS_TOKEN
  if (!token) {
    throw new Error("Missing MAPBOX_ACCESS_TOKEN on server")
  }
  return token
}

export async function reverseGeocode(coord: LngLat): Promise<string> {
  const parsed = lngLatSchema.parse(coord)
  const token = getMapboxAccessToken()

  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${parsed.lng},${parsed.lat}.json`
  )
  url.searchParams.set("access_token", token)
  url.searchParams.set("limit", "1")
  url.searchParams.set("language", "en")

  const res = await fetch(url.toString(), { cache: "no-store" })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Mapbox Geocoding request failed (${res.status}): ${text}`)
  }

  const data = (await res.json()) as MapboxGeocodingResponse
  const best = data.features?.[0]
  const name = best?.place_name ?? best?.text
  if (!name) {
    throw new Error(data.message ?? "No address found for clicked location")
  }
  return name
}

export async function searchNearbyPlaces(
  coord: LngLat,
  category: string = "gas_station",
  limit: number = 10
): Promise<Array<{ name: string; coord: LngLat }>> {
  const parsed = lngLatSchema.parse(coord)
  const token = getMapboxAccessToken()

  // Use Mapbox Search Box API for category search
  // https://api.mapbox.com/search/searchbox/v1/category/{category}
  const url = new URL(
    `https://api.mapbox.com/search/searchbox/v1/category/${category}`
  )
  url.searchParams.set("access_token", token)
  url.searchParams.set("proximity", `${parsed.lng},${parsed.lat}`)
  url.searchParams.set("limit", limit.toString())
  url.searchParams.set("language", "en")

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } }) // Cache for 1h
  if (!res.ok) {
    console.error(`Mapbox Places search failed: ${res.status} ${res.statusText}`)
    return []
  }

  const data = await res.json() as {
    features?: Array<{
      properties: { name: string };
      geometry: { coordinates: [number, number] };
    }>;
  }

  // Response has "features" where each feature has "geometry.coordinates" [lng, lat] and "properties.name"
  return (data.features || []).map((f) => ({
    name: f.properties.name,
    coord: {
      lng: f.geometry.coordinates[0],
      lat: f.geometry.coordinates[1],
    },
  }))
}


