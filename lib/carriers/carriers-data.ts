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

/**
 * List of real major airports for selection
 */
export const REAL_AIRPORTS = [
    { icao: "KJFK", name: "John F. Kennedy International Airport", city: "New York", country: "USA" },
    { icao: "KLAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "USA" },
    { icao: "EGLL", name: "Heathrow Airport", city: "London", country: "UK" },
    { icao: "RJTT", name: "Haneda Airport", city: "Tokyo", country: "Japan" },
    { icao: "EDDF", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany" },
    { icao: "VHHH", name: "Hong Kong International Airport", city: "Hong Kong", country: "Hong Kong" },
    { icao: "LFPG", name: "Charles de Gaulle Airport", city: "Paris", country: "France" },
    { icao: "OMDB", name: "Dubai International Airport", city: "Dubai", country: "UAE" },
    { icao: "VIDP", name: "Indira Gandhi International Airport", city: "Delhi", country: "India" },
    { icao: "WSSS", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore" },
    { icao: "YSSY", name: "Sydney Kingsford Smith Airport", city: "Sydney", country: "Australia" },
    { icao: "ZBAA", name: "Beijing Capital International Airport", city: "Beijing", country: "China" },
    { icao: "KMEM", name: "Memphis International Airport", city: "Memphis", country: "USA" },
    { icao: "KSDF", name: "Louisville Muhammad Ali International Airport", city: "Louisville", country: "USA" },
    { icao: "KCVG", name: "Cincinnati/Northern Kentucky International Airport", city: "Cincinnati", country: "USA" },
    { icao: "KILN", name: "Wilmington Air Park", city: "Wilmington", country: "USA" },
    { icao: "ELLX", name: "Luxembourg Airport", city: "Luxembourg", country: "Luxembourg" },
    { icao: "OTHH", name: "Hamad International Airport", city: "Doha", country: "Qatar" },
    { icao: "LEMD", name: "Adolfo Suárez Madrid–Barajas Airport", city: "Madrid", country: "Spain" },
    { icao: "EHAM", name: "Amsterdam Airport Schiphol", city: "Amsterdam", country: "Netherlands" },
    { icao: "RKSI", name: "Incheon International Airport", city: "Seoul", country: "South Korea" },
    { icao: "RCTP", name: "Taiwan Taoyuan International Airport", city: "Taipei", country: "Taiwan" },
    { icao: "PANC", name: "Ted Stevens Anchorage International Airport", city: "Anchorage", country: "USA" },
    { icao: "KORD", name: "O'Hare International Airport", city: "Chicago", country: "USA" },
    { icao: "KMIA", name: "Miami International Airport", city: "Miami", country: "USA" },
];
