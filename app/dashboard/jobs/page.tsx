"use client"

import * as React from "react"
import { toast } from "sonner"

import type { JobDTO } from "./_types"
import { deleteJob, listJobs } from "./_server/jobActions"
import { JobsTable } from "./_components/JobsTable"

import { DashboardPage } from "@/components/dashboard/crm/DashboardPage"

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
    <DashboardPage title="Jobs" className="p-0">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {isLoading ? (
              <div className="text-muted-foreground px-4 text-sm lg:px-6">
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
        </div>
      </div>
    </DashboardPage>
  )
}


