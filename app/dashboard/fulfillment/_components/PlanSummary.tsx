"use client"

import * as React from "react"
import type { JobDTO } from "@/app/dashboard/jobs/_types"
import type { CandidatePlanOption } from "@/lib/fulfillment/types"

function formatMoneyRupees(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}`
}

type PlanState = {
  planId: string
  selectedPlanKey: string
  options: CandidatePlanOption[]
}

export function PlanSummary({
  job,
  plan,
}: {
  job: JobDTO
  plan: PlanState | null
}) {
  if (!plan) {
    return (
      <div className="text-xs text-muted-foreground">
        No plan yet. Click <span className="font-medium">Auto Plan</span>.
      </div>
    )
  }

  const selected = plan.options.find((o) => o.key === plan.selectedPlanKey) ?? plan.options[0]
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">Selected option</div>
      <div className="mt-1 text-sm font-semibold">{selected?.label ?? "—"}</div>
      <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
        <div>
          <span className="font-medium text-foreground">Job</span>: {job.title}
        </div>
        <div>
          <span className="font-medium text-foreground">ETA</span>: {selected.breakdown.etaMinutes} min
        </div>
        <div>
          <span className="font-medium text-foreground">Est. cost</span>: {formatMoneyRupees(selected.breakdown.estimatedCost)}
        </div>
      </div>
    </div>
  )
}

