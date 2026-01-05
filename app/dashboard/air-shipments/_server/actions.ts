"use server";

import { prisma } from "@/lib/prisma";
import {
    getRandomCarrier,
    getRandomAirportPair,
    generateFlightNumber
} from "@/lib/carriers/carriers-data";
import { getRandomActiveAircraft, openSkyConnector } from "@/lib/carriers/opensky";
import type { ShipmentStatus, ShipmentSegmentType, ShipmentEventType } from "../../../../generated/prisma/enums";

// ==========================================
// Types
// ==========================================

export interface CreateShipmentInput {
    packageName: string;
    weightKg: number;
    description?: string;
}

export interface ShipmentFilters {
    status?: ShipmentStatus;
    carrier?: string;
    search?: string;
    limit?: number;
    offset?: number;
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
        const carrier = getRandomCarrier();
        const route = getRandomAirportPair();
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
                        fromAirportIcao: route.from,
                        toAirportIcao: route.to,
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

    const items: ShipmentListItem[] = shipments.map((s) => {
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
        segments: shipment.segments.map((seg) => ({
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
        events: shipment.events.map((evt) => ({
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
 * Update shipment status
 */
export async function updateShipmentStatus(
    shipmentId: string,
    status: ShipmentStatus,
    eventTitle?: string
): Promise<{ success: boolean }> {
    try {
        await prisma.$transaction([
            prisma.shipment.update({
                where: { id: shipmentId },
                data: { status },
            }),
            prisma.shipmentEvent.create({
                data: {
                    shipmentId,
                    type: status === "delivered" ? "delivered" : "carrier_update",
                    title: eventTitle || `Status updated to ${status}`,
                    occurredAt: new Date(),
                },
            }),
        ]);

        return { success: true };
    } catch (error) {
        console.error("[updateShipmentStatus] Error:", error);
        return { success: false };
    }
}
