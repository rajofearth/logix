"use client"

import * as React from "react"
import { JobForm } from "../_components/JobForm"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function NewJobPage() {
  return (
    <DashboardShell title="Logix Dashboard - Create Job">
      <div className="win7-groupbox">
        <legend>New Job Details</legend>
        <div className="win7-p-4">
          <JobForm mode="create" />
        </div>
      </div>
    </DashboardShell>
  )
}
