"use client";

import * as React from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { AirPositionData } from "../_hooks/useShipmentStream";
import type { FlightSegmentMapData } from "./types";

// Airport coordinates (expanded lookup)
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

// Segment route colors
const SEGMENT_COLORS = [
    "#3b82f6", // blue
    "#8b5cf6", // purple
    "#22c55e", // green
    "#f59e0b", // amber
    "#ec4899", // pink
];

interface AirTrackingMapProps {
    segments: FlightSegmentMapData[];
    aircraftPosition: AirPositionData | null;
    positionHistory?: Array<{ lat: number; lng: number }>;
}

export function AirTrackingMap({
    segments,
    aircraftPosition,
    positionHistory = [],
}: AirTrackingMapProps) {
    const mapContainer = React.useRef<HTMLDivElement>(null);
    const map = React.useRef<mapboxgl.Map | null>(null);
    const aircraftMarker = React.useRef<mapboxgl.Marker | null>(null);
    const markersRef = React.useRef<mapboxgl.Marker[]>([]);
    const hasFitBounds = React.useRef(false);
    const [mapReady, setMapReady] = React.useState(false);

    // Filter air segments only - memoize to prevent recalculation
    const airSegments = React.useMemo(
        () => segments.filter((s) => s.type === "air" && s.fromIcao && s.toIcao),
        [segments]
    );

    // Internal time state for simulated position - updates every 1 second for smooth animation
    const [internalTime, setInternalTime] = React.useState(() => Date.now());

    // DEMO: Simulated booking/departure time (persisted in localStorage)
    const [demoDepartureTime, setDemoDepartureTime] = React.useState<number>(() => Date.now());

    // Initialize persisted start time regarding the active flight
    React.useEffect(() => {
        const activeSegment = airSegments.find(s => s.isActive) || airSegments[0];
        if (!activeSegment?.flightNumber) return;

        const storageKey = `logix_demo_start_${activeSegment.carrier}_${activeSegment.flightNumber}`;
        const stored = localStorage.getItem(storageKey);

        if (stored) {
            setDemoDepartureTime(parseInt(stored));
        } else {
            // First time this flight is viewed/booked
            const now = Date.now();
            localStorage.setItem(storageKey, now.toString());
            setDemoDepartureTime(now);
        }
    }, [airSegments]);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setInternalTime(Date.now());
        }, 1000); // Update every 1 second for smooth real-time animation
        return () => clearInterval(interval);
    }, []);

    // Calculate simulated position with flight info
    const simulatedPosition = React.useMemo(() => {
        // Find active segment or use first segment
        const activeSegment = airSegments.find(s => s.isActive) || airSegments[0];
        if (!activeSegment || !activeSegment.fromIcao || !activeSegment.toIcao) return null;

        const fromCoords = AIRPORT_COORDS[activeSegment.fromIcao];
        const toCoords = AIRPORT_COORDS[activeSegment.toIcao];
        if (!fromCoords || !toCoords) return null;

        // Calculate progress based on actual departure and arrival times
        const now = internalTime;

        // FORCE DEMO MODE: Real-time 'Depart Now' simulation
        // Overrides scheduled times to ensure immediate animation on page load/booking
        const demoDuration = 50 * 60 * 1000; // 50 mins

        let departure = demoDepartureTime;
        let arrival = demoDepartureTime + demoDuration;
        let status: 'scheduled' | 'in_flight' | 'landed' = 'in_flight';
        let progress = 0;

        const elapsed = now - departure;

        if (now < departure) {
            status = 'scheduled';
            progress = 0;
        } else if (now >= arrival) {
            status = 'landed';
            progress = 1;
        } else {
            status = 'in_flight';
            progress = Math.max(0, Math.min(1, elapsed / demoDuration));
        }

        const remaining = Math.max(0, arrival - now);
        const timeUntilDeparture = Math.max(0, departure - now);

        // Interpolate position along great circle
        const point = interpolateGreatCircle(fromCoords, toCoords, progress);

        // Calculate heading (bearing from current to destination)
        const heading = calculateBearing(point, toCoords);

        // Format remaining time with hours, minutes, and seconds for real-time feel
        const remainingHours = Math.floor(remaining / (60 * 60 * 1000));
        const remainingMinutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
        const remainingSeconds = Math.floor((remaining % (60 * 1000)) / 1000);

        // Format time until departure (for scheduled status)
        const deptHours = Math.floor(timeUntilDeparture / (60 * 60 * 1000));
        const deptMinutes = Math.floor((timeUntilDeparture % (60 * 60 * 1000)) / (60 * 1000));

        // Create formatted strings
        let remainingFormatted = '';
        if (status === 'scheduled') {
            remainingFormatted = deptHours > 0 ? `${deptHours}h ${deptMinutes}m` : `${deptMinutes}m`;
        } else if (status === 'landed') {
            remainingFormatted = 'Arrived';
        } else {
            // Show seconds for more real-time effect
            if (remainingHours > 0) {
                remainingFormatted = `${remainingHours}h ${remainingMinutes}m ${remainingSeconds}s`;
            } else if (remainingMinutes > 0) {
                remainingFormatted = `${remainingMinutes}m ${remainingSeconds}s`;
            } else {
                remainingFormatted = `${remainingSeconds}s`;
            }
        }

        // Format ETA time
        const etaFormatted = new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        }).format(new Date(arrival));

        // Format departure time
        const departureFormatted = new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        }).format(new Date(departure));

        return {
            latitude: point[1],
            longitude: point[0],
            heading,
            altitude: status === 'in_flight'
                ? 35000 * (1 - Math.abs(progress - 0.5) * 0.4) // Peak at middle
                : 0, // On ground
            velocity: status === 'in_flight' ? 250 : 0, // ~250 m/s = ~485 kts when flying
            isSimulated: true,
            // Flight info
            status,
            progress: Math.round(progress * 100),
            remainingMs: remaining,
            remainingFormatted,
            eta: new Date(arrival),
            etaFormatted,
            departureFormatted,
            fromIcao: activeSegment.fromIcao,
            toIcao: activeSegment.toIcao,
            flightNumber: activeSegment.flightNumber,
            carrier: activeSegment.carrier,
        };
    }, [airSegments, internalTime]);

    // Build list of unique airports in order
    const airportOrder = React.useMemo(() => {
        const airports: Array<{
            icao: string;
            type: "departure" | "connection" | "arrival";
            segmentIndex: number;
        }> = [];

        airSegments.forEach((seg, index) => {
            if (seg.fromIcao && index === 0) {
                airports.push({ icao: seg.fromIcao, type: "departure", segmentIndex: index });
            } else if (seg.fromIcao && !airports.some((a) => a.icao === seg.fromIcao)) {
                airports.push({ icao: seg.fromIcao, type: "connection", segmentIndex: index });
            }
            if (seg.toIcao) {
                const isLast = index === airSegments.length - 1;
                if (!airports.some((a) => a.icao === seg.toIcao)) {
                    airports.push({
                        icao: seg.toIcao,
                        type: isLast ? "arrival" : "connection",
                        segmentIndex: index,
                    });
                }
            }
        });

        return airports;
    }, [airSegments]);

    // Initialize map - ONLY ONCE
    React.useEffect(() => {
        if (!mapContainer.current || map.current) return;

        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

        // Use a default world center - fitBounds will adjust later
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

            // Add sources and layers for each potential segment
            for (let i = 0; i < 5; i++) {
                map.current.addSource(`route-${i}`, {
                    type: "geojson",
                    data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } },
                });

                map.current.addLayer({
                    id: `route-line-${i}`,
                    type: "line",
                    source: `route-${i}`,
                    layout: { "line-join": "round", "line-cap": "round" },
                    paint: {
                        "line-color": SEGMENT_COLORS[i],
                        "line-width": 3,
                        "line-dasharray": [2, 2],
                    },
                });
            }

            // Add trail source for aircraft path
            map.current.addSource("trail", {
                type: "geojson",
                data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } },
            });

            map.current.addLayer({
                id: "trail-line",
                type: "line",
                source: "trail",
                layout: { "line-join": "round", "line-cap": "round" },
                paint: { "line-color": "#fbbf24", "line-width": 2, "line-opacity": 0.8 },
            });

            // Mark map as ready for routes and markers
            setMapReady(true);
        });

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []); // Empty dependency - initialize only once

    // Draw route lines and airport markers
    React.useEffect(() => {
        if (!map.current || !mapReady) return;

        // Clear existing markers
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        const bounds = new mapboxgl.LngLatBounds();

        // Draw each segment route
        airSegments.forEach((seg, index) => {
            const fromCoords = seg.fromIcao ? AIRPORT_COORDS[seg.fromIcao] : null;
            const toCoords = seg.toIcao ? AIRPORT_COORDS[seg.toIcao] : null;

            if (fromCoords && toCoords) {
                const source = map.current?.getSource(`route-${index}`) as mapboxgl.GeoJSONSource;
                if (source) {
                    const points = generateArcPoints(fromCoords, toCoords, 50);
                    source.setData({
                        type: "Feature",
                        properties: {},
                        geometry: { type: "LineString", coordinates: points },
                    });
                }
                bounds.extend(fromCoords);
                bounds.extend(toCoords);
            }
        });

        // Add airport markers
        airportOrder.forEach((airport, idx) => {
            const coords = AIRPORT_COORDS[airport.icao];
            if (!coords || !map.current) return;

            const el = document.createElement("div");
            const bgColor =
                airport.type === "departure"
                    ? "bg-blue-500"
                    : airport.type === "arrival"
                        ? "bg-green-500"
                        : "bg-orange-500";
            const label =
                airport.type === "departure" ? "D" : airport.type === "arrival" ? "A" : `C${idx}`;

            el.innerHTML = `
                <div class="flex items-center justify-center size-8 rounded-full ${bgColor} border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform">
                    <span class="text-white text-xs font-bold">${label}</span>
                </div>
            `;

            // Find segment info for popup
            const seg = airSegments[airport.segmentIndex];
            const popupContent = `
                <div class="p-2 min-w-[160px]">
                    <strong class="block mb-1">${airport.icao}</strong>
                    <div class="text-xs text-gray-600">
                        ${airport.type === "departure" ? "Departure" : airport.type === "arrival" ? "Final Destination" : "Connection"}
                    </div>
                    ${seg?.flightNumber ? `<div class="mt-2 text-xs"><strong>Flight:</strong> ${seg.carrier || ""} ${seg.flightNumber}</div>` : ""}
                    ${seg?.plannedDepartureAt ? `<div class="text-xs"><strong>Depart:</strong> ${formatDateTime(seg.plannedDepartureAt)}</div>` : ""}
                    ${seg?.plannedArrivalAt ? `<div class="text-xs"><strong>Arrive:</strong> ${formatDateTime(seg.plannedArrivalAt)}</div>` : ""}
                </div>
            `;

            const marker = new mapboxgl.Marker({ element: el })
                .setLngLat(coords)
                .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent))
                .addTo(map.current);

            markersRef.current.push(marker);
        });

        // Fit bounds only once on initial load
        if (!bounds.isEmpty() && map.current && !hasFitBounds.current) {
            map.current.fitBounds(bounds, { padding: 80 });
            hasFitBounds.current = true;
        }
    }, [airSegments, airportOrder, mapReady]);

    // Use simulated position for route-based tracking
    // Note: aircraftPosition from OpenSky API tracks a real aircraft that may not be on our route
    // For accurate logistics tracking, we use the simulated position along the planned route
    const effectivePosition = simulatedPosition;
    const isLiveTracking = false; // Would be true if we had actual cargo GPS data

    React.useEffect(() => {
        if (!map.current || !mapReady || !effectivePosition) return;

        const { latitude, longitude, heading } = effectivePosition;
        const flightInfo = effectivePosition as typeof effectivePosition & {
            status?: 'scheduled' | 'in_flight' | 'landed';
            progress?: number;
            remainingFormatted?: string;
            etaFormatted?: string;
            fromIcao?: string;
            toIcao?: string;
            flightNumber?: string;
            carrier?: string;
        };

        // Determine status color
        const statusColor = flightInfo.status === 'landed' ? '#22c55e' :
            flightInfo.status === 'scheduled' ? '#3b82f6' : '#f59e0b';
        const statusText = flightInfo.status === 'landed' ? 'ARRIVED' :
            flightInfo.status === 'scheduled' ? 'SCHEDULED' : 'IN FLIGHT';
        const timeLabel = flightInfo.status === 'scheduled' ? 'Departs in:' :
            flightInfo.status === 'landed' ? 'Status:' : 'Arrives in:';

        // Create or update marker
        if (!aircraftMarker.current) {
            const el = document.createElement("div");
            el.className = "aircraft-marker-container";
            // Info box stays fixed, only plane icon rotates based on heading
            const planeRotation = (heading || 0) - 90; // Adjust for SVG default orientation
            el.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                    <!-- Flight Info Box - always horizontal -->
                    <div style="background: rgba(17,24,39,0.97); backdrop-filter: blur(12px); border-radius: 10px; padding: 10px 14px; box-shadow: 0 8px 32px rgba(0,0,0,0.4); border: 1px solid rgba(75,85,99,0.4); min-width: 170px;">
                        <!-- Status Badge -->
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <div class="status-dot" style="width: 8px; height: 8px; border-radius: 50%; background: ${statusColor}; box-shadow: 0 0 8px ${statusColor};"></div>
                                <span class="status-text" style="font-size: 9px; color: ${statusColor}; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">${statusText}</span>
                            </div>
                            <span style="font-size: 9px; color: #6b7280;">${flightInfo.carrier || ''}</span>
                        </div>
                        <!-- Flight Number -->
                        <div class="flight-number" style="font-family: 'SF Mono', Monaco, monospace; font-weight: bold; font-size: 16px; color: white; margin-bottom: 6px;">${flightInfo.flightNumber || 'N/A'}</div>
                        <!-- Route -->
                        <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #e5e7eb; margin-bottom: 8px;">
                            <span style="font-weight: 600;">${flightInfo.fromIcao || '???'}</span>
                            <div style="flex: 1; height: 2px; background: linear-gradient(90deg, ${statusColor}, transparent, ${statusColor}); border-radius: 1px;"></div>
                            <span style="font-weight: 600;">${flightInfo.toIcao || '???'}</span>
                        </div>
                        <!-- Progress Bar -->
                        <div style="height: 6px; background: #1f2937; border-radius: 3px; overflow: hidden; margin-bottom: 8px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);">
                            <div class="progress-bar" style="height: 100%; background: linear-gradient(90deg, #f59e0b, #22c55e); border-radius: 3px; width: ${flightInfo.progress || 0}%; transition: width 0.5s ease-out; box-shadow: 0 0 8px rgba(245,158,11,0.5);"></div>
                        </div>
                        <!-- Time Info -->
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-size: 9px; color: #6b7280; margin-bottom: 2px;">${timeLabel}</div>
                                <div class="countdown-text" style="font-size: 14px; font-weight: 600; color: ${statusColor}; font-family: 'SF Mono', Monaco, monospace;">${flightInfo.remainingFormatted || 'N/A'}</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 9px; color: #6b7280; margin-bottom: 2px;">ETA</div>
                                <div class="eta-time" style="font-size: 12px; font-weight: 500; color: #e5e7eb;">${flightInfo.etaFormatted || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                    <!-- Plane Icon - rotates based on heading -->
                    <div class="plane-icon" style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: ${statusColor}; border: 3px solid white; box-shadow: 0 4px 15px rgba(0,0,0,0.3), 0 0 20px ${statusColor}40; transform: rotate(${planeRotation}deg); transition: transform 1s ease-out, background 0.5s ease;">
                        <svg style="width: 22px; height: 22px; color: white;" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                        </svg>
                    </div>
                </div>
            `;

            aircraftMarker.current = new mapboxgl.Marker({
                element: el,
                anchor: 'bottom',
            })
                .setLngLat([longitude, latitude])
                .addTo(map.current);
        } else {
            // Update position smoothly
            aircraftMarker.current.setLngLat([longitude, latitude]);
            const el = aircraftMarker.current.getElement();
            if (el) {
                // Update the plane icon rotation and color
                const planeIcon = el.querySelector('.plane-icon') as HTMLElement;
                if (planeIcon) {
                    const planeRotation = (heading || 0) - 90;
                    planeIcon.style.transform = `rotate(${planeRotation}deg)`;
                    planeIcon.style.background = statusColor;
                    planeIcon.style.boxShadow = `0 4px 15px rgba(0,0,0,0.3), 0 0 20px ${statusColor}40`;
                }

                // Update status indicator
                const statusDot = el.querySelector('.status-dot') as HTMLElement;
                if (statusDot) {
                    statusDot.style.background = statusColor;
                    statusDot.style.boxShadow = `0 0 8px ${statusColor}`;
                }

                const statusTextEl = el.querySelector('.status-text') as HTMLElement;
                if (statusTextEl) {
                    statusTextEl.textContent = statusText;
                    statusTextEl.style.color = statusColor;
                }

                // Update progress bar
                const progressBar = el.querySelector('.progress-bar') as HTMLElement;
                if (progressBar) {
                    progressBar.style.width = `${flightInfo.progress || 0}%`;
                }

                // Update countdown text (the main timer)
                const countdownText = el.querySelector('.countdown-text') as HTMLElement;
                if (countdownText) {
                    countdownText.textContent = flightInfo.remainingFormatted || 'N/A';
                    countdownText.style.color = statusColor;
                }

                // Update ETA time
                const etaTime = el.querySelector('.eta-time');
                if (etaTime) {
                    etaTime.textContent = flightInfo.etaFormatted || 'N/A';
                }
            }
        }
    }, [effectivePosition, mapReady, isLiveTracking]);

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

    // Find current segment
    const currentSegment = airSegments.find((s) => s.isActive) || airSegments[0];

    return (
        <div className="relative h-full w-full rounded-lg overflow-hidden border">
            <div ref={mapContainer} className="h-full w-full" />

            {/* Real-time Info Panel */}
            {effectivePosition && (
                <div className="absolute top-4 right-16 rounded-lg bg-background/95 backdrop-blur-sm border p-3 text-xs shadow-lg max-w-[200px]">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                        <div className={`size-2 rounded-full ${isLiveTracking ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                        <span className="font-semibold">{isLiveTracking ? 'Live Tracking' : 'Estimated Position'}</span>
                    </div>
                    <div className="mb-2 text-muted-foreground">
                        {formatDateTime(new Date(internalTime))}
                    </div>
                    {currentSegment?.flightNumber && (
                        <div className="flex justify-between mb-1">
                            <span className="text-muted-foreground">Flight</span>
                            <span className="font-mono font-medium">
                                {currentSegment.carrier} {currentSegment.flightNumber}
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">Altitude</span>
                        <span className="font-medium">
                            {effectivePosition.altitude
                                ? `${Math.round(effectivePosition.altitude * 3.281)} ft`
                                : "N/A"}
                        </span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">Speed</span>
                        <span className="font-medium">
                            {effectivePosition.velocity
                                ? `${Math.round(effectivePosition.velocity * 1.944)} kts`
                                : "N/A"}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Heading</span>
                        <span className="font-medium">
                            {effectivePosition.heading !== null && effectivePosition.heading !== undefined
                                ? `${Math.round(effectivePosition.heading)}°`
                                : "N/A"}
                        </span>
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 rounded-lg bg-background/90 backdrop-blur-sm border p-3 text-xs">
                <div className="font-semibold mb-2">Flight Path</div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="size-3 rounded-full bg-blue-500" />
                    <span>Departure</span>
                </div>
                {airSegments.length > 1 && (
                    <div className="flex items-center gap-2 mb-1">
                        <div className="size-3 rounded-full bg-orange-500" />
                        <span>Connection</span>
                    </div>
                )}
                <div className="flex items-center gap-2 mb-1">
                    <div className="size-3 rounded-full bg-green-500" />
                    <span>Arrival</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-yellow-500" />
                    <span>Aircraft</span>
                </div>
                {airSegments.length > 1 && (
                    <div className="mt-2 pt-2 border-t text-muted-foreground">
                        {airSegments.length} flight segment{airSegments.length > 1 ? "s" : ""}
                    </div>
                )}
            </div>

            {/* Cached warning */}
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

/**
 * Format date/time for display
 */
function formatDateTime(date: Date | string | null): string {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date));
}

/**
 * Interpolate a point along a great circle arc
 */
function interpolateGreatCircle(
    start: [number, number],
    end: [number, number],
    fraction: number
): [number, number] {
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

    if (d === 0) return start;

    const A = Math.sin((1 - fraction) * d) / Math.sin(d);
    const B = Math.sin(fraction * d) / Math.sin(d);

    const x = A * Math.cos(startLat) * Math.cos(startLng) + B * Math.cos(endLat) * Math.cos(endLng);
    const y = A * Math.cos(startLat) * Math.sin(startLng) + B * Math.cos(endLat) * Math.sin(endLng);
    const z = A * Math.sin(startLat) + B * Math.sin(endLat);

    const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
    const lng = Math.atan2(y, x);

    return [(lng * 180) / Math.PI, (lat * 180) / Math.PI];
}

/**
 * Calculate bearing from one point to another
 */
function calculateBearing(from: [number, number], to: [number, number]): number {
    const lat1 = (from[1] * Math.PI) / 180;
    const lat2 = (to[1] * Math.PI) / 180;
    const dLng = ((to[0] - from[0]) * Math.PI) / 180;

    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

    const bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360;
}
