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

  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

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
        style: "mapbox://styles/mapbox/streets-v12",
        center,
        zoom: 9,
      })

      map.addControl(new mapboxgl.default.NavigationControl(), "top-right")

      map.on("click", (e) => {
        const coord: LngLat = { lng: e.lngLat.lng, lat: e.lngLat.lat }

        if (activePoint === "pickup") {
          onPick("pickup", coord)
          return
        }
        if (activePoint === "drop") {
          onPick("drop", coord)
          return
        }

        // auto: first click pickup, second click drop, then keep updating drop
        if (!pickup) {
          onPick("pickup", coord)
          return
        }
        onPick("drop", coord)
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
  }, [drop, onPick, pickup, token, activePoint])

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
            color: "#22c55e",
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
            color: "#ef4444",
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
      const layerId = "job-route-line"

      const existingSource = map.getSource(sourceId)
      if (routeGeoJson) {
        if (!existingSource) {
          map.addSource(sourceId, {
            type: "geojson",
            data: routeGeoJson,
          })
          map.addLayer({
            id: layerId,
            type: "line",
            source: sourceId,
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#2563eb", "line-width": 4 },
          })
        } else {
          ;(existingSource as import("mapbox-gl").GeoJSONSource).setData(
            routeGeoJson
          )
        }
      } else {
        if (map.getLayer(layerId)) map.removeLayer(layerId)
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


