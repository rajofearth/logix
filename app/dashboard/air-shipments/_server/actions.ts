"use server";

import { prisma } from "@/lib/prisma";
import {
    getRandomCarrier,
    getRandomAirportPair,
    generateFlightNumber
} from "@/lib/carriers/carriers-data";
import { getRandomActiveAircraft, openSkyConnector } from "@/lib/carriers/opensky";
import type { ShipmentStatus, ShipmentSegmentType, ShipmentEventType, ShipmentSegment, ShipmentEvent, Shipment } from "@prisma/client";

type ShipmentWithSegments = Shipment & {
    segments: ShipmentSegment[];
};

// ==========================================
// Types
// ==========================================

export interface CreateShipmentInput {
    packageName: string;
    weightKg: number;
    description?: string;
    fromIcao?: string;
    toIcao?: string;
}

export interface ShipmentFilters {
    status?: ShipmentStatus;
    carrier?: string;
    search?: string;
    limit?: number;
    offset?: number;
}

export interface FlightLeg {
    from: string;
    to: string;
    carrier: string;
    flightNumber: string;
    departureTime: Date;
    arrivalTime: Date;
    aircraft: string;
}

export interface FlightOption {
    price: number;
    totalDuration: number;
    legs: FlightLeg[];
}

export interface ShipmentListItem {
    id: string;
    referenceCode: string;
    status: ShipmentStatus;
    carrier: string | null;
    flightNumber: string | null;
    fromAirportIcao: string | null;
    toAirportIcao: string | null;
    icao24: string | null;
    createdAt: Date;
    packageName: string;
    weightKg: number;
}

export interface ShipmentDetail {
    id: string;
    referenceCode: string;
    status: ShipmentStatus;
    metadata: {
        packageName: string;
        weightKg: number;
        description?: string;
    };
    createdAt: Date;
    updatedAt: Date;
    segments: Array<{
        id: string;
        type: ShipmentSegmentType;
        sortOrder: number;
        carrier: string | null;
        carrierTrackingId: string | null;
        flightNumber: string | null;
        fromAirportIcao: string | null;
        toAirportIcao: string | null;
        icao24: string | null;
        plannedDepartureAt: Date | null;
        plannedArrivalAt: Date | null;
        actualDepartureAt: Date | null;
        actualArrivalAt: Date | null;
    }>;
    events: Array<{
        id: string;
        type: ShipmentEventType;
        title: string;
        description: string | null;
        locationName: string | null;
        occurredAt: Date;
    }>;
}

// ==========================================
// Helpers
// ==========================================

function generateReferenceCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `AIR-${timestamp}-${random}`;
}

// ==========================================
// Server Actions
// ==========================================

/**
 * Create a new air shipment with auto-assignment to carrier and aircraft
 */
export async function createShipment(
    input: CreateShipmentInput
): Promise<{ success: true; shipmentId: string } | { success: false; error: string }> {
    try {
        // Get random carrier and route
        // Get random carrier and route (or use provided airports)
        const carrier = getRandomCarrier();

        let fromAirport = "";
        let toAirport = "";

        if (input.fromIcao && input.toIcao) {
            fromAirport = input.fromIcao;
            toAirport = input.toIcao;
        } else {
            const randomRoute = getRandomAirportPair();
            fromAirport = randomRoute.from;
            toAirport = randomRoute.to;
        }

        const flightNumber = generateFlightNumber(carrier);

        // Get a random active aircraft for tracking
        const aircraft = await getRandomActiveAircraft();

        // Generate reference code
        const referenceCode = generateReferenceCode();

        // Calculate planned times (departure in 2 hours, arrival in 10 hours for demo)
        const plannedDepartureAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
        const plannedArrivalAt = new Date(Date.now() + 10 * 60 * 60 * 1000);

        // Create shipment with air segment
        const shipment = await prisma.shipment.create({
            data: {
                referenceCode,
                status: "created",
                metadata: {
                    packageName: input.packageName,
                    weightKg: input.weightKg,
                    description: input.description || null,
                },
                segments: {
                    create: {
                        type: "air",
                        sortOrder: 0,
                        carrier: carrier.name,
                        carrierTrackingId: `${carrier.code}-${Date.now()}`,
                        flightNumber,
                        fromAirportIcao: fromAirport,
                        toAirportIcao: toAirport,
                        icao24: aircraft.icao24,
                        plannedDepartureAt,
                        plannedArrivalAt,
                    },
                },
                events: {
                    create: {
                        type: "created",
                        title: "Shipment Created",
                        description: `Package "${input.packageName}" (${input.weightKg}kg) assigned to ${carrier.name} flight ${flightNumber}`,
                        occurredAt: new Date(),
                    },
                },
            },
        });

        return { success: true, shipmentId: shipment.id };
    } catch (error) {
        console.error("[createShipment] Error:", error);
        return { success: false, error: "Failed to create shipment" };
    }
}

