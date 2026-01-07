// Types for flight path visualization

export interface FlightSegmentMapData {
    id: string;
    type: string;
    sortOrder: number;
    fromIcao: string | null;
    toIcao: string | null;
    flightNumber: string | null;
    carrier: string | null;
    plannedDepartureAt: Date | null;
    plannedArrivalAt: Date | null;
    actualDepartureAt: Date | null;
    actualArrivalAt: Date | null;
    isActive: boolean;
}

export interface AirportMarkerData {
    icao: string;
    type: "departure" | "connection" | "arrival";
    label: string;
    coords: [number, number];
    flightInfo?: {
        inboundFlight?: string;
        outboundFlight?: string;
        arrivalTime?: Date | null;
        departureTime?: Date | null;
    };
}
