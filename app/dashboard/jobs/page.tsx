"use client"

import * as React from "react"
import { toast } from "sonner"

import type { JobDTO } from "./_types"
import { deleteJob, listJobs } from "./_server/jobActions"
import { JobsTable } from "./_components/JobsTable"
import { JobFormDrawer } from "./_components/JobFormDrawer"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function JobsPage() {
  const [jobs, setJobs] = React.useState<JobDTO[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [drawerMode, setDrawerMode] = React.useState<"create" | "edit">("create")
  const [selectedJob, setSelectedJob] = React.useState<JobDTO | undefined>(undefined)

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

  function openCreate() {
    setSelectedJob(undefined)
    setDrawerMode("create")
    setDrawerOpen(true)
  }

  function openEdit(job: JobDTO) {
    setSelectedJob(job)
    setDrawerMode("edit")
    setDrawerOpen(true)
  }

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
        <SiteHeader title="Jobs" />
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
                  onCreate={openCreate}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </div>
        </div>
      </SidebarInset>

      <JobFormDrawer
        open={drawerOpen}
        mode={drawerMode}
        job={selectedJob}
        onOpenChange={setDrawerOpen}
        onSaved={async () => {
          await refresh()
        }}
      />
    </SidebarProvider>
  )
}


