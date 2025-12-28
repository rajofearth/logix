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
    const markersRef = React.useRef<Map<string, { origin: import("mapbox-gl").Marker; dest: import("mapbox-gl").Marker }>>(new Map());

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

    React.useEffect(() => {
        if (!containerRef.current || !token || mapRef.current) return;

        let isMounted = true;

        void (async () => {
            const mapboxgl = await import("mapbox-gl");
            if (!isMounted) return;

            mapboxgl.default.accessToken = token;

            const map = new mapboxgl.default.Map({
                container: containerRef.current!,
                style: "mapbox://styles/mapbox/light-v11",
                center: defaultCenter,
                zoom: 12,
            });

            map.addControl(new mapboxgl.default.NavigationControl(), "bottom-right");

            map.on("load", () => {
                map.resize();
                mapRef.current = map;

                // Add all delivery routes and markers
                deliveries.forEach((delivery, index) => {
                    const coords = getDeliveryCoords(index);
                    const isActive = delivery.isActive;
                    const routeId = `route-${delivery.id}`;

                    // Add route source
                    map.addSource(routeId, {
                        type: "geojson",
                        data: {
                            type: "Feature",
                            properties: { id: delivery.id },
                            geometry: {
                                type: "LineString",
                                coordinates: [coords.origin, coords.dest],
                            },
                        },
                    });

                    // Add route line
                    map.addLayer({
                        id: `${routeId}-line`,
                        type: "line",
                        source: routeId,
                        layout: {
                            "line-join": "round",
                            "line-cap": "round",
                        },
                        paint: {
                            "line-color": isActive ? "#f97316" : "#cbd5e1",
                            "line-width": isActive ? 4 : 2,
                            "line-opacity": isActive ? 1 : 0.5,
                        },
                    });

                    // Create markers
                    const createMarker = (type: "origin" | "dest", lngLat: [number, number]) => {
                        const el = document.createElement("div");
                        const isOrigin = type === "origin";
                        el.style.cssText = `
              width: ${isActive ? "24px" : "18px"};
              height: ${isActive ? "24px" : "18px"};
              border-radius: 50%;
              background: ${isOrigin ? "#10b981" : "#f97316"};
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
              cursor: pointer;
              transition: all 0.2s ease;
              opacity: ${isActive ? 1 : 0.6};
              display: flex;
              align-items: center;
              justify-content: center;
            `;

                        if (!isOrigin && isActive) {
                            el.innerHTML = `<span style="font-size: 10px;">🚛</span>`;
                        }

                        el.addEventListener("mouseenter", () => {
                            el.style.transform = "scale(1.2)";
                            el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
                        });
                        el.addEventListener("mouseleave", () => {
                            el.style.transform = "scale(1)";
                            el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
                        });

                        const popup = new mapboxgl.default.Popup({
                            offset: 25,
                            closeButton: false,
                        }).setHTML(
                            `<div style="padding: 8px; min-width: 160px;">
                <div style="font-size: 10px; color: #64748b; margin-bottom: 2px;">${isOrigin ? "Origin" : "Destination"}</div>
                <div style="font-weight: 600; font-size: 12px; color: #0f172a;">${isOrigin ? delivery.origin.address : delivery.destination.address}</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${isOrigin ? delivery.origin.detail : delivery.destination.detail}</div>
              </div>`
                        );

                        return new mapboxgl.default.Marker({ element: el })
                            .setLngLat(lngLat)
                            .setPopup(popup)
                            .addTo(map);
                    };

                    const originMarker = createMarker("origin", coords.origin);
                    const destMarker = createMarker("dest", coords.dest);

                    markersRef.current.set(delivery.id, { origin: originMarker, dest: destMarker });
                });
            });
        })();

        return () => {
            isMounted = false;
            markersRef.current.forEach(({ origin, dest }) => {
                origin.remove();
                dest.remove();
            });
            markersRef.current.clear();
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [token, deliveries, getDeliveryCoords]);

    // Highlight selected delivery
    React.useEffect(() => {
        const map = mapRef.current;
        if (!map || !map.isStyleLoaded()) return;

        deliveries.forEach((delivery, index) => {
            const routeLineId = `route-${delivery.id}-line`;
            const isSelected = selectedDeliveryId === delivery.id;
            const isActive = delivery.isActive;

            if (map.getLayer(routeLineId)) {
                map.setPaintProperty(routeLineId, "line-color",
                    isSelected ? "#ea580c" : (isActive ? "#f97316" : "#cbd5e1")
                );
                map.setPaintProperty(routeLineId, "line-width",
                    isSelected ? 5 : (isActive ? 4 : 2)
                );
                map.setPaintProperty(routeLineId, "line-opacity",
                    isSelected ? 1 : (isActive ? 1 : 0.4)
                );
            }

            const markers = markersRef.current.get(delivery.id);
            if (markers) {
                const scale = isSelected ? 1.15 : 1;
                const opacity = isSelected ? 1 : (isActive ? 0.9 : 0.5);

                [markers.origin, markers.dest].forEach(marker => {
                    const el = marker.getElement();
                    el.style.transform = `scale(${scale})`;
                    el.style.opacity = String(opacity);
                });
            }
        });

        // Pan to selected delivery
        if (selectedDeliveryId) {
            const selectedIndex = deliveries.findIndex(d => d.id === selectedDeliveryId);
            if (selectedIndex !== -1) {
                const coords = getDeliveryCoords(selectedIndex);
                const centerLng = (coords.origin[0] + coords.dest[0]) / 2;
                const centerLat = (coords.origin[1] + coords.dest[1]) / 2;
                map.easeTo({
                    center: [centerLng, centerLat],
                    zoom: 13,
                    duration: 400,
                });
            }
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
