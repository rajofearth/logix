"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { FulfillmentPlanner } from "./_components/FulfillmentPlanner"

export default function FulfillmentPage() {
  return (
    <DashboardShell title="Fulfillment Planner">
      <FulfillmentPlanner />
    </DashboardShell>
  )
}

