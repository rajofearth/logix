"use client";

import * as React from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { AirPositionData } from "../_hooks/useShipmentStream";

// Airport coordinates (simplified lookup)
const AIRPORT_COORDS: Record<string, [number, number]> = {
    KJFK: [-73.7781, 40.6413],
    KLAX: [-118.4085, 33.9416],
    KMEM: [-89.9767, 35.0424],
    KSDF: [-85.736, 38.1744],
    EGLL: [-0.4543, 51.4700],
    EDDF: [8.5622, 50.0379],
    RJTT: [139.7798, 35.5494],
    VHHH: [113.9185, 22.3080],
    LFPG: [2.5479, 49.0097],
    VIDP: [77.1025, 28.5562],
    OTHH: [51.6138, 25.2731],
    OMDB: [55.3644, 25.2528],
    WSSS: [103.9915, 1.3644],
    YSSY: [151.1772, -33.9399],
    ZBAA: [116.5975, 40.0799],
    KCVG: [-84.6678, 39.0488],
    ELLX: [6.2044, 49.6233],
    LEMD: [-3.5673, 40.4719],
};

interface AirTrackingMapProps {
    fromAirportIcao: string | null;
    toAirportIcao: string | null;
    aircraftPosition: AirPositionData | null;
    positionHistory?: Array<{ lat: number; lng: number }>;
}

