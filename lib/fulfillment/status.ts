import type { Prisma } from "@prisma/client"

type SegmentStatus = "planned" | "in_progress" | "completed" | "failed" | "cancelled"
type PlanStatus = "draft" | "executing" | "completed" | "failed" | "cancelled"

function hasAny(statuses: SegmentStatus[], target: SegmentStatus): boolean {
  return statuses.some((s) => s === target)
}

function allIn(statuses: SegmentStatus[], allowed: SegmentStatus[]): boolean {
  return statuses.every((s) => allowed.includes(s))
}

export async function recomputePlanStatus(
  tx: Prisma.TransactionClient,
  planId: string
): Promise<PlanStatus> {
  const segs = await tx.fulfillmentSegment.findMany({
    where: { planId },
    select: { status: true },
    orderBy: { sortOrder: "asc" },
  })
  const statuses = segs.map((s) => s.status as SegmentStatus)

  // If nothing exists, keep as draft
  if (statuses.length === 0) return "draft"

  if (hasAny(statuses, "failed")) return "failed"
  if (allIn(statuses, ["cancelled"])) return "cancelled"

  if (allIn(statuses, ["completed", "cancelled"])) return "completed"
  if (hasAny(statuses, "in_progress") || hasAny(statuses, "completed")) return "executing"

  return "draft"
}

export async function updatePlanStatusFromSegments(
  tx: Prisma.TransactionClient,
  planId: string
): Promise<void> {
  const status = await recomputePlanStatus(tx, planId)
  await tx.fulfillmentPlan.update({
    where: { id: planId },
    data: { status },
  })
}



