import type { AirCarrier } from "./types";

/**
 * List of major cargo air carriers for shipment auto-assignment
 */
export const AIR_CARRIERS: AirCarrier[] = [
    {
        code: "FDX",
        name: "FedEx Express",
        hubIcao: "KMEM",
        flightPrefix: "FDX",
    },
    {
        code: "UPS",
        name: "UPS Airlines",
        hubIcao: "KSDF",
        flightPrefix: "UPS",
    },
    {
        code: "DHL",
        name: "DHL Aviation",
        hubIcao: "KCVG",
        flightPrefix: "BCS",
    },
    {
        code: "ABX",
        name: "ABX Air",
        hubIcao: "KILN",
        flightPrefix: "ABX",
    },
    {
        code: "GTI",
        name: "Atlas Air",
        hubIcao: "KJFK",
        flightPrefix: "GTI",
    },
    {
        code: "CLX",
        name: "Cargolux",
        hubIcao: "ELLX",
        flightPrefix: "CLX",
    },
    {
        code: "CAO",
        name: "Air China Cargo",
        hubIcao: "ZBAA",
        flightPrefix: "CAO",
    },
    {
        code: "QTR",
        name: "Qatar Airways Cargo",
        hubIcao: "OTHH",
        flightPrefix: "QTR",
    },
    {
        code: "UAE",
        name: "Emirates SkyCargo",
        hubIcao: "OMDB",
        flightPrefix: "UAE",
    },
    {
        code: "SIA",
        name: "Singapore Airlines Cargo",
        hubIcao: "WSSS",
        flightPrefix: "SIA",
    },
];

/**
 * Common airport pairs for simulated routes
 */
export const AIRPORT_PAIRS = [
    { from: "KJFK", to: "EGLL", name: "New York - London" },
    { from: "KLAX", to: "RJTT", name: "Los Angeles - Tokyo" },
    { from: "KMEM", to: "EDDF", name: "Memphis - Frankfurt" },
    { from: "KSDF", to: "VHHH", name: "Louisville - Hong Kong" },
    { from: "OTHH", to: "LFPG", name: "Doha - Paris" },
    { from: "OMDB", to: "VIDP", name: "Dubai - Delhi" },
    { from: "WSSS", to: "YSSY", name: "Singapore - Sydney" },
    { from: "ZBAA", to: "KJFK", name: "Beijing - New York" },
    { from: "KCVG", to: "LEMD", name: "Cincinnati - Madrid" },
    { from: "ELLX", to: "ZBAA", name: "Luxembourg - Beijing" },
];

/**
 * Get a random carrier for auto-assignment
 */
export function getRandomCarrier(): AirCarrier {
    return AIR_CARRIERS[Math.floor(Math.random() * AIR_CARRIERS.length)];
}

/**
 * Get a random airport pair for auto-assignment
 */
export function getRandomAirportPair(): { from: string; to: string; name: string } {
    return AIRPORT_PAIRS[Math.floor(Math.random() * AIRPORT_PAIRS.length)];
}

/**
 * Generate a random flight number for a carrier
 */
export function generateFlightNumber(carrier: AirCarrier): string {
    const num = Math.floor(Math.random() * 9000) + 1000;
    return `${carrier.code}${num}`;
}
