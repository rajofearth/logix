"use server"

import type {
    GeoJsonFeature,
    LineStringGeometry,
    LngLat,
    MultiRouteResult,
    RouteOption,
} from "../_types"
import { lngLatSchema } from "./jobSchemas"
import { findNearestGasStation } from "./searchGasStation"

// Fuel cost estimation constants
const FUEL_EFFICIENCY_KM_PER_L = 15 // Typical delivery vehicle
const FUEL_PRICE_PER_L = 100 // ₹100/L

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

function calculateFuelCost(distanceMeters: number): number {
    const distanceKm = distanceMeters / 1000
    const litersNeeded = distanceKm / FUEL_EFFICIENCY_KM_PER_L
    return Math.round(litersNeeded * FUEL_PRICE_PER_L)
}

function buildRouteGeoJson(
    coordinates: Array<[number, number]>
): GeoJsonFeature<LineStringGeometry> {
    return {
        type: "Feature",
        properties: {},
        geometry: {
            type: "LineString",
            coordinates,
        },
    }
}

async function fetchDirections(
    coords: string,
    alternatives: boolean = false
): Promise<MapboxDirectionsResponse> {
    const token = getMapboxAccessToken()
    const url = new URL(`https://api.mapbox.com/directions/v5/mapbox/driving/${coords}`)
    url.searchParams.set("geometries", "geojson")
    url.searchParams.set("overview", "full")
    url.searchParams.set("alternatives", String(alternatives))
    url.searchParams.set("steps", "false")
    url.searchParams.set("access_token", token)

    const res = await fetch(url.toString(), { cache: "no-store" })
    if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(`Mapbox Directions request failed (${res.status}): ${text}`)
    }

    return (await res.json()) as MapboxDirectionsResponse
}

function getRouteMidpoint(coordinates: Array<[number, number]>): LngLat {
    const midIndex = Math.floor(coordinates.length / 2)
    const [lng, lat] = coordinates[midIndex]
    return { lng, lat }
}

export async function getMultipleRoutes(
    pickup: LngLat,
    drop: LngLat
): Promise<MultiRouteResult> {
    const parsedPickup = lngLatSchema.parse(pickup)
    const parsedDrop = lngLatSchema.parse(drop)

    const coords = `${parsedPickup.lng},${parsedPickup.lat};${parsedDrop.lng},${parsedDrop.lat}`

    // Fetch routes with alternatives
    const data = await fetchDirections(coords, true)

    if (!data.routes?.length) {
        throw new Error(data.message ?? "No routes returned from Mapbox Directions")
    }

    const routes: RouteOption[] = []

    // First route is the fastest
    const fastestRoute = data.routes[0]
    routes.push({
        type: "fastest",
        distanceMeters: Math.round(fastestRoute.distance),
        durationSeconds: Math.round(fastestRoute.duration),
        routeGeoJson: buildRouteGeoJson(fastestRoute.geometry.coordinates),
        estimatedFuelCost: calculateFuelCost(fastestRoute.distance),
    })

    // Use alternative as economy route if available, otherwise create a simulated one
    if (data.routes.length > 1) {
        const economyRoute = data.routes[1]
        routes.push({
            type: "economy",
            distanceMeters: Math.round(economyRoute.distance),
            durationSeconds: Math.round(economyRoute.duration),
            routeGeoJson: buildRouteGeoJson(economyRoute.geometry.coordinates),
            estimatedFuelCost: calculateFuelCost(economyRoute.distance),
        })
    } else {
        // No alternative available, use the same as fastest with slight label difference
        routes.push({
            type: "economy",
            distanceMeters: Math.round(fastestRoute.distance),
            durationSeconds: Math.round(fastestRoute.duration),
            routeGeoJson: buildRouteGeoJson(fastestRoute.geometry.coordinates),
            estimatedFuelCost: calculateFuelCost(fastestRoute.distance),
        })
    }

    // Find nearest gas station and create via-gas-station route
    try {
        const midpoint = getRouteMidpoint(fastestRoute.geometry.coordinates)
        const gasStation = await findNearestGasStation(midpoint)

        if (gasStation) {
            // Fetch route via the gas station
            const viaCoords = `${parsedPickup.lng},${parsedPickup.lat};${gasStation.location.lng},${gasStation.location.lat};${parsedDrop.lng},${parsedDrop.lat}`
            const viaData = await fetchDirections(viaCoords, false)

            if (viaData.routes?.[0]) {
                const viaRoute = viaData.routes[0]
                routes.push({
                    type: "via_gas_station",
                    distanceMeters: Math.round(viaRoute.distance),
                    durationSeconds: Math.round(viaRoute.duration),
                    routeGeoJson: buildRouteGeoJson(viaRoute.geometry.coordinates),
                    estimatedFuelCost: calculateFuelCost(viaRoute.distance),
                    viaPoi: {
                        name: gasStation.name,
                        lat: gasStation.location.lat,
                        lng: gasStation.location.lng,
                    },
                })
            }
        }
    } catch (e) {
        // Gas station route is optional, continue without it
        console.error("Failed to compute via-gas-station route:", e)
    }

    return { routes }
}
