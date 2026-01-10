"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { useFulfillmentPlanStream } from "../_hooks/useFulfillmentPlanStream"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

function statusPillClass(status: string): string {
  switch (status) {
    case "planned":
      return "bg-muted text-muted-foreground"
    case "in_progress":
    case "executing":
      return "bg-orange-500/15 text-orange-700 dark:text-orange-300"
    case "completed":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
    case "failed":
      return "bg-destructive/15 text-destructive"
    case "cancelled":
      return "bg-muted text-muted-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function ExecutionProgress({ planId }: { planId: string | null }) {
  const { plan, isConnected, isLoading, error, terminalStatus } = useFulfillmentPlanStream(planId)

  if (!planId) {
    return (
      <div className="text-xs text-muted-foreground">
        Execute a plan to see live progress.
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold">Execution</div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            {isLoading ? "Connecting..." : isConnected ? "Live" : "Offline"}
          </span>
          {terminalStatus ? (
            <span className={cn("rounded-full px-2 py-0.5 text-[11px]", statusPillClass(terminalStatus))}>
              {terminalStatus}
            </span>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="text-xs text-destructive">{error}</div>
      ) : null}

      {plan ? (
        <>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">Plan status</span>
            <span className={cn("rounded-full px-2 py-0.5 text-[11px]", statusPillClass(plan.status))}>
              {plan.status}
            </span>
          </div>

          <Separator />

          <div className="grid gap-2">
            {plan.segments.map((s) => (
              <div key={s.id} className="rounded-md border bg-muted/10 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-medium">
                      {s.sortOrder + 1}. {s.mode.toUpperCase()}
                    </div>
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px]", statusPillClass(s.status))}>
                      {s.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {s.jobId ? (
                      <Button asChild size="sm" variant="outline">
                        <Link href="/dashboard/jobs">View Job Leg</Link>
                      </Button>
                    ) : null}
                    {s.trainShipmentId ? (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/dashboard/train-shipments/${s.trainShipmentId}`}>
                          View Train
                        </Link>
                      </Button>
                    ) : null}
                    {s.shipmentId ? (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/dashboard/air-shipments/${s.shipmentId}`}>
                          View Air
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-xs text-muted-foreground">
          Waiting for first update...
        </div>
      )}
    </div>
  )
}

