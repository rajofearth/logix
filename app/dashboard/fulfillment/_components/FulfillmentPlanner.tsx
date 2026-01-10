"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { History } from "lucide-react"

import type { JobDTO } from "@/app/dashboard/jobs/_types"
import { planFulfillment, selectFulfillmentOption } from "../_server/planActions"
import { executeNextFulfillmentStep, startFulfillmentExecution, completeFulfillmentSegment } from "../_server/executeActions"
import type { CandidatePlanOption, FulfillmentObjective } from "@/lib/fulfillment/types"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import { PlanOptions } from "./PlanOptions"
import { PlanSummary } from "./PlanSummary"
import { RequestForm } from "./RequestForm"
import { ObjectiveSelect } from "./ObjectiveSelect"
import { ExecutionProgress } from "./ExecutionProgress"
import { SegmentActionDialog } from "./SegmentActionDialog"

type PlanState = {
  planId: string
  selectedPlanKey: string
  options: CandidatePlanOption[]
}

export function FulfillmentPlanner() {
  const router = useRouter()
  const [job, setJob] = React.useState<JobDTO | null>(null)

  const [objective, setObjective] = React.useState<Exclude<FulfillmentObjective, "revenue">>("balanced")
  const [planning, setPlanning] = React.useState(false)
  const [executing, setExecuting] = React.useState(false)
  const [plan, setPlan] = React.useState<PlanState | null>(null)
  const [segmentDialog, setSegmentDialog] = React.useState<{
    open: boolean
    mode: "ground" | "air" | "train"
    segmentId: string
    jobId?: string
    shipmentId?: string
    trainShipmentId?: string
  } | null>(null)

  const handlePlan = React.useCallback(async () => {
    if (!job) return
    setPlanning(true)
    try {
      const res = await planFulfillment(job.id, objective)
      setPlan({
        planId: res.planId,
        selectedPlanKey: res.selectedPlanKey,
        options: res.options,
      })
      toast.success("Plan generated")
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to plan"
      toast.error(msg)
    } finally {
      setPlanning(false)
    }
  }, [job, objective])

  const handleSelectOption = React.useCallback(
    async (key: string) => {
      if (!plan) return
      setPlan((p) => (p ? { ...p, selectedPlanKey: key } : p))
      const res = await selectFulfillmentOption(plan.planId, key)
      if (!res.success) {
        toast.error(res.error)
      }
    },
    [plan]
  )

  const processNextSegment = React.useCallback(async () => {
    if (!plan) return

    const step = await executeNextFulfillmentStep(plan.planId, { interactive: true })
    if (!step.success) {
      toast.error(step.error)
      setExecuting(false)
      return
    }

    if (step.done) {
      toast.success("Plan executed")
      setExecuting(false)
      return
    }

    if (step.needsUserAction && step.segmentId && step.mode) {
      setSegmentDialog({
        open: true,
        mode: step.mode,
        segmentId: step.segmentId,
        jobId: step.jobId,
        shipmentId: step.shipmentId,
        trainShipmentId: step.trainShipmentId,
      })
    } else {
      // No user action needed, continue
      setTimeout(() => processNextSegment(), 400)
    }
  }, [plan])

  const handleExecute = React.useCallback(async () => {
    if (!plan) return
    setExecuting(true)
    try {
      const start = await startFulfillmentExecution(plan.planId)
      if (!start.success) {
        toast.error(start.error)
        setExecuting(false)
        return
      }

      await processNextSegment()
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to execute"
      toast.error(msg)
      setExecuting(false)
    }
  }, [plan, processNextSegment])

  const handleSegmentComplete = React.useCallback(async () => {
    if (!plan || !segmentDialog) return

    const result = await completeFulfillmentSegment(plan.planId, segmentDialog.segmentId)
    if (!result.success) {
      toast.error(result.error)
      return
    }

    setSegmentDialog(null)
    // Continue to next segment
    setTimeout(() => processNextSegment(), 400)
  }, [plan, segmentDialog, processNextSegment])

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-4 flex items-center justify-end">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/fulfillment/history")}
          className="gap-2"
        >
          <History className="h-4 w-4" />
          View History
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Create a fulfillment request</div>
              <div className="text-xs text-muted-foreground">
                Fill details, auto-plan multimodal segments, then execute step-by-step.
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <RequestForm
            onCreated={(created) => {
              setJob(created)
              setPlan(null)
            }}
          />

          <div className="mt-4">
            <ObjectiveSelect value={objective} onChange={setObjective} disabled={planning || executing} />
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={() => void handlePlan()} disabled={!job || planning}>
              {planning ? "Planning..." : "Auto Plan"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => void handleExecute()}
              disabled={!plan || executing}
            >
              {executing ? "Executing..." : "Execute Plan"}
            </Button>
          </div>

          {job && (
            <div className="mt-4">
              <PlanSummary job={job} plan={plan} />
            </div>
          )}

          <div className="mt-4">
            <ExecutionProgress planId={plan?.planId ?? null} />
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm font-semibold">Plan options</div>
          <div className="text-xs text-muted-foreground">
            Review and (optionally) switch the chosen route before executing.
          </div>

          <Separator className="my-4" />

          <PlanOptions
            plan={plan}
            onSelect={handleSelectOption}
          />
        </Card>
      </div>

      {segmentDialog && (
        <SegmentActionDialog
          open={segmentDialog.open}
          onOpenChange={(open) => {
            if (!open) {
              setSegmentDialog(null)
              setExecuting(false)
            }
          }}
          mode={segmentDialog.mode}
          segmentId={segmentDialog.segmentId}
          planId={plan?.planId ?? ""}
          jobId={segmentDialog.jobId}
          shipmentId={segmentDialog.shipmentId}
          trainShipmentId={segmentDialog.trainShipmentId}
          onComplete={handleSegmentComplete}
        />
      )}
    </div>
  )
}