/**
 * List shipments with optional filters
 */
export async function listShipments(
    filters: ShipmentFilters = {}
): Promise<{ shipments: ShipmentListItem[]; total: number }> {
    const { status, carrier, search, limit = 20, offset = 0 } = filters;

    const where: Record<string, unknown> = {};

    if (status) {
        where.status = status;
    }

    if (search) {
        where.referenceCode = {
            contains: search,
            mode: "insensitive",
        };
    }

    const [shipments, total] = await Promise.all([
        prisma.shipment.findMany({
            where,
            include: {
                segments: {
                    where: { type: "air" },
                    take: 1,
                },
            },
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: offset,
        }),
        prisma.shipment.count({ where }),
    ]);

    const items: ShipmentListItem[] = (shipments as ShipmentWithSegments[]).map((s) => {
        const airSegment = s.segments[0];
        const metadata = s.metadata as { packageName: string; weightKg: number } | null;

        return {
            id: s.id,
            referenceCode: s.referenceCode,
            status: s.status,
            carrier: airSegment?.carrier || null,
            flightNumber: airSegment?.flightNumber || null,
            fromAirportIcao: airSegment?.fromAirportIcao || null,
            toAirportIcao: airSegment?.toAirportIcao || null,
            icao24: airSegment?.icao24 || null,
            createdAt: s.createdAt,
            packageName: metadata?.packageName || "Unknown",
            weightKg: metadata?.weightKg || 0,
        };
    });

    // Filter by carrier if specified (post-query filter since it's in a relation)
    const filteredItems = carrier
        ? items.filter((item) => item.carrier?.toLowerCase().includes(carrier.toLowerCase()))
        : items;

    return { shipments: filteredItems, total };
}

/**
 * Get detailed shipment information
 */
export async function getShipmentDetail(
    shipmentId: string
): Promise<ShipmentDetail | null> {
    const shipment = await prisma.shipment.findUnique({
        where: { id: shipmentId },
        include: {
            segments: {
                orderBy: { sortOrder: "asc" },
            },
            events: {
                orderBy: { occurredAt: "desc" },
            },
        },
    });

    if (!shipment) {
        return null;
    }

    const metadata = shipment.metadata as {
        packageName: string;
        weightKg: number;
        description?: string
    } | null;

    return {
        id: shipment.id,
        referenceCode: shipment.referenceCode,
        status: shipment.status,
        metadata: {
            packageName: metadata?.packageName || "Unknown",
            weightKg: metadata?.weightKg || 0,
            description: metadata?.description,
        },
        createdAt: shipment.createdAt,
        updatedAt: shipment.updatedAt,
        segments: shipment.segments.map((seg: ShipmentSegment) => ({
            id: seg.id,
            type: seg.type,
            sortOrder: seg.sortOrder,
            carrier: seg.carrier,
            carrierTrackingId: seg.carrierTrackingId,
            flightNumber: seg.flightNumber,
            fromAirportIcao: seg.fromAirportIcao,
            toAirportIcao: seg.toAirportIcao,
            icao24: seg.icao24,
            plannedDepartureAt: seg.plannedDepartureAt,
            plannedArrivalAt: seg.plannedArrivalAt,
            actualDepartureAt: seg.actualDepartureAt,
            actualArrivalAt: seg.actualArrivalAt,
        })),
        events: shipment.events.map((evt: ShipmentEvent) => ({
            id: evt.id,
            type: evt.type,
            title: evt.title,
            description: evt.description,
            locationName: evt.locationName,
            occurredAt: evt.occurredAt,
        })),
    };
}

