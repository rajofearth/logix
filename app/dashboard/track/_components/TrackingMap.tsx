"use client";

import * as React from "react";
import { MapPin } from "lucide-react";
import type { Delivery } from "../_data/deliveries";

interface TrackingMapProps {
    deliveries: Delivery[];
    selectedDeliveryId?: string | null;
}

export function TrackingMap({ deliveries, selectedDeliveryId }: TrackingMapProps) {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const mapRef = React.useRef<import("mapbox-gl").Map | null>(null);
    const markersRef = React.useRef<{ origin: import("mapbox-gl").Marker; dest: import("mapbox-gl").Marker } | null>(null);

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    // Chicago coordinates as default center
    const defaultCenter: [number, number] = [-87.6298, 41.8781];

    // Generate consistent coordinates for deliveries
    const getDeliveryCoords = React.useCallback((index: number): { origin: [number, number]; dest: [number, number] } => {
        return {
            origin: [defaultCenter[0] - 0.04 + (index * 0.025), defaultCenter[1] + 0.025],
            dest: [defaultCenter[0] + 0.02 + (index * 0.015), defaultCenter[1] - 0.02],
        };
    }, []);

    // Initialize map
    React.useEffect(() => {
        if (!containerRef.current || !token || mapRef.current) return;

        let isMounted = true;

        void (async () => {
            const mapboxgl = await import("mapbox-gl");
            if (!isMounted) return;

            mapboxgl.default.accessToken = token;

            const map = new mapboxgl.default.Map({
                container: containerRef.current!,
                style: "mapbox://styles/mapbox/outdoors-v12",
                center: defaultCenter,
                zoom: 12,
            });

            map.addControl(new mapboxgl.default.NavigationControl(), "bottom-right");

            map.on("load", () => {
                map.resize();
                mapRef.current = map;
            });
        })();

        return () => {
            isMounted = false;
            if (markersRef.current) {
                markersRef.current.origin.remove();
                markersRef.current.dest.remove();
                markersRef.current = null;
            }
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [token]);

    // Update map when selected delivery changes
    React.useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Wait for map to be ready
        if (!map.isStyleLoaded()) {
            const onLoad = () => updateMapForSelectedDelivery();
            map.once("load", onLoad);
            return;
        }

        updateMapForSelectedDelivery();

        async function updateMapForSelectedDelivery() {
            if (!map) return;
            const mapboxgl = await import("mapbox-gl");

            // Clear previous markers
            if (markersRef.current) {
                markersRef.current.origin.remove();
                markersRef.current.dest.remove();
                markersRef.current = null;
            }

            // Clear previous route
            const routeId = "selected-route";
            if (map.getLayer(`${routeId}-line`)) {
                map.removeLayer(`${routeId}-line`);
            }
            if (map.getSource(routeId)) {
                map.removeSource(routeId);
            }

            // If no delivery selected, reset view
            if (!selectedDeliveryId) {
                map.easeTo({
                    center: defaultCenter,
                    zoom: 12,
                    duration: 400,
                });
                return;
            }

            // Find selected delivery
            const selectedIndex = deliveries.findIndex(d => d.id === selectedDeliveryId);
            if (selectedIndex === -1) return;

            const delivery = deliveries[selectedIndex];
            const coords = getDeliveryCoords(selectedIndex);

            // Add route line
            map.addSource(routeId, {
                type: "geojson",
                data: {
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "LineString",
                        coordinates: [coords.origin, coords.dest],
                    },
                },
            });

            map.addLayer({
                id: `${routeId}-line`,
                type: "line",
                source: routeId,
                layout: {
                    "line-join": "round",
                    "line-cap": "round",
                },
                paint: {
                    "line-color": "#f97316",
                    "line-width": 4,
                },
            });

            // Create origin marker
            const originEl = document.createElement("div");
            originEl.style.cssText = `
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #10b981;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        cursor: pointer;
        transition: all 0.2s ease;
      `;
            originEl.addEventListener("mouseenter", () => {
                originEl.style.transform = "scale(1.2)";
            });
            originEl.addEventListener("mouseleave", () => {
                originEl.style.transform = "scale(1)";
            });

            const originPopup = new mapboxgl.default.Popup({
                offset: 25,
                closeButton: false,
            }).setHTML(
                `<div style="padding: 8px; min-width: 160px;">
          <div style="font-size: 10px; color: #64748b; margin-bottom: 2px;">Origin</div>
          <div style="font-weight: 600; font-size: 12px; color: #0f172a;">${delivery.origin.address}</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${delivery.origin.detail}</div>
        </div>`
            );

            const originMarker = new mapboxgl.default.Marker({ element: originEl })
                .setLngLat(coords.origin)
                .setPopup(originPopup)
                .addTo(map);

            // Create destination marker with truck icon
            const destEl = document.createElement("div");
            destEl.style.cssText = `
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #f97316;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
            destEl.innerHTML = `<span style="font-size: 12px;">🚛</span>`;
            destEl.addEventListener("mouseenter", () => {
                destEl.style.transform = "scale(1.2)";
            });
            destEl.addEventListener("mouseleave", () => {
                destEl.style.transform = "scale(1)";
            });

            const destPopup = new mapboxgl.default.Popup({
                offset: 25,
                closeButton: false,
            }).setHTML(
                `<div style="padding: 8px; min-width: 160px;">
          <div style="font-size: 10px; color: #64748b; margin-bottom: 2px;">Destination</div>
          <div style="font-weight: 600; font-size: 12px; color: #0f172a;">${delivery.destination.address}</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${delivery.destination.detail}</div>
        </div>`
            );

            const destMarker = new mapboxgl.default.Marker({ element: destEl })
                .setLngLat(coords.dest)
                .setPopup(destPopup)
                .addTo(map);

            markersRef.current = { origin: originMarker, dest: destMarker };

            // Fit bounds to show both markers
            const bounds = new mapboxgl.default.LngLatBounds();
            bounds.extend(coords.origin);
            bounds.extend(coords.dest);
            map.fitBounds(bounds, { padding: 80, maxZoom: 14, duration: 500 });
        }
    }, [selectedDeliveryId, deliveries, getDeliveryCoords]);

    if (!token) {
        return (
            <div className="flex items-center justify-center h-full w-full bg-muted/20">
                <div className="text-center text-muted-foreground p-6">
                    <MapPin className="size-12 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">Map disabled</p>
                    <p className="text-xs mt-1">
                        Missing <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code>
                    </p>
                </div>
            </div>
        );
    }

    return <div ref={containerRef} className="h-full w-full" />;
}
