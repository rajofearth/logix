"use client"

import * as React from "react"

import { DashboardPage } from "@/components/dashboard/crm/DashboardPage"
import { JobForm } from "../_components/JobForm"

export default function NewJobPage() {
  return (
    <DashboardPage title="Create Job" className="p-0">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <JobForm mode="create" />
          </div>
        </div>
      </div>
    </DashboardPage>
  )
}