/**
 * Refresh aircraft position from OpenSky and store in database
 */
export async function refreshAircraftPosition(
    shipmentId: string
): Promise<{ success: boolean; position?: { lat: number; lng: number } }> {
    try {
        // Get the air segment for this shipment
        const segment = await prisma.shipmentSegment.findFirst({
            where: {
                shipmentId,
                type: "air",
                icao24: { not: null },
            },
        });

        if (!segment || !segment.icao24) {
            return { success: false };
        }

        // Fetch position from OpenSky
        const position = await openSkyConnector.getAircraftPosition(segment.icao24);

        if (!position || position.latitude === null || position.longitude === null) {
            return { success: false };
        }

        // Store position in database
        await prisma.airPositionPoint.create({
            data: {
                segmentId: segment.id,
                timestamp: new Date(position.timestamp * 1000),
                latitude: position.latitude,
                longitude: position.longitude,
                baroAltitudeMeters: position.baroAltitudeMeters,
                velocityMps: position.velocityMps,
                heading: position.heading,
                onGround: position.onGround,
                source: "opensky",
            },
        });

        return {
            success: true,
            position: {
                lat: position.latitude,
                lng: position.longitude
            }
        };
    } catch (error) {
        console.error("[refreshAircraftPosition] Error:", error);
        return { success: false };
    }
}



/**
 * Get available flight options for a route
 * Generates both direct and connecting flight options
 */
export async function getFlightsForRoute(
    fromIcao: string,
    toIcao: string
): Promise<FlightOption[]> {
    const options: FlightOption[] = [];

    // Generate 2-3 direct flight options
    const directCount = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < directCount; i++) {
        const carrier = getRandomCarrier();
        const flightNumber = generateFlightNumber(carrier);

        // Random time between 2 hours and 24 hours from now
        const offsetHours = Math.floor(Math.random() * 22) + 2;
        const durationHours = Math.floor(Math.random() * 8) + 4; // 4-12 hours flight

        const departureTime = new Date(Date.now() + offsetHours * 60 * 60 * 1000);
        const arrivalTime = new Date(departureTime.getTime() + durationHours * 60 * 60 * 1000);

        // Random aircraft from a set list
        const aircraftTypes = ["B777-300ER", "A350-900", "B787-9", "A330-300", "B747-8F"];
        const aircraft = aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)];

        options.push({
            price: Math.floor(Math.random() * 500) + 400, // $400-$900 for direct
            totalDuration: durationHours * 60, // in minutes
            legs: [{
                from: fromIcao,
                to: toIcao,
                carrier: carrier.name,
                flightNumber,
                departureTime,
                arrivalTime,
                aircraft,
            }],
        });
    }

    // Generate 1-2 connecting flight options (2 legs)
    const connectingHubs = ["KJFK", "KLAX", "EDDF", "OMDB", "WSSS", "VHHH"];
    const availableHubs = connectingHubs.filter(h => h !== fromIcao && h !== toIcao);

    if (availableHubs.length > 0) {
        const connectingCount = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < connectingCount && i < availableHubs.length; i++) {
            const hubIcao = availableHubs[Math.floor(Math.random() * availableHubs.length)];

            const carrier1 = getRandomCarrier();
            const carrier2 = getRandomCarrier();

            // First leg
            const offsetHours = Math.floor(Math.random() * 20) + 3;
            const leg1Duration = Math.floor(Math.random() * 4) + 3; // 3-7 hours
            const layover = Math.floor(Math.random() * 3) + 1; // 1-4 hours layover
            const leg2Duration = Math.floor(Math.random() * 4) + 3; // 3-7 hours

            const dep1 = new Date(Date.now() + offsetHours * 60 * 60 * 1000);
            const arr1 = new Date(dep1.getTime() + leg1Duration * 60 * 60 * 1000);
            const dep2 = new Date(arr1.getTime() + layover * 60 * 60 * 1000);
            const arr2 = new Date(dep2.getTime() + leg2Duration * 60 * 60 * 1000);

            const aircraftTypes = ["B777-300ER", "A350-900", "B787-9", "A330-300"];

            options.push({
                price: Math.floor(Math.random() * 300) + 250, // $250-$550 for connecting (cheaper)
                totalDuration: (leg1Duration + layover + leg2Duration) * 60, // in minutes
                legs: [
                    {
                        from: fromIcao,
                        to: hubIcao,
                        carrier: carrier1.name,
                        flightNumber: generateFlightNumber(carrier1),
                        departureTime: dep1,
                        arrivalTime: arr1,
                        aircraft: aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)],
                    },
                    {
                        from: hubIcao,
                        to: toIcao,
                        carrier: carrier2.name,
                        flightNumber: generateFlightNumber(carrier2),
                        departureTime: dep2,
                        arrivalTime: arr2,
                        aircraft: aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)],
                    },
                ],
            });
        }
    }

    // Sort by first leg departure time
    return options.sort((a, b) => a.legs[0].departureTime.getTime() - b.legs[0].departureTime.getTime());
}

