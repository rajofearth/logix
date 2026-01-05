import type { AircraftPosition, CarrierConnector } from "./types";

const OPENSKY_BASE_URL = "https://opensky-network.org/api";

// Simple in-memory cache to respect rate limits
interface CacheEntry {
    data: AircraftPosition | AircraftPosition[] | null;
    timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30_000; // 30 seconds

function getCached<T>(key: string): T | undefined {
    const entry = cache.get(key);
    if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
        return entry.data as T;
    }
    cache.delete(key);
    return undefined;
}

function setCache(key: string, data: AircraftPosition | AircraftPosition[] | null): void {
    cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Parse OpenSky state vector array into AircraftPosition object
 * @see https://openskynetwork.github.io/opensky-api/rest.html#all-state-vectors
 */
function parseStateVector(state: unknown[]): AircraftPosition {
    return {
        icao24: state[0] as string,
        callsign: state[1] ? (state[1] as string).trim() : null,
        originCountry: state[2] as string,
        latitude: state[6] as number | null,
        longitude: state[5] as number | null,
        baroAltitudeMeters: state[7] as number | null,
        geoAltitudeMeters: state[13] as number | null,
        onGround: state[8] as boolean,
        velocityMps: state[9] as number | null,
        heading: state[10] as number | null,
        verticalRateMps: state[11] as number | null,
        timestamp: (state[3] as number) || (state[4] as number),
        lastContact: state[4] as number,
    };
}

/**
 * OpenSky Network API connector
 * Free tier limits: ~10 requests/day anonymous, ~400/day authenticated
 */
export const openSkyConnector: CarrierConnector = {
    name: "OpenSky Network",

    async getAircraftPosition(icao24: string): Promise<AircraftPosition | null> {
        const cacheKey = `aircraft:${icao24.toLowerCase()}`;
        const cached = getCached<AircraftPosition | null>(cacheKey);
        if (cached !== undefined) {
            return cached;
        }

        try {
            const url = `${OPENSKY_BASE_URL}/states/all?icao24=${icao24.toLowerCase()}`;
            const response = await fetch(url, {
                headers: {
                    "Accept": "application/json",
                },
                next: { revalidate: 30 }, // Next.js cache for 30 seconds
            });

            if (!response.ok) {
                if (response.status === 429) {
                    console.warn("[OpenSky] Rate limited, returning cached or null");
                    return null;
                }
                throw new Error(`OpenSky API error: ${response.status}`);
            }

            const data = await response.json() as { time: number; states: unknown[][] | null };

            if (!data.states || data.states.length === 0) {
                setCache(cacheKey, null);
                return null;
            }

            const position = parseStateVector(data.states[0]);
            setCache(cacheKey, position);
            return position;
        } catch (error) {
            console.error("[OpenSky] Error fetching aircraft position:", error);
            return null;
        }
    },

    async getActiveAircraft(): Promise<AircraftPosition[]> {
        const cacheKey = "active-aircraft";
        const cached = getCached<AircraftPosition[]>(cacheKey);
        if (cached !== undefined) {
            return cached;
        }

        try {
            // Get aircraft in a popular cargo region (Europe/Atlantic)
            // Bounding box: roughly US East Coast to Western Europe
            const url = `${OPENSKY_BASE_URL}/states/all?lamin=25&lomin=-100&lamax=60&lomax=30`;
            const response = await fetch(url, {
                headers: {
                    "Accept": "application/json",
                },
                next: { revalidate: 60 }, // Cache for 1 minute
            });

            if (!response.ok) {
                if (response.status === 429) {
                    console.warn("[OpenSky] Rate limited for active aircraft");
                    return [];
                }
                throw new Error(`OpenSky API error: ${response.status}`);
            }

            const data = await response.json() as { time: number; states: unknown[][] | null };

            if (!data.states) {
                setCache(cacheKey, []);
                return [];
            }

            // Filter to aircraft that are airborne and have valid positions
            const positions = data.states
                .map(parseStateVector)
                .filter(
                    (pos) =>
                        !pos.onGround &&
                        pos.latitude !== null &&
                        pos.longitude !== null &&
                        pos.baroAltitudeMeters !== null &&
                        pos.baroAltitudeMeters > 1000 // Above 1km altitude
                );

            setCache(cacheKey, positions);
            return positions;
        } catch (error) {
            console.error("[OpenSky] Error fetching active aircraft:", error);
            return [];
        }
    },
};

/**
 * Get a random active aircraft for shipment assignment
 * Falls back to generating a mock ICAO24 if no live data available
 */
export async function getRandomActiveAircraft(): Promise<{
    icao24: string;
    callsign: string | null;
}> {
    try {
        const aircraft = await openSkyConnector.getActiveAircraft();

        if (aircraft.length > 0) {
            const randomIndex = Math.floor(Math.random() * Math.min(aircraft.length, 100));
            const selected = aircraft[randomIndex];
            return {
                icao24: selected.icao24,
                callsign: selected.callsign,
            };
        }
    } catch (error) {
        console.error("[OpenSky] Failed to get random aircraft:", error);
    }

    // Fallback: generate a mock ICAO24 (starts with 'a' for US-registered aircraft)
    const mockIcao24 = `a${Math.random().toString(16).slice(2, 7)}`;
    return {
        icao24: mockIcao24,
        callsign: null,
    };
}
