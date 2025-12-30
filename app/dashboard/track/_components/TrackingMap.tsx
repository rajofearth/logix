"use client"

import * as React from "react"
import type { GeoJsonFeature, LineStringGeometry, LngLat } from "@/app/dashboard/jobs/_types"

export function TrackingMap({
    pickup,
    drop,
    routeGeoJson,
    fuelStations = [],
}: {
    pickup?: LngLat
    drop?: LngLat
    routeGeoJson?: GeoJsonFeature<LineStringGeometry> | null
    fuelStations?: Array<{ name: string; address?: string; distance?: number; coord: LngLat }>
}) {
    const containerRef = React.useRef<HTMLDivElement | null>(null)
    const mapRef = React.useRef<import("mapbox-gl").Map | null>(null)
    const pickupMarkerRef = React.useRef<import("mapbox-gl").Marker | null>(null)
    const dropMarkerRef = React.useRef<import("mapbox-gl").Marker | null>(null)
    const fuelMarkersRef = React.useRef<import("mapbox-gl").Marker[]>([])

    const [isMapLoaded, setIsMapLoaded] = React.useState(false)

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    const routeRef = React.useRef<typeof routeGeoJson>(routeGeoJson)
    routeRef.current = routeGeoJson

    function buildMarkerEl(kind: "pickup" | "drop" | "fuel", station?: { name: string; address?: string; distance?: number }): HTMLDivElement {
        const wrapper = document.createElement("div")
        wrapper.style.display = "flex"
        wrapper.style.flexDirection = "column"
        wrapper.style.alignItems = "center"
        wrapper.style.pointerEvents = "auto"

        if (kind === "fuel" && station) {
            const card = document.createElement("div")
            card.style.background = "white"
            card.style.padding = "2px 6px"
            card.style.borderRadius = "4px"
            card.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)"
            card.style.marginBottom = "6px"
            card.style.fontSize = "9px"
            card.style.fontWeight = "600"
            card.style.whiteSpace = "nowrap"
            card.style.textAlign = "center"
            card.style.color = "#0f172a"
            card.innerHTML = `
                <div>${station.name}</div>
                ${station.distance ? `<div style="color: #64748b; font-size: 8px;">${(station.distance / 1000).toFixed(1)}km</div>` : ''}
            `
            wrapper.appendChild(card)
        }

        const el = document.createElement("div")
        el.style.width = kind === "fuel" ? "32px" : "28px"
        el.style.height = kind === "fuel" ? "32px" : "28px"
        el.style.borderRadius = "999px"
        el.style.display = "flex"
        el.style.alignItems = "center"
        el.style.justifyContent = "center"
        el.style.fontSize = kind === "fuel" ? "10px" : "12px"
        el.style.fontWeight = "700"
        el.style.color = kind === "fuel" ? "black" : "white"
        el.style.border = "2px solid rgba(255,255,255,0.95)"
        el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)"
        el.style.userSelect = "none"

        if (kind === "fuel") {
            el.style.background = "#fbbf24"
            el.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"> <rect x="4" y="4" width="12" height="18" rx="2" fill="#EF4444" /> <rect x="6" y="7" width="8" height="6" rx="1" fill="#1F2937" /> <path d="M17 5a2 2 0 0 1 2 2v2a2 2 0 1 1-4 0V7a2 2 0 0 1 2-2z" fill="#1F2937" /> <path d="M17 11v5" stroke="#1F2937" stroke-width="2" stroke-linecap="round"/> </svg>`
        } else {
            el.textContent = kind === "pickup" ? "P" : "D"
            el.style.background = kind === "pickup" ? "#16a34a" : "#dc2626"
            el.style.transform = "translateY(-2px)"
        }

        wrapper.appendChild(el)
        return wrapper
    }

    React.useEffect(() => {
        if (!containerRef.current) return
        if (!token) return
        if (mapRef.current) return

        let isMounted = true
        void (async () => {
            const mapboxgl = await import("mapbox-gl")
            if (!isMounted) return
            mapboxgl.default.accessToken = token

            const map = new mapboxgl.default.Map({
                container: containerRef.current!,
                style: "mapbox://styles/mapbox/standard",
                config: {
                    basemap: {
                        lightPreset: "dusk",
                        fuelingStationModePointOfInterestLabels: "fuel",
                        show3dFacades: true,
                        showLandmarkIcons: true
                    }
                },
                attributionControl: false,
            } as ConstructorParameters<typeof mapboxgl.default.Map>[0])

            map.addControl(new mapboxgl.default.AttributionControl({ compact: true }), 'bottom-right')
            map.addControl(new mapboxgl.default.NavigationControl(), "top-right")

            const ensureRouteLayers = () => {
                if (!map.isStyleLoaded()) return

                const sourceId = "tracking-route"
                const casingLayerId = "tracking-route-casing"
                const lineLayerId = "tracking-route-line"

                const existingSource = map.getSource(sourceId)
                const currentRoute = routeRef.current

                if (currentRoute) {
                    if (!existingSource) {
                        map.addSource(sourceId, { type: "geojson", data: currentRoute })
                    } else {
                        (existingSource as import("mapbox-gl").GeoJSONSource).setData(currentRoute)
                    }

                    if (!map.getLayer(casingLayerId)) {
                        map.addLayer({
                            id: casingLayerId,
                            type: "line",
                            source: sourceId,
                            layout: { "line-join": "round", "line-cap": "round" },
                            paint: { "line-color": "#0b1220", "line-width": 7, "line-opacity": 0.35 },
                        })
                    }
                    if (!map.getLayer(lineLayerId)) {
                        map.addLayer({
                            id: lineLayerId,
                            type: "line",
                            source: sourceId,
                            layout: { "line-join": "round", "line-cap": "round" },
                            paint: { "line-color": "#2563eb", "line-width": 4 },
                        })
                    }
                } else {
                    if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId)
                    if (map.getLayer(casingLayerId)) map.removeLayer(casingLayerId)
                    if (existingSource) map.removeSource(sourceId)
                }
            }

            map.on("load", () => {
                map.resize()
                ensureRouteLayers()
                setIsMapLoaded(true)
            })
            map.on("style.load", () => {
                ensureRouteLayers()
            })

            mapRef.current = map
        })()

        return () => {
            isMounted = false
            if (mapRef.current) {
                mapRef.current.remove()
                mapRef.current = null
            }
            pickupMarkerRef.current = null
            dropMarkerRef.current = null
        }
    }, [token])

    React.useEffect(() => {
        const map = mapRef.current
        if (!map || !token) return

        void (async () => {
            const mapboxgl = await import("mapbox-gl")

            // Markers
            if (pickup) {
                if (!pickupMarkerRef.current) {
                    pickupMarkerRef.current = new mapboxgl.default.Marker({
                        element: buildMarkerEl("pickup"),
                    })
                        .setLngLat([pickup.lng, pickup.lat])
                        .addTo(map)
                } else {
                    pickupMarkerRef.current.setLngLat([pickup.lng, pickup.lat])
                }
            } else if (pickupMarkerRef.current) {
                pickupMarkerRef.current.remove()
                pickupMarkerRef.current = null
            }

            if (drop) {
                if (!dropMarkerRef.current) {
                    dropMarkerRef.current = new mapboxgl.default.Marker({
                        element: buildMarkerEl("drop"),
                    })
                        .setLngLat([drop.lng, drop.lat])
                        .addTo(map)
                } else {
                    dropMarkerRef.current.setLngLat([drop.lng, drop.lat])
                }
            } else if (dropMarkerRef.current) {
                dropMarkerRef.current.remove()
                dropMarkerRef.current = null
            }

            // Route line updates
            const sourceId = "tracking-route"
            const casingLayerId = "tracking-route-casing"
            const lineLayerId = "tracking-route-line"

            if (!map.isStyleLoaded()) return

            const existingSource = map.getSource(sourceId)
            if (routeGeoJson) {
                if (!existingSource) {
                    map.addSource(sourceId, {
                        type: "geojson",
                        data: routeGeoJson,
                    })
                    if (!map.getLayer(casingLayerId)) {
                        map.addLayer({
                            id: casingLayerId,
                            type: "line",
                            source: sourceId,
                            layout: { "line-join": "round", "line-cap": "round" },
                            paint: {
                                "line-color": "#0b1220",
                                "line-width": 7,
                                "line-opacity": 0.35,
                            },
                        })
                    }
                    if (!map.getLayer(lineLayerId)) {
                        map.addLayer({
                            id: lineLayerId,
                            type: "line",
                            source: sourceId,
                            layout: { "line-join": "round", "line-cap": "round" },
                            paint: { "line-color": "#2563eb", "line-width": 4 },
                        })
                    }
                } else {
                    ; (existingSource as import("mapbox-gl").GeoJSONSource).setData(
                        routeGeoJson
                    )
                }
            } else {
                if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId)
                if (map.getLayer(casingLayerId)) map.removeLayer(casingLayerId)
                if (existingSource) map.removeSource(sourceId)
            }

            // Fit bounds
            if (pickup && drop) {
                const bounds = new mapboxgl.default.LngLatBounds()
                bounds.extend([pickup.lng, pickup.lat])
                bounds.extend([drop.lng, drop.lat])
                map.fitBounds(bounds, { padding: 80, maxZoom: 14, duration: 600 })
            }
        })()
    }, [pickup, drop, routeGeoJson, token])

    React.useEffect(() => {
        const map = mapRef.current
        if (!map || !token || !isMapLoaded) return

        // Clear existing
        fuelMarkersRef.current.forEach(m => m.remove())
        fuelMarkersRef.current = []

        if (!fuelStations?.length) return

        void (async () => {
            const mapboxgl = await import("mapbox-gl")

            fuelStations.forEach(station => {
                const marker = new mapboxgl.default.Marker({
                    element: buildMarkerEl("fuel", station)
                })
                    .setLngLat([station.coord.lng, station.coord.lat])
                    // Removed popup call since it's now part of the marker element
                    .addTo(map)

                fuelMarkersRef.current.push(marker)
            })
        })()

    }, [fuelStations, token, isMapLoaded])

    if (!token) {
        return (
            <div className="text-muted-foreground flex h-full items-center justify-center bg-muted/20 text-sm">
                Missing Mapbox Token
            </div>
        )
    }

    return <div ref={containerRef} className="h-full w-full" />
}
