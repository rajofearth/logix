// Route API Configuration
// These can be made dynamic from database/env in the future

export const ROUTE_CONFIG = {
    // Fuel cost estimation
    fuel: {
        efficiencyKmPerL: 15, // Typical delivery vehicle
        pricePerL: 100, // ₹100/L - can be updated based on market rates
    },

    // API settings
    api: {
        timeoutMs: 10000, // 10 second timeout for Mapbox calls
        maxRetries: 2,
        retryDelayMs: 500,
    },

    // Cache settings (for future LRU cache implementation)
    cache: {
        ttlMs: 5 * 60 * 1000, // 5 minutes
        maxEntries: 100,
    },
} as const

// Fuel cost calculator
export function calculateFuelCost(
    distanceMeters: number,
    efficiencyKmPerL: number = ROUTE_CONFIG.fuel.efficiencyKmPerL,
    pricePerL: number = ROUTE_CONFIG.fuel.pricePerL
): number {
    const distanceKm = distanceMeters / 1000
    const litersNeeded = distanceKm / efficiencyKmPerL
    return Math.round(litersNeeded * pricePerL)
}

// Haversine distance between two coordinates (in meters)
export function haversineDistance(
    coord1: [number, number],
    coord2: [number, number]
): number {
    const R = 6371000 // Earth's radius in meters
    const [lng1, lat1] = coord1
    const [lng2, lat2] = coord2

    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lng2 - lng1) * Math.PI) / 180

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
}

// Calculate true distance-based midpoint of a route
export function getDistanceBasedMidpoint(
    coordinates: Array<[number, number]>
): { lng: number; lat: number } {
    if (coordinates.length === 0) {
        throw new Error("Empty coordinates array")
    }
    if (coordinates.length === 1) {
        return { lng: coordinates[0][0], lat: coordinates[0][1] }
    }

    // Calculate cumulative distances
    let totalDistance = 0
    const distances: number[] = [0]

    for (let i = 1; i < coordinates.length; i++) {
        totalDistance += haversineDistance(coordinates[i - 1], coordinates[i])
        distances.push(totalDistance)
    }

    // Find the segment containing the midpoint
    const halfDistance = totalDistance / 2

    for (let i = 1; i < distances.length; i++) {
        if (distances[i] >= halfDistance) {
            // Interpolate between coordinates[i-1] and coordinates[i]
            const segmentStart = distances[i - 1]
            const segmentEnd = distances[i]
            const segmentLength = segmentEnd - segmentStart

            if (segmentLength === 0) {
                return { lng: coordinates[i][0], lat: coordinates[i][1] }
            }

            const ratio = (halfDistance - segmentStart) / segmentLength
            const [lng1, lat1] = coordinates[i - 1]
            const [lng2, lat2] = coordinates[i]

            return {
                lng: lng1 + ratio * (lng2 - lng1),
                lat: lat1 + ratio * (lat2 - lat1),
            }
        }
    }

    // Fallback to last coordinate
    const last = coordinates[coordinates.length - 1]
    return { lng: last[0], lat: last[1] }
}

// Fetch with timeout wrapper
export async function fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeoutMs: number = ROUTE_CONFIG.api.timeoutMs
): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        })
        return response
    } finally {
        clearTimeout(timeoutId)
    }
}
