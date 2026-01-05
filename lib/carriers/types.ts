/**
 * Carrier connector framework types for air shipment tracking
 */

/** Aircraft position data from OpenSky or other sources */
export interface AircraftPosition {
    icao24: string;
    callsign: string | null;
    originCountry: string;
    latitude: number | null;
    longitude: number | null;
    baroAltitudeMeters: number | null;
    geoAltitudeMeters: number | null;
    onGround: boolean;
    velocityMps: number | null;
    heading: number | null;
    verticalRateMps: number | null;
    timestamp: number; // Unix timestamp in seconds
    lastContact: number; // Unix timestamp in seconds
}

/** Air carrier definition for auto-assignment */
export interface AirCarrier {
    code: string; // e.g., "FDX"
    name: string; // e.g., "FedEx Express"
    hubIcao: string; // Primary hub airport ICAO code
    flightPrefix: string; // Callsign prefix for identifying flights
}

/** Flight assignment for a shipment */
export interface FlightAssignment {
    carrier: AirCarrier;
    icao24: string;
    callsign: string | null;
    fromAirportIcao: string;
    toAirportIcao: string;
    flightNumber: string;
}

/** Carrier connector interface */
export interface CarrierConnector {
    name: string;

    /** Get current position of an aircraft by its ICAO24 transponder code */
    getAircraftPosition(icao24: string): Promise<AircraftPosition | null>;

    /** Get list of currently active aircraft for potential assignment */
    getActiveAircraft(): Promise<AircraftPosition[]>;
}
