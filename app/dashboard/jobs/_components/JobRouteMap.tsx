"use client"

import * as React from "react"

import type {
  GeoJsonFeature,
  LineStringGeometry,
  LngLat,
} from "../_types"

type ActivePoint = "auto" | "pickup" | "drop"

export function JobRouteMap({
  pickup,
  drop,
  routeGeoJson,
  activePoint,
  onPick,
}: {
  pickup?: LngLat
  drop?: LngLat
  routeGeoJson?: GeoJsonFeature<LineStringGeometry>
  activePoint: ActivePoint
  onPick: (kind: "pickup" | "drop", coord: LngLat) => void
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const mapRef = React.useRef<import("mapbox-gl").Map | null>(null)
  const pickupMarkerRef = React.useRef<import("mapbox-gl").Marker | null>(null)
  const dropMarkerRef = React.useRef<import("mapbox-gl").Marker | null>(null)
  const activePointRef = React.useRef<ActivePoint>(activePoint)
  const pickupRef = React.useRef<LngLat | undefined>(pickup)
  const onPickRef = React.useRef<typeof onPick>(onPick)

  activePointRef.current = activePoint
  pickupRef.current = pickup
  onPickRef.current = onPick

  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  const routeRef = React.useRef<typeof routeGeoJson>(routeGeoJson)
  routeRef.current = routeGeoJson

  function buildMarkerEl(kind: "pickup" | "drop"): HTMLDivElement {
    const el = document.createElement("div")
    el.style.width = "28px"
    el.style.height = "28px"
    el.style.borderRadius = "999px"
    el.style.display = "flex"
    el.style.alignItems = "center"
    el.style.justifyContent = "center"
    el.style.fontSize = "12px"
    el.style.fontWeight = "700"
    el.style.color = "white"
    el.style.border = "2px solid rgba(255,255,255,0.95)"
    el.style.boxShadow = "0 6px 16px rgba(0,0,0,0.25)"
    el.style.userSelect = "none"
    el.style.transform = "translateY(-2px)"
    el.textContent = kind === "pickup" ? "P" : "D"
    el.style.background = kind === "pickup" ? "#16a34a" : "#dc2626"
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

      const center: [number, number] =
        pickup
          ? [pickup.lng, pickup.lat]
          : drop
            ? [drop.lng, drop.lat]
            : [77.209, 28.6139] // Delhi (sane default)

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
        center,
        zoom: 9,
      } as ConstructorParameters<typeof mapboxgl.default.Map>[0])

      map.addControl(new mapboxgl.default.NavigationControl(), "top-right")

      const ensureRouteLayers = () => {
        // addSource/addLayer only after style is loaded (Mapbox GL JS docs)
        if (!map.isStyleLoaded()) return

        const sourceId = "job-route"
        const casingLayerId = "job-route-casing"
        const lineLayerId = "job-route-line"

        const existingSource = map.getSource(sourceId)
        const currentRoute = routeRef.current

        if (currentRoute) {
          if (!existingSource) {
            map.addSource(sourceId, {
              type: "geojson",
              data: currentRoute,
            })
          } else {
            ; (existingSource as import("mapbox-gl").GeoJSONSource).setData(
              currentRoute
            )
          }

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
          if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId)
          if (map.getLayer(casingLayerId)) map.removeLayer(casingLayerId)
          if (existingSource) map.removeSource(sourceId)
        }
      }

      map.on("click", (e) => {
        const coord: LngLat = { lng: e.lngLat.lng, lat: e.lngLat.lat }
        const currentMode = activePointRef.current
        const currentPickup = pickupRef.current
        const pick = onPickRef.current

        if (currentMode === "pickup") {
          pick("pickup", coord)
          return
        }
        if (currentMode === "drop") {
          pick("drop", coord)
          return
        }

        // auto: first click pickup, second click drop, then keep updating drop
        if (!currentPickup) {
          pick("pickup", coord)
          return
        }
        pick("drop", coord)
      })

      map.on("load", () => {
        // Ensure canvas is properly sized (common in flex layouts)
        map.resize()
        ensureRouteLayers()
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
    if (!map) return
    if (!token) return

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

      // Route line
      const sourceId = "job-route"
      const casingLayerId = "job-route-casing"
      const lineLayerId = "job-route-line"

      // addSource/addLayer only after style is loaded (Mapbox GL JS docs)
      if (!map.isStyleLoaded()) return

      const existingSource = map.getSource(sourceId)
      if (routeGeoJson) {
        if (!existingSource) {
          map.addSource(sourceId, {
            type: "geojson",
            data: routeGeoJson,
          })
          // casing first (outline)
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

      // Fit bounds if both points exist
      if (pickup && drop) {
        const bounds = new mapboxgl.default.LngLatBounds()
        bounds.extend([pickup.lng, pickup.lat])
        bounds.extend([drop.lng, drop.lat])
        map.fitBounds(bounds, { padding: 40, maxZoom: 14, duration: 300 })
      }
    })()
  }, [pickup, drop, routeGeoJson, token])

  if (!token) {
    return (
      <div className="text-muted-foreground flex items-center justify-center rounded-lg border border-dashed p-6 text-sm">
        Missing <code>NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> (map disabled)
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div ref={containerRef} className="h-[340px] w-full" />
    </div>
  )
}


