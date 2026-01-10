"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
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
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Plan Details" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h1 className="text-lg font-semibold">Fulfillment Plan Details</h1>
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
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
