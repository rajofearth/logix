"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlanDetailsView } from "../../_components/PlanDetailsView"
import { getFulfillmentPlanDetails } from "../../../_server/historyActions"
import type { FulfillmentPlanDetailsDTO } from "../../../_server/historyActions"

export default function PlanDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const planId = params?.planId as string | undefined

  const [plan, setPlan] = React.useState<FulfillmentPlanDetailsDTO | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!planId) {
      setError("Plan ID is required")
      setIsLoading(false)
      return
    }

    void (async () => {
      try {
        setIsLoading(true)
        setError(null)
        const details = await getFulfillmentPlanDetails(planId)
        setPlan(details)
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load plan details"
        setError(msg)
        console.error("Failed to fetch plan details:", e)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [planId])

  return (
    <DashboardShell title="Fulfillment Plan Details">
      <div className="win7-groupbox win7-mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1>Plan Details</h1>
            <p className="text-sm text-muted-foreground">
              View detailed information about this fulfillment plan
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/fulfillment/history")}
            >
              Back to History
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/fulfillment")}
            >
              Back to Planner
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Loading plan details...
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="text-sm text-destructive">{error}</div>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/dashboard/fulfillment/history")}
            >
              Back to History
            </Button>
          </CardContent>
        </Card>
      ) : plan ? (
        <PlanDetailsView plan={plan} />
      ) : null}
    </DashboardShell>
  )
}
