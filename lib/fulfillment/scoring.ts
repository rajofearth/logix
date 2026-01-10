import type { CandidatePlanOption, FulfillmentObjective, ScoreBreakdown } from "./types"

type ScoreWeights = {
  time: number
  cost: number
  unreliability: number
  latePenalty: number
}

function getWeights(objective: FulfillmentObjective): ScoreWeights {
  switch (objective) {
    case "fastest":
      return { time: 0.65, cost: 0.15, unreliability: 0.1, latePenalty: 0.1 }
    case "cheapest":
      return { time: 0.2, cost: 0.6, unreliability: 0.1, latePenalty: 0.1 }
    case "revenue":
      // revenue support is stubbed; treat as cost-sensitive for now
      return { time: 0.25, cost: 0.55, unreliability: 0.1, latePenalty: 0.1 }
    case "balanced":
    default:
      return { time: 0.4, cost: 0.35, unreliability: 0.15, latePenalty: 0.1 }
  }
}

export function computePlanScore(
  breakdown: ScoreBreakdown,
  objective: FulfillmentObjective
): number {
  const w = getWeights(objective)
  const time = Math.max(0, breakdown.etaMinutes)
  const cost = Math.max(0, breakdown.estimatedCost)
  const unreliability = Math.max(0, 1 - clamp01(breakdown.reliability))
  const latePenalty = Math.max(0, breakdown.penaltyLateMinutes)

  // simple weighted sum (lower is better)
  return (
    w.time * time +
    w.cost * cost * 0.01 + // normalize rough ₹ scale
    w.unreliability * unreliability * 100 +
    w.latePenalty * latePenalty * 2
  )
}

export function sortOptionsBestFirst(options: CandidatePlanOption[]): CandidatePlanOption[] {
  return [...options].sort((a, b) => a.score - b.score)
}

function clamp01(v: number): number {
  if (v < 0) return 0
  if (v > 1) return 1
  return v
}



