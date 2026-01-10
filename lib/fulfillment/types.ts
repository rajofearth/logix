export type LngLat = { lng: number; lat: number }

export type FulfillmentObjective = "balanced" | "fastest" | "cheapest" | "revenue"

export type FulfillmentSegmentMode = "ground" | "train" | "air"

export type FulfillmentSegmentStatus =
  | "planned"
  | "in_progress"
  | "completed"
  | "failed"
  | "cancelled"

export type CandidateSegment = {
  mode: FulfillmentSegmentMode
  title: string
  planned: Record<string, unknown>
}

export type ScoreBreakdown = {
  etaMinutes: number
  estimatedCost: number
  reliability: number // 0..1
  penaltyLateMinutes: number
}

export type CandidatePlanOption = {
  key: string
  label: string
  segments: CandidateSegment[]
  score: number
  breakdown: ScoreBreakdown
}



