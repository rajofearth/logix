"use client"

import * as React from "react"

import type {
  LngLat,
  RouteOption,
  RouteType,
} from "../_types"
import { RouteOptionsPanel } from "./RouteOptionCard"

type ActivePoint = "auto" | "pickup" | "drop"

const ROUTE_COLORS: Record<RouteType, string> = {
  fastest: "#2563eb",      // Blue
  economy: "#16a34a",      // Green
  via_gas_station: "#ea580c", // Orange
}

export function JobRouteMap({
  pickup,
  drop,
  routes,
  selectedRouteType,
  onSelectRoute,
  activePoint,
  onPick,
  isLoadingRoutes,
}: {
  pickup?: LngLat
  drop?: LngLat
  routes: RouteOption[]
  selectedRouteType: RouteType
  onSelectRoute: (type: RouteType) => void
  activePoint: ActivePoint
  onPick: (kind: "pickup" | "drop", coord: LngLat) => void
  isLoadingRoutes?: boolean
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const mapRef = React.useRef<import("mapbox-gl").Map | null>(null)
  const pickupMarkerRef = React.useRef<import("mapbox-gl").Marker | null>(null)
  const dropMarkerRef = React.useRef<import("mapbox-gl").Marker | null>(null)
  const gasStationMarkerRef = React.useRef<import("mapbox-gl").Marker | null>(null)
  const activePointRef = React.useRef<ActivePoint>(activePoint)
  const pickupRef = React.useRef<LngLat | undefined>(pickup)
  const dropRef = React.useRef<LngLat | undefined>(drop)
  const onPickRef = React.useRef<typeof onPick>(onPick)

  activePointRef.current = activePoint
  pickupRef.current = pickup
  dropRef.current = drop
  onPickRef.current = onPick

  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  const routesRef = React.useRef<RouteOption[]>(routes)
  const selectedRouteTypeRef = React.useRef<RouteType>(selectedRouteType)
  routesRef.current = routes
  selectedRouteTypeRef.current = selectedRouteType

  function buildMarkerEl(kind: "pickup" | "drop" | "gas"): HTMLDivElement {
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

    if (kind === "pickup") {
      el.textContent = "P"
      el.style.background = "#16a34a"
    } else if (kind === "drop") {
      el.textContent = "D"
      el.style.background = "#dc2626"
    } else {
      el.textContent = "⛽"
      el.style.background = "#ea580c"
      el.style.fontSize = "14px"
    }
    return el
  }

  // Map initialization effect
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        pickupRef.current
          ? [pickupRef.current.lng, pickupRef.current.lat]
          : dropRef.current
            ? [dropRef.current.lng, dropRef.current.lat]
            : [77.209, 28.6139] // Delhi default

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

        // auto: first click pickup, second click drop
        if (!currentPickup) {
          pick("pickup", coord)
          return
        }
        pick("drop", coord)
      })

      map.on("load", () => {
        map.resize()
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
      gasStationMarkerRef.current = null
    }
  }, [token])

  // Update markers and routes
  React.useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (!token) return

    void (async () => {
      const mapboxgl = await import("mapbox-gl")

      // Pickup marker
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

      // Drop marker
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

      // Wait for style to load
      if (!map.isStyleLoaded()) return

      // Remove old route layers and sources
      const routeTypes: RouteType[] = ["fastest", "economy", "via_gas_station"]
      for (const type of routeTypes) {
        const lineLayerId = `route-line-${type}`
        const casingLayerId = `route-casing-${type}`
        const sourceId = `route-${type}`

        if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId)
        if (map.getLayer(casingLayerId)) map.removeLayer(casingLayerId)
        if (map.getSource(sourceId)) map.removeSource(sourceId)
      }

      // Add route layers (unselected first, then selected on top)
      const sortedRoutes = [...routes].sort((a, b) => {
        if (a.type === selectedRouteType) return 1
        if (b.type === selectedRouteType) return -1
        return 0
      })

      for (const route of sortedRoutes) {
        const sourceId = `route-${route.type}`
        const casingLayerId = `route-casing-${route.type}`
        const lineLayerId = `route-line-${route.type}`
        const isSelected = route.type === selectedRouteType
        const color = ROUTE_COLORS[route.type]

        map.addSource(sourceId, {
          type: "geojson",
          data: route.routeGeoJson,
        })

        // Casing layer
        map.addLayer({
          id: casingLayerId,
          type: "line",
          source: sourceId,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#0b1220",
            "line-width": isSelected ? 8 : 6,
            "line-opacity": isSelected ? 0.4 : 0.2,
          },
        })

        // Line layer
        map.addLayer({
          id: lineLayerId,
          type: "line",
          source: sourceId,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": color,
            "line-width": isSelected ? 5 : 3,
            "line-opacity": isSelected ? 1 : 0.6,
          },
        })
      }

      // Gas station marker for via_gas_station route
      const gasRoute = routes.find((r) => r.type === "via_gas_station")
      if (gasRoute?.viaPoi && selectedRouteType === "via_gas_station") {
        if (!gasStationMarkerRef.current) {
          gasStationMarkerRef.current = new mapboxgl.default.Marker({
            element: buildMarkerEl("gas"),
          })
            .setLngLat([gasRoute.viaPoi.lng, gasRoute.viaPoi.lat])
            .addTo(map)
        } else {
          gasStationMarkerRef.current.setLngLat([gasRoute.viaPoi.lng, gasRoute.viaPoi.lat])
        }
      } else if (gasStationMarkerRef.current) {
        gasStationMarkerRef.current.remove()
        gasStationMarkerRef.current = null
      }

      // Fit bounds if both points exist
      if (pickup && drop) {
        const bounds = new mapboxgl.default.LngLatBounds()
        bounds.extend([pickup.lng, pickup.lat])
        bounds.extend([drop.lng, drop.lat])
        map.fitBounds(bounds, { padding: { top: 40, bottom: 40, left: 40, right: 250 }, maxZoom: 14, duration: 300 })
      }
    })()
  }, [pickup, drop, routes, selectedRouteType, token])

  if (!token) {
    return (
      <div className="text-muted-foreground flex items-center justify-center rounded-lg border border-dashed p-6 text-sm">
        Missing <code>NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> (map disabled)
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-lg border">
      <div ref={containerRef} className="h-[340px] w-full" />
      <RouteOptionsPanel
        routes={routes}
        selectedType={selectedRouteType}
        onSelect={onSelectRoute}
        isLoading={isLoadingRoutes}
      />
    </div>
  )
}
