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
import {
    calculateFuelCost,
    fetchWithTimeout,
    getDistanceBasedMidpoint,
    ROUTE_CONFIG,
} from "./routeConfig"

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

    try {
        const res = await fetchWithTimeout(
            url.toString(),
            { cache: "no-store" },
            ROUTE_CONFIG.api.timeoutMs
        )

        if (!res.ok) {
            const text = await res.text().catch(() => "")
            throw new Error(`Mapbox Directions request failed (${res.status}): ${text}`)
        }

        return (await res.json()) as MapboxDirectionsResponse
    } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
            throw new Error("Route calculation timed out. Please try again.")
        }
        throw error
    }
}

// Validate pickup and drop are not identical (or too close)
function validatePoints(pickup: LngLat, drop: LngLat): void {
    const MIN_DISTANCE_METERS = 50 // Minimum 50m apart

    // Simple distance check using lat/lng difference (approximate)
    const latDiff = Math.abs(pickup.lat - drop.lat)
    const lngDiff = Math.abs(pickup.lng - drop.lng)

    // Rough conversion: 0.00001 degrees ≈ 1.1 meters at equator
    const approxDistance = Math.sqrt(latDiff ** 2 + lngDiff ** 2) * 111000

    if (approxDistance < MIN_DISTANCE_METERS) {
        throw new Error("Pickup and drop locations are too close. Please select points at least 50 meters apart.")
    }
}

export async function getMultipleRoutes(
    pickup: LngLat,
    drop: LngLat
): Promise<MultiRouteResult> {
    const parsedPickup = lngLatSchema.parse(pickup)
    const parsedDrop = lngLatSchema.parse(drop)

    // Validate points are not identical
    validatePoints(parsedPickup, parsedDrop)

    const coords = `${parsedPickup.lng},${parsedPickup.lat};${parsedDrop.lng},${parsedDrop.lat}`

    // Fetch routes with alternatives
    const data = await fetchDirections(coords, true)

    if (!data.routes?.length) {
        throw new Error(data.message ?? "No route found between these locations")
    }

    const routes: RouteOption[] = []

    // Convert all Mapbox routes to our format with fuel cost
    const allCandidates = data.routes.map((route, index) => ({
        index,
        distanceMeters: Math.round(route.distance),
        durationSeconds: Math.round(route.duration),
        coordinates: route.geometry.coordinates,
        fuelCost: calculateFuelCost(route.distance),
    }))

    // Sort by duration to find fastest
    const sortedByDuration = [...allCandidates].sort((a, b) => a.durationSeconds - b.durationSeconds)
    const fastestCandidate = sortedByDuration[0]

    // Sort by fuel cost (distance) to find cheapest
    const sortedByCost = [...allCandidates].sort((a, b) => a.fuelCost - b.fuelCost)
    const cheapestCandidate = sortedByCost[0]

    // Add fastest route
    routes.push({
        type: "fastest",
        distanceMeters: fastestCandidate.distanceMeters,
        durationSeconds: fastestCandidate.durationSeconds,
        routeGeoJson: buildRouteGeoJson(fastestCandidate.coordinates),
        estimatedFuelCost: fastestCandidate.fuelCost,
    })

    // Add economy route ONLY if it differs from fastest
    // Economy = cheapest fuel cost (shortest distance)
    if (cheapestCandidate.index !== fastestCandidate.index) {
        // Different route is cheapest - add it as economy
        routes.push({
            type: "economy",
            distanceMeters: cheapestCandidate.distanceMeters,
            durationSeconds: cheapestCandidate.durationSeconds,
            routeGeoJson: buildRouteGeoJson(cheapestCandidate.coordinates),
            estimatedFuelCost: cheapestCandidate.fuelCost,
        })
    } else if (sortedByCost.length > 1) {
        // Fastest is also cheapest - only add economy if there's an alternative
        // that is meaningfully different (>5% cost difference)
        const secondCheapest = sortedByCost[1]
        const costDiffPercent = Math.abs(secondCheapest.fuelCost - fastestCandidate.fuelCost) / fastestCandidate.fuelCost * 100

        if (costDiffPercent > 5) {
            routes.push({
                type: "economy",
                distanceMeters: secondCheapest.distanceMeters,
                durationSeconds: secondCheapest.durationSeconds,
                routeGeoJson: buildRouteGeoJson(secondCheapest.coordinates),
                estimatedFuelCost: secondCheapest.fuelCost,
            })
        }
        // If cost difference is <5%, don't add duplicate economy route
    }
    // If only one route exists and it's fastest, don't add duplicate economy

    // Keep reference to fastest route geometry for gas station search
    const fastestRoute = data.routes[fastestCandidate.index]

    // Find nearest gas station and create via-gas-station route
    try {
        // Use distance-based midpoint for more accurate gas station placement
        const midpoint = getDistanceBasedMidpoint(fastestRoute.geometry.coordinates)
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
