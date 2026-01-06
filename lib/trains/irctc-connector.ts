/**
 * IRCTC Connector - Wrapper for irctc-connect package
 * Provides typed interfaces and error handling for Indian Railways API
 */

import {
    searchTrainBetweenStations,
    getTrainInfo,
    trackTrain,
} from "irctc-connect";

// ==========================================
// Types
// ==========================================

export interface TrainSearchResult {
    trainNumber: string;
    trainName: string;
    departure: string;
    arrival: string;
    duration: string;
    runningDays: string;
    availableClasses: string[];
    trainType?: string;
}

export interface TrainInfoResult {
    trainNo: string;
    trainName: string;
    fromStnCode: string;
    fromStnName: string;
    toStnCode: string;
    toStnName: string;
    fromTime: string;
    toTime: string;
    travelTime: string;
    runningDays: string;
    route: RouteStation[];
}

export interface RouteStation {
    stnCode: string;
    stnName: string;
    arrival: string;
    departure: string;
    haltTime: string;
    distance: string;
    dayCount: string;
    latitude?: number;
    longitude?: number;
}

export interface TrainTrackingResult {
    trainNo: string;
    trainName: string;
    date: string;
    statusNote: string;
    lastUpdate: string;
    totalStations: number;
    stations: StationStatus[];
}

export interface StationStatus {
    stationCode: string;
    stationName: string;
    platform: string;
    distanceKm: string;
    arrival: {
        scheduled: string;
        actual: string;
        delay: string;
    };
    departure: {
        scheduled: string;
        actual: string;
        delay: string;
    };
    coachPosition?: Array<{
        type: string;
        number: string;
        position: string;
    }>;
}

// ==========================================
// Connector Functions
// ==========================================

/**
 * Search for trains between two stations
 */
export async function searchTrains(
    fromStationCode: string,
    toStationCode: string
): Promise<{ success: true; data: TrainSearchResult[] } | { success: false; error: string }> {
    try {
        const result = await searchTrainBetweenStations(
            fromStationCode.toUpperCase(),
            toStationCode.toUpperCase()
        );

        if (!result.success) {
            return { success: false, error: "Failed to search trains" };
        }

        // API returns data as an array directly with snake_case fields
        const rawTrains = Array.isArray(result.data) ? result.data : [];

        const trains: TrainSearchResult[] = rawTrains.map(
            (train: {
                train_no: string;
                train_name: string;
                from_time: string;
                to_time: string;
                travel_time: string;
                running_days: string;
                train_type?: string;
            }) => ({
                trainNumber: train.train_no,
                trainName: train.train_name,
                departure: train.from_time,
                arrival: train.to_time,
                duration: train.travel_time,
                runningDays: formatRunningDays(train.running_days),
                availableClasses: [], // Not provided in this API response
                trainType: train.train_type,
            })
        );

        return { success: true, data: trains };
    } catch (error) {
        console.error("[irctcConnector.searchTrains] Error:", error);
        return { success: false, error: "Failed to connect to railway API" };
    }
}

/**
 * Format running days from binary string to human readable
 * e.g., "1111111" -> "Daily", "0100100" -> "Mon, Thu"
 */
function formatRunningDays(binary: string): string {
    if (!binary || binary === "1111111") return "Daily";

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const runningDays: string[] = [];

    for (let i = 0; i < 7 && i < binary.length; i++) {
        if (binary[i] === "1") {
            runningDays.push(days[i]);
        }
    }

    return runningDays.length > 0 ? runningDays.join(", ") : binary;
}

/**
 * Get detailed train information including route
 */
export async function getTrainDetails(
    trainNumber: string
): Promise<{ success: true; data: TrainInfoResult } | { success: false; error: string }> {
    try {
        const result = await getTrainInfo(trainNumber);

        if (!result.success || !result.data) {
            return { success: false, error: "Train not found" };
        }

        const { trainInfo, route } = result.data;

        return {
            success: true,
            data: {
                trainNo: trainInfo.train_no,
                trainName: trainInfo.train_name,
                fromStnCode: trainInfo.from_stn_code,
                fromStnName: trainInfo.from_stn_name,
                toStnCode: trainInfo.to_stn_code,
                toStnName: trainInfo.to_stn_name,
                fromTime: trainInfo.from_time,
                toTime: trainInfo.to_time,
                travelTime: trainInfo.travel_time,
                runningDays: trainInfo.running_days,
                route:
                    route?.map(
                        (station: {
                            stnCode: string;
                            stnName: string;
                            arrival: string;
                            departure: string;
                            haltTime: string;
                            distance: string;
                            dayCount: string;
                        }) => ({
                            stnCode: station.stnCode,
                            stnName: station.stnName,
                            arrival: station.arrival,
                            departure: station.departure,
                            haltTime: station.haltTime,
                            distance: station.distance,
                            dayCount: station.dayCount,
                        })
                    ) || [],
            },
        };
    } catch (error) {
        console.error("[irctcConnector.getTrainDetails] Error:", error);
        return { success: false, error: "Failed to fetch train details" };
    }
}

/**
 * Track live train status for a specific date
 * @param trainNumber - 5-digit train number
 * @param date - Date in DD-MM-YYYY format
 */
export async function trackLiveTrain(
    trainNumber: string,
    date: string
): Promise<{ success: true; data: TrainTrackingResult } | { success: false; error: string }> {
    try {
        const result = await trackTrain(trainNumber, date);

        if (!result.success || !result.data) {
            return { success: false, error: "Could not track train" };
        }

        const { trainNo, trainName, statusNote, lastUpdate, totalStations, stations } =
            result.data;

        return {
            success: true,
            data: {
                trainNo,
                trainName,
                date: result.data.date,
                statusNote,
                lastUpdate,
                totalStations,
                stations:
                    stations?.map(
                        (station: {
                            stationCode: string;
                            stationName: string;
                            platform: string;
                            distanceKm: string;
                            arrival: { scheduled: string; actual: string; delay: string };
                            departure: { scheduled: string; actual: string; delay: string };
                            coachPosition?: Array<{ type: string; number: string; position: string }>;
                        }) => ({
                            stationCode: station.stationCode,
                            stationName: station.stationName,
                            platform: station.platform,
                            distanceKm: station.distanceKm,
                            arrival: station.arrival,
                            departure: station.departure,
                            coachPosition: station.coachPosition,
                        })
                    ) || [],
            },
        };
    } catch (error) {
        console.error("[irctcConnector.trackLiveTrain] Error:", error);
        return { success: false, error: "Failed to track train" };
    }
}

/**
 * Format date for IRCTC API (DD-MM-YYYY)
 */
export function formatDateForIrctc(date: Date): string {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

// Export as connector object for convenience
export const irctcConnector = {
    searchTrains,
    getTrainDetails,
    trackLiveTrain,
    formatDateForIrctc,
};
