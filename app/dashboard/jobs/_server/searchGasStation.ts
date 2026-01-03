"use server"

import type { LngLat } from "../_types"

type SearchBoxCategory = {
    features: Array<{
        properties: {
            name: string
            mapbox_id: string
        }
        geometry: {
            type: "Point"
            coordinates: [number, number]
        }
    }>
}

function getMapboxAccessToken(): string {
    const token = process.env.MAPBOX_ACCESS_TOKEN
    if (!token) {
        throw new Error("Missing MAPBOX_ACCESS_TOKEN on server")
    }
    return token
}

export async function findNearestGasStation(
    routeMidpoint: LngLat,
    limit: number = 1
): Promise<{ name: string; location: LngLat } | null> {
    const token = getMapboxAccessToken()

    const url = new URL("https://api.mapbox.com/search/searchbox/v1/category/gas_station")
    url.searchParams.set("proximity", `${routeMidpoint.lng},${routeMidpoint.lat}`)
    url.searchParams.set("limit", String(limit))
    url.searchParams.set("access_token", token)

    const res = await fetch(url.toString(), { cache: "no-store" })
    if (!res.ok) {
        const text = await res.text().catch(() => "")
        console.error(`Gas station search failed (${res.status}): ${text}`)
        return null
    }

    const data = (await res.json()) as SearchBoxCategory
    const feature = data.features?.[0]
    if (!feature) {
        return null
    }

    return {
        name: feature.properties.name,
        location: {
            lng: feature.geometry.coordinates[0],
            lat: feature.geometry.coordinates[1],
        },
    }
}
