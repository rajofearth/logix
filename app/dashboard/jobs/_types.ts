export type LngLat = { lng: number; lat: number }

export type JobStatus = "pending" | "in_progress" | "completed" | "cancelled"

export type CargoUnit = "kg" | "ltr" | "pcs" | "box" | "pkg"

export type JobDTO = {
  id: string
  title: string
  weightKg: number
  cargoName: string | null
  cargoQuantity: number | null
  cargoUnit: CargoUnit | null
  pickupAddress: string
  pickupLat: number
  pickupLng: number
  dropAddress: string
  dropLat: number
  dropLng: number
  pickupAt: string
  dropWindowStartAt: string
  dropWindowEndAt: string
  distanceMeters: number
  durationSeconds: number | null
  routeType: RouteType | null
  routeGeometry: GeoJsonFeature<LineStringGeometry> | null
  estimatedFuelCost: number | null
  status: JobStatus
  driverId: string | null
  driverName: string | null
  createdAt: string
  updatedAt: string
}

export type JobUpsertInput = {
  title: string
  weightKg: number
  cargoName?: string | null
  cargoQuantity?: number | null
  cargoUnit?: CargoUnit | null
  pickupAddress: string
  pickupLat: number
  pickupLng: number
  dropAddress: string
  dropLat: number
  dropLng: number
  pickupAt: string
  dropWindowStartAt: string
  dropWindowEndAt: string
  distanceMeters: number
  durationSeconds?: number | null
  routeType?: RouteType | null
  routeGeometry?: GeoJsonFeature<LineStringGeometry> | null
  estimatedFuelCost?: number | null
  driverId?: string | null
}

export type LineStringGeometry = {
  type: "LineString"
  coordinates: Array<[number, number]>
}

export type GeoJsonFeature<G extends { type: string }> = {
  type: "Feature"
  properties: Record<string, never>
  geometry: G
}

export type DirectionsResult = {
  distanceMeters: number
  durationSeconds: number
  routeGeoJson: GeoJsonFeature<LineStringGeometry>
}

export type RouteType = "fastest" | "economy" | "via_gas_station"

export type RouteOption = {
  type: RouteType
  distanceMeters: number
  durationSeconds: number
  routeGeoJson: GeoJsonFeature<LineStringGeometry>
  estimatedFuelCost: number
  viaPoi?: { name: string; lat: number; lng: number }
}

export type MultiRouteResult = {
  routes: RouteOption[]
}


