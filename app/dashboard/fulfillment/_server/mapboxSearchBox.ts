"use server"

import type { LngLat } from "@/app/dashboard/jobs/_types"
import { lngLatSchema } from "@/app/dashboard/jobs/_server/jobSchemas"

function getMapboxAccessToken(): string {
  const token = process.env.MAPBOX_ACCESS_TOKEN
  if (!token) {
    throw new Error("Missing MAPBOX_ACCESS_TOKEN on server")
  }
  return token
}

type SuggestResponse = {
  suggestions?: Array<{
    mapbox_id: string
    name: string
    name_preferred?: string
    place_formatted?: string
    full_address?: string
    feature_type?: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }>
  attribution?: string
}

type RetrieveResponse = {
  type: string
  features?: Array<{
    type: string
    geometry: {
      type: string
      coordinates: [number, number] // [longitude, latitude]
    }
    properties: {
      mapbox_id: string
      name?: string
      place_formatted?: string
      full_address?: string
      address?: string
      coordinates?: {
        latitude: number
        longitude: number
      }
    }
  }>
  attribution?: string
}

export async function suggestLocation(
  query: string,
  sessionToken: string,
  proximity?: LngLat,
  limit: number = 10
): Promise<Array<{
  mapboxId: string
  name: string
  address: string
  coordinates?: LngLat // Optional - may need to retrieve for some suggestions
}>> {
  if (!query.trim()) {
    return []
  }

  const token = getMapboxAccessToken()
  const url = new URL("https://api.mapbox.com/search/searchbox/v1/suggest")
  
  url.searchParams.set("q", query.trim())
  url.searchParams.set("access_token", token)
  url.searchParams.set("session_token", sessionToken)
  url.searchParams.set("limit", Math.min(limit, 10).toString())
  url.searchParams.set("language", "en")
  
  if (proximity) {
    const parsed = lngLatSchema.parse(proximity)
    url.searchParams.set("proximity", `${parsed.lng},${parsed.lat}`)
  }

  const res = await fetch(url.toString(), { cache: "no-store" })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Mapbox Search Box suggest failed (${res.status}): ${text}`)
  }

  const data = (await res.json()) as SuggestResponse
  const suggestions = data.suggestions || []

  // Map all suggestions, including coordinates if available
  return suggestions.map((s) => ({
    mapboxId: s.mapbox_id,
    name: s.name_preferred || s.name,
    address: s.place_formatted || s.full_address || s.name,
    coordinates: s.coordinates
      ? {
          lng: s.coordinates.longitude,
          lat: s.coordinates.latitude,
        }
      : undefined,
  }))
}

export async function retrieveLocation(
  mapboxId: string,
  sessionToken: string
): Promise<{
  name: string
  address: string
  coordinates: LngLat
}> {
  const token = getMapboxAccessToken()
  // Mapbox Search Box API uses /retrieve/{mapbox_id} format
  const url = new URL(`https://api.mapbox.com/search/searchbox/v1/retrieve/${mapboxId}`)
  
  url.searchParams.set("access_token", token)
  url.searchParams.set("session_token", sessionToken)

  const res = await fetch(url.toString(), { cache: "no-store" })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    let errorData: { message?: string } = { message: "Unknown error" }
    try {
      if (text) {
        errorData = JSON.parse(text) as { message?: string }
      }
    } catch {
      errorData = { message: text || "Unknown error" }
    }
    throw new Error(`Mapbox Search Box retrieve failed (${res.status}): ${JSON.stringify(errorData)}`)
  }

  const data = (await res.json()) as RetrieveResponse
  
  // Check if we got features array
  if (!data.features || data.features.length === 0) {
    throw new Error("No location found for the selected suggestion")
  }

  const feature = data.features[0]
  const props = feature.properties || {}
  
  // Extract coordinates from geometry.coordinates [longitude, latitude]
  const coords = feature.geometry?.coordinates
  
  if (!coords || coords.length < 2) {
    throw new Error("Invalid coordinates in retrieved location")
  }

  // Use coordinates from geometry (more reliable) or fallback to properties.coordinates
  const coordinates: LngLat = {
    lng: coords[0], // longitude
    lat: coords[1], // latitude
  }

  return {
    name: props.name || "",
    address: props.place_formatted || props.full_address || props.address || props.name || "",
    coordinates,
  }
}
