"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import type { JobDTO } from "../../_types"
import { getJob } from "../../_server/jobActions"
import { JobForm } from "../../_components/JobForm"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function EditJobPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id

  const [job, setJob] = React.useState<JobDTO | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    if (!id) return
    setIsLoading(true)
    void (async () => {
      try {
        const j = await getJob(id)
        setJob(j)
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load job"
        toast.error(msg)
        setJob(null)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [id])

  return (
    <DashboardShell title={`Logix Dashboard - Edit Job ${job?.title || ""}`}>
      <div className="win7-groupbox">
        <legend>Edit Job Details</legend>
        <div className="win7-p-4">
          {isLoading ? (
            <div className="text-muted-foreground text-sm">Loading job…</div>
          ) : job ? (
            <JobForm mode="edit" initialJob={job} />
          ) : (
            <div className="text-muted-foreground text-sm">Job not found.</div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}
