"use server";

import { prisma } from "@/lib/prisma";
import { irctcConnector, getStationByCode } from "@/lib/trains";
import type { TrainShipmentStatus } from "@prisma/client";

// ==========================================
// Types
// ==========================================

export interface CreateTrainShipmentInput {
    packageName: string;
    weightKg: number;
    packageCount?: number;
    description?: string;
    trainNumber: string;
    trainName: string;
    coachType?: string;
    fromStationCode: string;
    fromStationName: string;
    toStationCode: string;
    toStationName: string;
    journeyDate: Date;
    scheduledDep: Date;
    scheduledArr: Date;
}

export interface TrainShipmentFilters {
    status?: TrainShipmentStatus;
    search?: string;
    limit?: number;
    offset?: number;
}

export interface TrainShipmentListItem {
    id: string;
    referenceCode: string;
    status: TrainShipmentStatus;
    packageName: string;
    weightKg: number;
    trainNumber: string;
    trainName: string;
    fromStationCode: string;
    fromStationName: string;
    toStationCode: string;
    toStationName: string;
    journeyDate: Date;
    scheduledDep: Date;
    scheduledArr: Date;
    delayMinutes: number | null;
    createdAt: Date;
}

export interface TrainShipmentDetail {
    id: string;
    referenceCode: string;
    status: TrainShipmentStatus;
    packageName: string;
    weightKg: number;
    packageCount: number;
    description: string | null;
    trainNumber: string;
    trainName: string;
    coachType: string | null;
    pnr: string | null;
    fromStationCode: string;
    fromStationName: string;
    toStationCode: string;
    toStationName: string;
    journeyDate: Date;
    scheduledDep: Date;
    scheduledArr: Date;
    actualDep: Date | null;
    actualArr: Date | null;
    currentStation: string | null;
    currentLat: number | null;
    currentLng: number | null;
    delayMinutes: number | null;
    lastTrackedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    events: Array<{
        id: string;
        type: string;
        title: string;
        description: string | null;
        stationCode: string | null;
        stationName: string | null;
        occurredAt: Date;
    }>;
    positions: Array<{
        id: string;
        stationCode: string;
        stationName: string;
        latitude: number;
        longitude: number;
        arrivalTime: Date | null;
        departureTime: Date | null;
        delay: string | null;
        platform: string | null;
        distanceKm: number | null;
    }>;
}

// ==========================================
// Helpers
// ==========================================

function generateReferenceCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TRN-${timestamp}-${random}`;
}

// ==========================================
// Server Actions
// ==========================================

/**
 * Search for trains between two stations
 */
export async function searchTrains(fromStation: string, toStation: string) {
    return irctcConnector.searchTrains(fromStation, toStation);
}

/**
 * Get train details including route
 */
export async function getTrainDetails(trainNumber: string) {
    return irctcConnector.getTrainDetails(trainNumber);
}

/**
 * Create a new train shipment
 */
export async function createTrainShipment(
    input: CreateTrainShipmentInput
): Promise<{ success: true; shipmentId: string } | { success: false; error: string }> {
    try {
        const referenceCode = generateReferenceCode();

        const shipment = await prisma.trainShipment.create({
            data: {
                referenceCode,
                status: "created",
                packageName: input.packageName,
                weightKg: input.weightKg,
                packageCount: input.packageCount || 1,
                description: input.description,
                trainNumber: input.trainNumber,
                trainName: input.trainName,
                coachType: input.coachType,
                fromStationCode: input.fromStationCode,
                fromStationName: input.fromStationName,
                toStationCode: input.toStationCode,
                toStationName: input.toStationName,
                journeyDate: input.journeyDate,
                scheduledDep: input.scheduledDep,
                scheduledArr: input.scheduledArr,
                events: {
                    create: {
                        type: "created",
                        title: "Shipment Created",
                        description: `Package "${input.packageName}" scheduled on ${input.trainName} (${input.trainNumber})`,
                        occurredAt: new Date(),
                    },
                },
            },
        });

        return { success: true, shipmentId: shipment.id };
    } catch (error) {
        console.error("[createTrainShipment] Error:", error);
        return { success: false, error: "Failed to create train shipment" };
    }
}

/**
 * List train shipments with optional filters
 */
export async function listTrainShipments(
    filters: TrainShipmentFilters = {}
): Promise<{ shipments: TrainShipmentListItem[]; total: number }> {
    const { status, search, limit = 20, offset = 0 } = filters;

    const where: Record<string, unknown> = {};

    if (status) {
        where.status = status;
    }

    if (search) {
        where.OR = [
            { referenceCode: { contains: search, mode: "insensitive" } },
            { trainNumber: { contains: search, mode: "insensitive" } },
            { trainName: { contains: search, mode: "insensitive" } },
            { packageName: { contains: search, mode: "insensitive" } },
        ];
    }

    const [shipments, total] = await Promise.all([
        prisma.trainShipment.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: offset,
        }),
        prisma.trainShipment.count({ where }),
    ]);

    return {
        shipments: shipments.map((s) => ({
            id: s.id,
            referenceCode: s.referenceCode,
            status: s.status,
            packageName: s.packageName,
            weightKg: Number(s.weightKg),
            trainNumber: s.trainNumber,
            trainName: s.trainName,
            fromStationCode: s.fromStationCode,
            fromStationName: s.fromStationName,
            toStationCode: s.toStationCode,
            toStationName: s.toStationName,
            journeyDate: s.journeyDate,
            scheduledDep: s.scheduledDep,
            scheduledArr: s.scheduledArr,
            delayMinutes: s.delayMinutes,
            createdAt: s.createdAt,
        })),
        total,
    };
}

/**
 * Get detailed train shipment information
 */
export async function getTrainShipmentDetail(
    shipmentId: string
): Promise<TrainShipmentDetail | null> {
    const shipment = await prisma.trainShipment.findUnique({
        where: { id: shipmentId },
        include: {
            events: { orderBy: { occurredAt: "desc" } },
            positions: { orderBy: { createdAt: "asc" } },
        },
    });

    if (!shipment) {
        return null;
    }

    return {
        id: shipment.id,
        referenceCode: shipment.referenceCode,
        status: shipment.status,
        packageName: shipment.packageName,
        weightKg: Number(shipment.weightKg),
        packageCount: shipment.packageCount,
        description: shipment.description,
        trainNumber: shipment.trainNumber,
        trainName: shipment.trainName,
        coachType: shipment.coachType,
        pnr: shipment.pnr,
        fromStationCode: shipment.fromStationCode,
        fromStationName: shipment.fromStationName,
        toStationCode: shipment.toStationCode,
        toStationName: shipment.toStationName,
        journeyDate: shipment.journeyDate,
        scheduledDep: shipment.scheduledDep,
        scheduledArr: shipment.scheduledArr,
        actualDep: shipment.actualDep,
        actualArr: shipment.actualArr,
        currentStation: shipment.currentStation,
        currentLat: shipment.currentLat ? Number(shipment.currentLat) : null,
        currentLng: shipment.currentLng ? Number(shipment.currentLng) : null,
        delayMinutes: shipment.delayMinutes,
        lastTrackedAt: shipment.lastTrackedAt,
        createdAt: shipment.createdAt,
        updatedAt: shipment.updatedAt,
        events: shipment.events.map((e) => ({
            id: e.id,
            type: e.type,
            title: e.title,
            description: e.description,
            stationCode: e.stationCode,
            stationName: e.stationName,
            occurredAt: e.occurredAt,
        })),
        positions: shipment.positions.map((p) => ({
            id: p.id,
            stationCode: p.stationCode,
            stationName: p.stationName,
            latitude: Number(p.latitude),
            longitude: Number(p.longitude),
            arrivalTime: p.arrivalTime,
            departureTime: p.departureTime,
            delay: p.delay,
            platform: p.platform,
            distanceKm: p.distanceKm,
        })),
    };
}

/**
 * Update train shipment status
 */
export async function updateTrainShipmentStatus(
    shipmentId: string,
    status: TrainShipmentStatus,
    eventTitle?: string
): Promise<{ success: boolean }> {
    try {
        await prisma.$transaction([
            prisma.trainShipment.update({
                where: { id: shipmentId },
                data: { status },
            }),
            prisma.trainShipmentEvent.create({
                data: {
                    shipmentId,
                    type: status,
                    title: eventTitle || `Status updated to ${status.replace(/_/g, " ")}`,
                    occurredAt: new Date(),
                },
            }),
        ]);

        return { success: true };
    } catch (error) {
        console.error("[updateTrainShipmentStatus] Error:", error);
        return { success: false };
    }
}

/**
 * Refresh train position from IRCTC API
 */
export async function refreshTrainPosition(
    shipmentId: string
): Promise<{ success: boolean; statusNote?: string }> {
    try {
        const shipment = await prisma.trainShipment.findUnique({
            where: { id: shipmentId },
        });

        if (!shipment) {
            return { success: false };
        }

        // Format date for IRCTC API
        const dateStr = irctcConnector.formatDateForIrctc(shipment.journeyDate);
        const result = await irctcConnector.trackLiveTrain(shipment.trainNumber, dateStr);

        if (!result.success) {
            return { success: false };
        }

        const { statusNote, stations } = result.data;

        // Find current station (last one with actual departure or arrival)
        let currentStationData = null;
        for (const station of stations) {
            if (
                station.departure.actual !== "" &&
                station.departure.actual !== "SRC"
            ) {
                currentStationData = station;
            }
        }

        // Get coordinates for current station
        const stationCoords = currentStationData
            ? getStationByCode(currentStationData.stationCode)
            : null;

        // Parse delay
        let delayMinutes: number | null = null;
        if (currentStationData?.departure.delay) {
            const delayMatch = currentStationData.departure.delay.match(/(\d+)/);
            if (delayMatch) {
                delayMinutes = parseInt(delayMatch[1], 10);
            }
        }

        // Update shipment with current position
        await prisma.trainShipment.update({
            where: { id: shipmentId },
            data: {
                currentStation: currentStationData?.stationCode || null,
                currentLat: stationCoords?.latitude || null,
                currentLng: stationCoords?.longitude || null,
                delayMinutes,
                lastTrackedAt: new Date(),
                status:
                    shipment.status === "created" || shipment.status === "waiting_for_train"
                        ? currentStationData
                            ? "in_transit"
                            : "waiting_for_train"
                        : shipment.status,
            },
        });

        // Store position points for route history
        for (const station of stations) {
            const coords = getStationByCode(station.stationCode);
            if (coords) {
                await prisma.trainPositionPoint.upsert({
                    where: {
                        shipmentId_stationCode: {
                            shipmentId,
                            stationCode: station.stationCode,
                        },
                    },
                    create: {
                        shipmentId,
                        stationCode: station.stationCode,
                        stationName: station.stationName,
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                        delay: station.departure.delay || station.arrival.delay || null,
                        platform: station.platform || null,
                        distanceKm: station.distanceKm ? parseInt(station.distanceKm, 10) : null,
                    },
                    update: {
                        delay: station.departure.delay || station.arrival.delay || null,
                        platform: station.platform || null,
                    },
                });
            }
        }

        return { success: true, statusNote };
    } catch (error) {
        console.error("[refreshTrainPosition] Error:", error);
        return { success: false };
    }
}