/**
 * Update shipment status
 */
export async function updateShipmentStatus(
    shipmentId: string,
    status: ShipmentStatus,
    props?: {
        eventTitle?: string;
        flightDetails?: FlightOption;
    }
): Promise<{ success: boolean }> {
    try {
        const { eventTitle, flightDetails } = props || {};

        await prisma.$transaction(async (tx) => {
            // Update status
            await tx.shipment.update({
                where: { id: shipmentId },
                data: { status },
            });

            // Create event
            const description = flightDetails
                ? flightDetails.legs.length > 1
                    ? `Route updated: ${flightDetails.legs.map(l => l.from).join(" -> ")} -> ${flightDetails.legs[flightDetails.legs.length - 1].to} via ${flightDetails.legs[0].carrier}`
                    : `Loaded onto ${flightDetails.legs[0].carrier} flight ${flightDetails.legs[0].flightNumber} (${flightDetails.legs[0].aircraft})`
                : undefined;

            await tx.shipmentEvent.create({
                data: {
                    shipmentId,
                    type: status === "delivered" ? "delivered" : "carrier_update",
                    title: eventTitle || `Status updated to ${status}`,
                    description,
                    occurredAt: new Date(),
                },
            });

            // If flight details provided, update the air segment
            if (flightDetails) {
                // Delete existing air segments
                await tx.shipmentSegment.deleteMany({
                    where: { shipmentId, type: "air" }
                });

                // Create new segments for each leg
                for (let i = 0; i < flightDetails.legs.length; i++) {
                    const leg = flightDetails.legs[i];
                    await tx.shipmentSegment.create({
                        data: {
                            shipmentId,
                            type: "air",
                            sortOrder: i, // 0, 1, 2...
                            carrier: leg.carrier,
                            carrierTrackingId: `${flightDetails.legs[0].carrier.substring(0, 2)}-${Date.now()}-${i}`,
                            flightNumber: leg.flightNumber,
                            fromAirportIcao: leg.from,
                            toAirportIcao: leg.to,
                            icao24: i === 0 ? "3c66a8" : null, // Mock ICAO24 only for first leg for now or random
                            plannedDepartureAt: leg.departureTime,
                            plannedArrivalAt: leg.arrivalTime,
                        }
                    });
                }
            }
        });

        return { success: true };
    } catch (error) {
        console.error("[updateShipmentStatus] Error:", error);
        return { success: false };
    }
}