export function AirTrackingMap({
    fromAirportIcao,
    toAirportIcao,
    aircraftPosition,
    positionHistory = [],
}: AirTrackingMapProps) {
    const mapContainer = React.useRef<HTMLDivElement>(null);
    const map = React.useRef<mapboxgl.Map | null>(null);
    const aircraftMarker = React.useRef<mapboxgl.Marker | null>(null);

    const fromCoords = fromAirportIcao ? AIRPORT_COORDS[fromAirportIcao] : null;
    const toCoords = toAirportIcao ? AIRPORT_COORDS[toAirportIcao] : null;

    // Initialize map
    React.useEffect(() => {
        if (!mapContainer.current || map.current) return;

        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

        const center: [number, number] = fromCoords || [0, 20];

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/dark-v11",
            center,
            zoom: 2,
            projection: "globe",
        });

        map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

        map.current.on("load", () => {
            if (!map.current) return;

            // Add route line source
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

            // Add route line layer
            map.current.addLayer({
                id: "route-line",
                type: "line",
                source: "route",
                layout: {
                    "line-join": "round",
                    "line-cap": "round",
                },
                paint: {
                    "line-color": "#3b82f6",
                    "line-width": 3,
                    "line-dasharray": [2, 2],
                },
            });

            // Add trail source
            map.current.addSource("trail", {
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

            // Add trail layer
            map.current.addLayer({
                id: "trail-line",
                type: "line",
                source: "trail",
                layout: {
                    "line-join": "round",
                    "line-cap": "round",
                },
                paint: {
                    "line-color": "#22c55e",
                    "line-width": 2,
                },
            });
        });

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [fromCoords]);

    // Add airport markers
    React.useEffect(() => {
        if (!map.current) return;

        // Create departure marker
        if (fromCoords) {
            const depEl = document.createElement("div");
            depEl.innerHTML = `
        <div class="flex items-center justify-center size-8 rounded-full bg-blue-500 border-2 border-white shadow-lg">
          <span class="text-white text-xs font-bold">D</span>
        </div>
      `;
            new mapboxgl.Marker({ element: depEl })
                .setLngLat(fromCoords)
                .setPopup(new mapboxgl.Popup().setHTML(`<strong>Departure</strong><br/>${fromAirportIcao}`))
                .addTo(map.current);
        }

        // Create arrival marker
        if (toCoords) {
            const arrEl = document.createElement("div");
            arrEl.innerHTML = `
        <div class="flex items-center justify-center size-8 rounded-full bg-green-500 border-2 border-white shadow-lg">
          <span class="text-white text-xs font-bold">A</span>
        </div>
      `;
            new mapboxgl.Marker({ element: arrEl })
                .setLngLat(toCoords)
                .setPopup(new mapboxgl.Popup().setHTML(`<strong>Arrival</strong><br/>${toAirportIcao}`))
                .addTo(map.current);
        }

        // Draw route line
        if (fromCoords && toCoords && map.current.getSource("route")) {
            // Create arc points for great circle route
            const points = generateArcPoints(fromCoords, toCoords, 50);

            (map.current.getSource("route") as mapboxgl.GeoJSONSource).setData({
                type: "Feature",
                properties: {},
                geometry: {
                    type: "LineString",
                    coordinates: points,
                },
            });

            // Fit bounds to show both airports
            const bounds = new mapboxgl.LngLatBounds()
                .extend(fromCoords)
                .extend(toCoords);

            map.current.fitBounds(bounds, { padding: 100 });
        }
    }, [fromCoords, toCoords, fromAirportIcao, toAirportIcao]);

    // Update aircraft position
    React.useEffect(() => {
        if (!map.current || !aircraftPosition) return;

        const { latitude, longitude, heading } = aircraftPosition;

        // Create or update aircraft marker
        if (!aircraftMarker.current) {
            const el = document.createElement("div");
            el.innerHTML = `
        <div class="relative">
          <div class="flex items-center justify-center size-10 rounded-full bg-yellow-500 border-2 border-white shadow-lg animate-pulse">
            <svg class="size-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
          </div>
        </div>
      `;
            el.style.transform = `rotate(${heading || 0}deg)`;

            aircraftMarker.current = new mapboxgl.Marker({ element: el })
                .setLngLat([longitude, latitude])
                .setPopup(
                    new mapboxgl.Popup().setHTML(`
            <strong>${aircraftPosition.callsign || aircraftPosition.icao24}</strong><br/>
            Altitude: ${aircraftPosition.altitude ? Math.round(aircraftPosition.altitude) + " m" : "N/A"}<br/>
            Speed: ${aircraftPosition.velocity ? Math.round(aircraftPosition.velocity * 1.944) + " kts" : "N/A"}
          `)
                )
                .addTo(map.current);
        } else {
            aircraftMarker.current.setLngLat([longitude, latitude]);
            const el = aircraftMarker.current.getElement();
            if (el && heading !== null) {
                el.style.transform = `rotate(${heading}deg)`;
            }
        }
    }, [aircraftPosition]);

    // Update trail
    React.useEffect(() => {
        if (!map.current || positionHistory.length < 2) return;

        const source = map.current.getSource("trail") as mapboxgl.GeoJSONSource;
        if (source) {
            source.setData({
                type: "Feature",
                properties: {},
                geometry: {
                    type: "LineString",
                    coordinates: positionHistory.map((p) => [p.lng, p.lat]),
                },
            });
        }
    }, [positionHistory]);

    return (
        <div className="relative h-full w-full rounded-lg overflow-hidden border">
            <div ref={mapContainer} className="h-full w-full" />

            {/* Legend */}
            <div className="absolute bottom-4 left-4 rounded-lg bg-background/90 backdrop-blur-sm border p-3 text-xs">
                <div className="flex items-center gap-2 mb-1">
                    <div className="size-3 rounded-full bg-blue-500" />
                    <span>Departure</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="size-3 rounded-full bg-green-500" />
                    <span>Arrival</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-yellow-500" />
                    <span>Aircraft</span>
                </div>
            </div>

            {/* Status */}
            {aircraftPosition?.cached && (
                <div className="absolute top-4 left-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 text-xs text-yellow-500">
                    Position data may be delayed
                </div>
            )}
        </div>
    );
}

/**
 * Generate points along a great circle arc
 */
function generateArcPoints(
    start: [number, number],
    end: [number, number],
    numPoints: number
): [number, number][] {
    const points: [number, number][] = [];

    for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const lat = start[1] + (end[1] - start[1]) * t;
        // Add curve effect
        const lng = start[0] + (end[0] - start[0]) * t;

        // Calculate great circle interpolation (simplified)

        const altitude = Math.sin(Math.PI * t) * 0.1; // Slight curve
        const adjustedLat = lat + altitude * (end[1] - start[1]);

        points.push([lng, adjustedLat]);
    }

    return points;
}
