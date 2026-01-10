"use client";

import * as React from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { FlightSegmentMapData } from "./types";

// Airport coordinates (same as AirTrackingMap)
const AIRPORT_COORDS: Record<string, [number, number]> = {
    // North America
    KJFK: [-73.7781, 40.6413],
    KLAX: [-118.4085, 33.9416],
    KMEM: [-89.9767, 35.0424],
    KSDF: [-85.736, 38.1744],
    KORD: [-87.9048, 41.9742],
    KSFO: [-122.375, 37.6213],
    KMIA: [-80.2906, 25.7959],
    KATL: [-84.428, 33.6407],
    KDFW: [-97.038, 32.8968],
    KDEN: [-104.673, 39.8561],
    KSEA: [-122.309, 47.449],
    KBOS: [-71.0052, 42.3656],
    KEWR: [-74.1687, 40.6925],
    KIAD: [-77.4558, 38.9445],
    KCVG: [-84.6678, 39.0488],
    PANC: [-149.9963, 61.1743],
    // Europe
    EGLL: [-0.4543, 51.47],
    EDDF: [8.5622, 50.0379],
    LFPG: [2.5479, 49.0097],
    EHAM: [4.764, 52.3086],
    LEMD: [-3.5673, 40.4719],
    LIRF: [12.2389, 41.8003],
    LSZH: [8.5492, 47.4647],
    EGCC: [-2.2749, 53.3537],
    ELLX: [6.2044, 49.6233],
    // Middle East
    OMDB: [55.3644, 25.2528],
    OTHH: [51.6138, 25.2731],
    OEJN: [39.1564, 21.6796],
    OERK: [46.6988, 24.9576],
    // Asia
    RJTT: [139.7798, 35.5494],
    VHHH: [113.9185, 22.308],
    WSSS: [103.9915, 1.3644],
    ZBAA: [116.5975, 40.0799],
    ZSPD: [121.805, 31.1434],
    RKSI: [126.4505, 37.4691],
    VTBS: [100.7501, 13.6811],
    RPLL: [121.0198, 14.5086],
    VIDP: [77.1025, 28.5562],
    VABB: [72.8679, 19.0887],
    // Oceania
    YSSY: [151.1772, -33.9399],
    YMML: [144.843, -37.6733],
    NZAA: [174.7922, -36.9998],
    // South America
    SBGR: [-46.4731, -23.4356],
    SCEL: [-70.7858, -33.393],
    SAEZ: [-58.5356, -34.8222],
    // Africa
    FAOR: [28.2461, -26.1392],
    HECA: [31.4056, 30.1219],
};

interface ShipmentFormMapProps {
    fromIcao: string | null;
    toIcao: string | null;
}

