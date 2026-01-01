"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface DriverLocationData {
    latitude: number;
    longitude: number;
    speedMps: number | null;
    heading: number | null;
    routeGeometry?: unknown; // GeoJSON
    updatedAt: string;
}

export interface PathPoint {
    latitude: number;
    longitude: number;
    speedMps: number | null;
    heading: number | null;
    timestamp: string;
}

export interface UseDriverLocationResult {
    current: DriverLocationData | null;
    path: PathPoint[];
    isConnected: boolean;
    isLoading: boolean;
    error: string | null;
}

/**
 * Hook to subscribe to real-time driver location updates via SSE
 */
export function useDriverLocation(jobId: string | null): UseDriverLocationResult {
    const [current, setCurrent] = useState<DriverLocationData | null>(null);
    const [path, setPath] = useState<PathPoint[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reconnectAttemptsRef = useRef(0);

    const fetchInitialPath = useCallback(async (id: string) => {
        try {
            const response = await fetch(`/api/driver/location/${id}`);
            if (!response.ok) {
                if (response.status === 404) {
                    // No location data yet, that's okay
                    return;
                }
                throw new Error(`Failed to fetch location: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.current) {
                setCurrent(data.current);
            }

            if (data.path && Array.isArray(data.path)) {
                setPath(data.path);
            }
        } catch (err) {
            console.error("[useDriverLocation] Failed to fetch initial path:", err);
            // Don't set error state for initial fetch failure
        }
    }, []);

    const connect = useCallback((id: string) => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        setIsLoading(true);
        setError(null);

        const eventSource = new EventSource(`/api/driver/location/${id}/stream`);
        eventSourceRef.current = eventSource;

        eventSource.addEventListener("connected", () => {
            setIsConnected(true);
            setIsLoading(false);
            reconnectAttemptsRef.current = 0;
        });

        eventSource.addEventListener("location", (event) => {
            try {
                const data: DriverLocationData = JSON.parse(event.data);
                setCurrent(data);

                // Add to path
                setPath(prev => {
                    const newPoint: PathPoint = {
                        latitude: data.latitude,
                        longitude: data.longitude,
                        speedMps: data.speedMps,
                        heading: data.heading,
                        // routeGeometry is not needed in path history usually, but could be
                        timestamp: data.updatedAt,
                    };

                    // Avoid duplicates
                    const lastPoint = prev[prev.length - 1];
                    if (lastPoint && lastPoint.timestamp === newPoint.timestamp) {
                        return prev;
                    }

                    return [...prev, newPoint];
                });
            } catch (err) {
                console.error("[useDriverLocation] Failed to parse location event:", err);
            }
        });

        eventSource.addEventListener("completed", (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("[useDriverLocation] Job completed:", data.status);
                setIsConnected(false);
                eventSource.close();
            } catch (err) {
                console.error("[useDriverLocation] Failed to parse completed event:", err);
            }
        });

        eventSource.addEventListener("error", (event) => {
            console.error("[useDriverLocation] SSE error:", event);
            setIsConnected(false);
            setIsLoading(false);

            // Attempt reconnection with exponential backoff
            const attempts = reconnectAttemptsRef.current;
            const delay = Math.min(1000 * Math.pow(2, attempts), 30000); // Max 30s

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
            // This is handled by the error event listener above
        };
    }, []);

    useEffect(() => {
        if (!jobId) {
            // Reset state when no job is selected
            setCurrent(null);
            setPath([]);
            setIsConnected(false);
            setIsLoading(false);
            setError(null);

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

        // Fetch initial path data
        fetchInitialPath(jobId);

        // Connect to SSE stream
        connect(jobId);

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
    }, [jobId, connect, fetchInitialPath]);

    return {
        current,
        path,
        isConnected,
        isLoading,
        error,
    };
}
