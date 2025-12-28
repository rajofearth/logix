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
    fuelStations?: Array<{ name: string; coord: LngLat }>
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

    function buildMarkerEl(kind: "pickup" | "drop" | "fuel"): HTMLDivElement {
        const el = document.createElement("div")
        el.style.width = kind === "fuel" ? "24px" : "28px"
        el.style.height = kind === "fuel" ? "24px" : "28px"
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
            el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22v-8a2 2 0 0 1 2-2h2.5"/><path d="M7.5 12h3a2 2 0 0 1 2 2v+8"/><path d="M16 13.5V6a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v6"/><path d="M14 6h.5a2.5 2.5 0 0 1 2.5 2.5v3.5"/></svg>`
        } else {
            el.textContent = kind === "pickup" ? "P" : "D"
            el.style.background = kind === "pickup" ? "#16a34a" : "#dc2626"
            el.style.transform = "translateY(-2px)"
        }
        return el
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
            } as any)

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
                    element: buildMarkerEl("fuel")
                })
                    .setLngLat([station.coord.lng, station.coord.lat])
                    .setPopup(new mapboxgl.default.Popup({ offset: 25, closeButton: false }).setText(station.name))
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