export function ShipmentFormMap({ fromIcao, toIcao }: ShipmentFormMapProps) {
    const mapContainer = React.useRef<HTMLDivElement>(null);
    const map = React.useRef<mapboxgl.Map | null>(null);
    const markersRef = React.useRef<mapboxgl.Marker[]>([]);
    const [mapReady, setMapReady] = React.useState(false);

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    // Initialize map - ONLY ONCE
    React.useEffect(() => {
        if (!mapContainer.current || map.current) return;

        if (!token) {
            console.error("Missing NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN");
            return;
        }

        mapboxgl.accessToken = token;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/dark-v11",
            center: [0, 20],
            zoom: 2,
            projection: "globe",
        });

        map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

        map.current.on("load", () => {
            if (!map.current) return;

            // Add route source
            map.current.addSource("route", {
                type: "geojson",
                data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } },
            });

            map.current.addLayer({
                id: "route-line",
                type: "line",
                source: "route",
                layout: { "line-join": "round", "line-cap": "round" },
                paint: {
                    "line-color": "#3b82f6",
                    "line-width": 3,
                    "line-dasharray": [2, 2],
                },
            });

            setMapReady(true);
        });

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [token]);

    // Update route and markers when airports change
    React.useEffect(() => {
        if (!map.current || !mapReady) return;

        // Clear existing markers
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        const bounds = new mapboxgl.LngLatBounds();

        if (fromIcao && toIcao) {
            const fromCoords = AIRPORT_COORDS[fromIcao];
            const toCoords = AIRPORT_COORDS[toIcao];

            if (fromCoords && toCoords) {
                // Draw route
                const points = generateArcPoints(fromCoords, toCoords, 50);
                const source = map.current.getSource("route") as mapboxgl.GeoJSONSource;
                if (source) {
                    source.setData({
                        type: "Feature",
                        properties: {},
                        geometry: { type: "LineString", coordinates: points },
                    });
                }

                // Add departure marker
                const fromEl = document.createElement("div");
                fromEl.innerHTML = `
                    <div class="flex items-center justify-center size-8 rounded-full bg-blue-500 border-2 border-white shadow-lg">
                        <span class="text-white text-xs font-bold">D</span>
                    </div>
                `;
                const fromMarker = new mapboxgl.Marker({ element: fromEl })
                    .setLngLat(fromCoords)
                    .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<div class="p-2"><strong>${fromIcao}</strong><div class="text-xs text-gray-600">Departure</div></div>`))
                    .addTo(map.current);
                markersRef.current.push(fromMarker);

                // Add arrival marker
                const toEl = document.createElement("div");
                toEl.innerHTML = `
                    <div class="flex items-center justify-center size-8 rounded-full bg-green-500 border-2 border-white shadow-lg">
                        <span class="text-white text-xs font-bold">A</span>
                    </div>
                `;
                const toMarker = new mapboxgl.Marker({ element: toEl })
                    .setLngLat(toCoords)
                    .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<div class="p-2"><strong>${toIcao}</strong><div class="text-xs text-gray-600">Arrival</div></div>`))
                    .addTo(map.current);
                markersRef.current.push(toMarker);

                bounds.extend(fromCoords);
                bounds.extend(toCoords);
                map.current.fitBounds(bounds, { padding: 80 });
            }
        } else {
            // Clear route if airports not selected
            const source = map.current.getSource("route") as mapboxgl.GeoJSONSource;
            if (source) {
                source.setData({
                    type: "Feature",
                    properties: {},
                    geometry: { type: "LineString", coordinates: [] },
                });
            }
        }
    }, [fromIcao, toIcao, mapReady]);

    if (!token) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-[#ece9d8] text-sm text-gray-600">
                <div className="text-center">
                    <p className="font-semibold">Missing Mapbox Token</p>
                    <p className="text-xs mt-1">Please configure NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full overflow-hidden">
            <div ref={mapContainer} className="h-full w-full" />

            {/* Legend */}
            <div className="absolute bottom-4 left-4 win7-groupbox p-2 text-xs">
                <div className="font-semibold mb-2 text-black">Route Preview</div>
                {!fromIcao || !toIcao ? (
                    <div className="text-gray-600 text-[10px]">
                        Select airports to see route
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="size-3 rounded-full bg-blue-500" />
                            <span className="text-black">Departure ({fromIcao})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="size-3 rounded-full bg-green-500" />
                            <span className="text-black">Arrival ({toIcao})</span>
                        </div>
                    </>
                )}
            </div>
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

    const startLat = (start[1] * Math.PI) / 180;
    const startLng = (start[0] * Math.PI) / 180;
    const endLat = (end[1] * Math.PI) / 180;
    const endLng = (end[0] * Math.PI) / 180;

    // Calculate great circle distance
    const d =
        2 *
        Math.asin(
            Math.sqrt(
                Math.pow(Math.sin((endLat - startLat) / 2), 2) +
                Math.cos(startLat) * Math.cos(endLat) * Math.pow(Math.sin((endLng - startLng) / 2), 2)
            )
        );

    for (let i = 0; i <= numPoints; i++) {
        const f = i / numPoints;

        const A = Math.sin((1 - f) * d) / Math.sin(d);
        const B = Math.sin(f * d) / Math.sin(d);

        const x = A * Math.cos(startLat) * Math.cos(startLng) + B * Math.cos(endLat) * Math.cos(endLng);
        const y = A * Math.cos(startLat) * Math.sin(startLng) + B * Math.cos(endLat) * Math.sin(endLng);
        const z = A * Math.sin(startLat) + B * Math.sin(endLat);

        const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
        const lng = Math.atan2(y, x);

        points.push([(lng * 180) / Math.PI, (lat * 180) / Math.PI]);
    }

    return points;
}
