"use client"

import * as React from "react"
import { toast } from "sonner"

import type { JobDTO } from "./_types"
import { deleteJob, listJobs } from "./_server/jobActions"
import { JobsTable } from "./_components/JobsTable"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function JobsPage() {
  const [jobs, setJobs] = React.useState<JobDTO[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const refresh = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const rows = await listJobs()
      setJobs(rows)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load jobs"
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void refresh()
  }, [refresh])

  async function handleDelete(job: JobDTO) {
    const ok = window.confirm(`Delete "${job.title}"? This cannot be undone.`)
    if (!ok) return
    try {
      await deleteJob(job.id)
      toast.success("Job deleted")
      await refresh()
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to delete job"
      toast.error(msg)
    }
  }

  return (
    <DashboardShell title="Logix Dashboard - Jobs" itemCount={jobs.length}>
      <div className="win7-groupbox">
        <legend>Jobs Management</legend>
        {isLoading ? (
          <div style={{ padding: 16, color: "#666", fontSize: 11 }}>
            Loading jobs…
          </div>
        ) : (
          <JobsTable
            jobs={jobs}
            onDelete={handleDelete}
            onJobUpdate={(updatedJob) => {
              setJobs((prev) =>
                prev.map((j) => (j.id === updatedJob.id ? updatedJob : j))
              )
            }}
          />
        )}
      </div>
    </DashboardShell>
  )
}
