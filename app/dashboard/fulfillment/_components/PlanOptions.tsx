"use client"

import * as React from "react"

import type { CandidatePlanOption } from "@/lib/fulfillment/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PlanSegments } from "./PlanSegments"

type PlanState = {
  planId: string
  selectedPlanKey: string
  options: CandidatePlanOption[]
}

function formatMoneyRupees(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}`
}

export function PlanOptions({
  plan,
  onSelect,
}: {
  plan: PlanState | null
  onSelect: (key: string) => void | Promise<void>
}) {
  if (!plan) {
    return (
      <div className="text-sm text-muted-foreground">
        Generate a plan to see options.
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {plan.options.map((o) => {
        const isSelected = plan.selectedPlanKey === o.key
        return (
          <Card
            key={o.key}
            className={cn("p-3", isSelected && "ring-1 ring-orange-500")}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">{o.label}</div>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>ETA: {o.breakdown.etaMinutes} min</span>
                  <span>•</span>
                  <span>Cost: {formatMoneyRupees(o.breakdown.estimatedCost)}</span>
                  <span>•</span>
                  <span>Reliability: {Math.round(o.breakdown.reliability * 100)}%</span>
                  {o.breakdown.penaltyLateMinutes > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-destructive">
                        Penalty: +{o.breakdown.penaltyLateMinutes} min
                      </span>
                    </>
                  )}
                </div>
              </div>

              <Button
                size="sm"
                variant={isSelected ? "secondary" : "outline"}
                onClick={() => void onSelect(o.key)}
              >
                {isSelected ? "Selected" : "Select"}
              </Button>
            </div>

            <Separator className="my-3" />
            <PlanSegments segments={o.segments} />
          </Card>
        )
      })}
    </div>
  )
}

