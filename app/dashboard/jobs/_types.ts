export type LngLat = { lng: number; lat: number }

export type JobDTO = {
  id: string
  title: string
  weightKg: number
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
  createdAt: string
  updatedAt: string
}

export type JobUpsertInput = {
  title: string
  weightKg: number
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


