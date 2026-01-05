"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface AirPositionData {
    icao24: string;
    callsign: string | null;
    latitude: number;
    longitude: number;
    altitude: number | null;
    heading: number | null;
    velocity: number | null;
    onGround: boolean;
    timestamp: string;
    cached?: boolean;
}

export interface ShipmentEventData {
    id: string;
    type: string;
    title: string;
    description: string | null;
    locationName: string | null;
    occurredAt: string;
}

export interface UseShipmentStreamResult {
    airPosition: AirPositionData | null;
    events: ShipmentEventData[];
    isConnected: boolean;
    isLoading: boolean;
    error: string | null;
    status: string | null;
}

/**
 * Hook to subscribe to real-time air shipment updates via SSE
 */
export function useShipmentStream(
    shipmentId: string | null
): UseShipmentStreamResult {
    const [airPosition, setAirPosition] = useState<AirPositionData | null>(null);
    const [events, setEvents] = useState<ShipmentEventData[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);

    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reconnectAttemptsRef = useRef(0);

    const connect = useCallback((id: string) => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        setIsLoading(true);
        setError(null);

        const eventSource = new EventSource(`/api/air/shipments/${id}/stream`);
        eventSourceRef.current = eventSource;

        eventSource.addEventListener("connected", () => {
            setIsConnected(true);
            setIsLoading(false);
            reconnectAttemptsRef.current = 0;
        });

        eventSource.addEventListener("air_position", (event) => {
            try {
                const data: AirPositionData = JSON.parse(event.data);
                setAirPosition(data);
            } catch {
                console.error("[useShipmentStream] Failed to parse air_position");
            }
        });

        eventSource.addEventListener("status_event", (event) => {
            try {
                const data: ShipmentEventData = JSON.parse(event.data);
                setEvents((prev) => {
                    // Avoid duplicates
                    if (prev.some((e) => e.id === data.id)) return prev;
                    return [data, ...prev];
                });
            } catch {
                console.error("[useShipmentStream] Failed to parse status_event");
            }
        });

        eventSource.addEventListener("completed", (event) => {
            try {
                const data = JSON.parse(event.data);
                setStatus(data.status);
                setIsConnected(false);
                eventSource.close();
            } catch {
                console.error("[useShipmentStream] Failed to parse completed");
            }
        });

        eventSource.addEventListener("error", () => {
            setIsConnected(false);
            setIsLoading(false);

            const attempts = reconnectAttemptsRef.current;
            const delay = Math.min(1000 * Math.pow(2, attempts), 30000);

            reconnectAttemptsRef.current += 1;

            if (attempts < 10) {
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect(id);
                }, delay);
            } else {
                setError("Connection lost. Please refresh the page.");
            }
        });

        eventSource.onerror = () => {
            // Handled by error event listener
        };
    }, []);

    useEffect(() => {
        if (!shipmentId) {
            setAirPosition(null);
            setEvents([]);
            setIsConnected(false);
            setIsLoading(false);
            setError(null);
            setStatus(null);

            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }

            return;
        }

        connect(shipmentId);

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
        };
    }, [shipmentId, connect]);

    return {
        airPosition,
        events,
        isConnected,
        isLoading,
        error,
        status,
    };
}
