"use client";

import * as React from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getStationByCode } from "@/lib/trains";

interface TrainPosition {
    stationCode: string;
    stationName: string;
    latitude: number;
    longitude: number;
    delay?: string | null;
    platform?: string | null;
}

interface TrainTrackingMapProps {
    fromStationCode: string;
    toStationCode: string;
    currentStationCode?: string | null;
    positions?: TrainPosition[];
    routeStations?: Array<{ code: string; name: string }>;
}

/**
 * Fetch real route from Mapbox Directions API
 * Uses driving profile as approximation for rail routes
 */
async function fetchRoute(
    coordinates: [number, number][]
): Promise<[number, number][] | null> {
    if (coordinates.length < 2) return null;

    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!accessToken) return null;

    try {
        // Mapbox limits to 25 waypoints per request
        const waypoints = coordinates.slice(0, 25);
        const coordString = waypoints.map((c) => c.join(",")).join(";");

        const response = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${coordString}?geometries=geojson&overview=full&access_token=${accessToken}`
        );

        if (!response.ok) return null;

        const data = await response.json();
        if (data.routes && data.routes[0]?.geometry?.coordinates) {
            return data.routes[0].geometry.coordinates;
        }
        return null;
    } catch (error) {
        console.error("[fetchRoute] Error:", error);
        return null;
    }
}

export function TrainTrackingMap({
    fromStationCode,
    toStationCode,
    currentStationCode,
    positions = [],
    routeStations = [],
}: TrainTrackingMapProps) {
    const mapContainer = React.useRef<HTMLDivElement>(null);
    const map = React.useRef<mapboxgl.Map | null>(null);
    const trainMarker = React.useRef<mapboxgl.Marker | null>(null);
    const markersRef = React.useRef<mapboxgl.Marker[]>([]);
    const [isLoadingRoute, setIsLoadingRoute] = React.useState(false);

    const fromCoords = getStationByCode(fromStationCode);
    const toCoords = getStationByCode(toStationCode);
    const currentCoords = currentStationCode
        ? getStationByCode(currentStationCode)
        : null;

    // Initialize map
    React.useEffect(() => {
        if (!mapContainer.current || map.current) return;

        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

        const center: [number, number] = fromCoords
            ? [fromCoords.longitude, fromCoords.latitude]
            : [78.9629, 20.5937]; // Center of India

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/dark-v11",
            center,
            zoom: 5,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

        map.current.on("load", () => {
            if (!map.current) return;

            // Add route line source (full route)
            map.current.addSource("route", {
                type: "geojson",
                data: {
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "LineString",
                        coordinates: [],
                    },
                },
            });

            // Add route line layer (dashed for planned route)
            map.current.addLayer({
                id: "route-line",
                type: "line",
                source: "route",
                layout: {
                    "line-join": "round",
                    "line-cap": "round",
                },
                paint: {
                    "line-color": "#f59e0b",
                    "line-width": 4,
                    "line-opacity": 0.7,
                },
            });

            // Add traveled route source
            map.current.addSource("traveled", {
                type: "geojson",
                data: {
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "LineString",
                        coordinates: [],
                    },
                },
            });

            // Add traveled route layer (solid green for completed)
            map.current.addLayer({
                id: "traveled-line",
                type: "line",
                source: "traveled",
                layout: {
                    "line-join": "round",
                    "line-cap": "round",
                },
                paint: {
                    "line-color": "#22c55e",
                    "line-width": 5,
                },
            });
        });

        return () => {
            // Cleanup markers
            markersRef.current.forEach((m) => m.remove());
            markersRef.current = [];
            if (trainMarker.current) {
                trainMarker.current.remove();
                trainMarker.current = null;
            }
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [fromCoords]);

    // Add station markers and fetch route
    React.useEffect(() => {
        if (!map.current) return;

        // Clear existing markers
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        // Build waypoints for route
        const waypoints: [number, number][] = [];

        // Origin marker
        if (fromCoords) {
            waypoints.push([fromCoords.longitude, fromCoords.latitude]);
            const el = document.createElement("div");
            el.innerHTML = `
                <div class="flex items-center justify-center size-8 rounded-full bg-blue-500 border-2 border-white shadow-lg">
                    <span class="text-white text-xs font-bold">O</span>
                </div>
            `;
            const marker = new mapboxgl.Marker({ element: el })
                .setLngLat([fromCoords.longitude, fromCoords.latitude])
                .setPopup(
                    new mapboxgl.Popup({ offset: 25 }).setHTML(
                        `<strong>Origin</strong><br/>${fromCoords.name} (${fromStationCode})`
                    )
                )
                .addTo(map.current);
            markersRef.current.push(marker);
        }

        // Intermediate station markers (from positions or routeStations)
        const intermediateStations =
            positions.length > 0
                ? positions.map((p) => ({ code: p.stationCode, name: p.stationName }))
                : routeStations;

        intermediateStations.forEach((station) => {
            if (station.code === fromStationCode || station.code === toStationCode)
                return;
            const coords = getStationByCode(station.code);
            if (!coords) return;

            waypoints.push([coords.longitude, coords.latitude]);

            const el = document.createElement("div");
            el.innerHTML = `
                <div class="flex items-center justify-center size-5 rounded-full bg-gray-500 border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform">
                </div>
            `;
            const marker = new mapboxgl.Marker({ element: el })
                .setLngLat([coords.longitude, coords.latitude])
                .setPopup(
                    new mapboxgl.Popup({ offset: 15 }).setHTML(
                        `<strong>${station.name}</strong><br/>${station.code}`
                    )
                )
                .addTo(map.current!);
            markersRef.current.push(marker);
        });

        // Destination marker
        if (toCoords) {
            waypoints.push([toCoords.longitude, toCoords.latitude]);
            const el = document.createElement("div");
            el.innerHTML = `
                <div class="flex items-center justify-center size-8 rounded-full bg-green-500 border-2 border-white shadow-lg">
                    <span class="text-white text-xs font-bold">D</span>
                </div>
            `;
            const marker = new mapboxgl.Marker({ element: el })
                .setLngLat([toCoords.longitude, toCoords.latitude])
                .setPopup(
                    new mapboxgl.Popup({ offset: 25 }).setHTML(
                        `<strong>Destination</strong><br/>${toCoords.name} (${toStationCode})`
                    )
                )
                .addTo(map.current);
            markersRef.current.push(marker);
        }

        // Fetch and draw real route
        const drawRoute = async () => {
            if (waypoints.length < 2) return;

            setIsLoadingRoute(true);
            try {
                const routeCoords = await fetchRoute(waypoints);

                if (routeCoords && map.current?.getSource("route")) {
                    (map.current.getSource("route") as mapboxgl.GeoJSONSource).setData({
                        type: "Feature",
                        properties: {},
                        geometry: {
                            type: "LineString",
                            coordinates: routeCoords,
                        },
                    });
                } else if (map.current?.getSource("route")) {
                    // Fallback to straight lines if API fails
                    (map.current.getSource("route") as mapboxgl.GeoJSONSource).setData({
                        type: "Feature",
                        properties: {},
                        geometry: {
                            type: "LineString",
                            coordinates: waypoints,
                        },
                    });
                }
            } finally {
                setIsLoadingRoute(false);
            }
        };

        // Wait for map to be loaded
        if (map.current.isStyleLoaded()) {
            drawRoute();
        } else {
            map.current.once("load", drawRoute);
        }

        // Fit bounds
        if (fromCoords && toCoords) {
            const bounds = new mapboxgl.LngLatBounds()
                .extend([fromCoords.longitude, fromCoords.latitude])
                .extend([toCoords.longitude, toCoords.latitude]);

            // Include intermediate waypoints in bounds
            waypoints.forEach((wp) => bounds.extend(wp));

            map.current.fitBounds(bounds, { padding: 60 });
        }
    }, [fromCoords, toCoords, fromStationCode, toStationCode, routeStations, positions]);

    // Update train position
    React.useEffect(() => {
        if (!map.current) return;

        const trainCoords = currentCoords;
        if (!trainCoords) {
            // Remove train marker if no current position
            if (trainMarker.current) {
                trainMarker.current.remove();
                trainMarker.current = null;
            }
            return;
        }

        // Create or update train marker
        if (!trainMarker.current) {
            const el = document.createElement("div");
            el.innerHTML = `
                <div class="relative">
                    <div class="flex items-center justify-center size-12 rounded-full bg-amber-500 border-3 border-white shadow-xl animate-pulse">
                        <svg class="size-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2l2-2h4l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-7H6V6h5v4zm2 0V6h5v4h-5zm3.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                        </svg>
                    </div>
                    <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-amber-500/50 rounded-full blur-sm"></div>
                </div>
            `;

            trainMarker.current = new mapboxgl.Marker({ element: el })
                .setLngLat([trainCoords.longitude, trainCoords.latitude])
                .setPopup(
                    new mapboxgl.Popup({ offset: 30 }).setHTML(
                        `<strong>🚂 Train Position</strong><br/>At: ${currentStationCode}`
                    )
                )
                .addTo(map.current);
        } else {
            trainMarker.current.setLngLat([trainCoords.longitude, trainCoords.latitude]);
        }

        // Update traveled route (green line up to current position)
        if (positions.length > 0 && map.current.getSource("traveled")) {
            const currentIdx = positions.findIndex(
                (p) => p.stationCode === currentStationCode
            );
            if (currentIdx >= 0) {
                const traveledWaypoints = positions
                    .slice(0, currentIdx + 1)
                    .map((p) => [p.longitude, p.latitude] as [number, number]);

                // Fetch actual route for traveled portion
                fetchRoute(traveledWaypoints).then((routeCoords) => {
                    if (routeCoords && map.current?.getSource("traveled")) {
                        (map.current.getSource("traveled") as mapboxgl.GeoJSONSource).setData({
                            type: "Feature",
                            properties: {},
                            geometry: {
                                type: "LineString",
                                coordinates: routeCoords,
                            },
                        });
                    }
                });
            }
        }
    }, [currentCoords, currentStationCode, positions]);

    return (
        <div className="relative h-full w-full rounded-lg overflow-hidden border">
            <div ref={mapContainer} className="h-full w-full" />

            {/* Loading indicator */}
            {isLoadingRoute && (
                <div className="absolute top-4 right-4 rounded-lg bg-background/90 backdrop-blur-sm border px-3 py-1.5 text-xs flex items-center gap-2">
                    <div className="size-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    Loading route...
                </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 rounded-lg bg-background/90 backdrop-blur-sm border p-3 text-xs">
                <div className="flex items-center gap-2 mb-1.5">
                    <div className="size-3 rounded-full bg-blue-500" />
                    <span>Origin</span>
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                    <div className="size-3 rounded-full bg-green-500" />
                    <span>Destination</span>
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                    <div className="size-3 rounded-full bg-amber-500" />
                    <span>Train</span>
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-1 bg-amber-500 rounded" />
                    <span>Planned Route</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-1 bg-green-500 rounded" />
                    <span>Traveled</span>
                </div>
            </div>
        </div>
    );
}
