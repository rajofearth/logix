"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"

import type { JobDTO } from "../../_types"
import { getJob } from "../../_server/jobActions"
import { JobForm } from "../../_components/JobForm"

import { DashboardPage } from "@/components/dashboard/crm/DashboardPage"

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
    <DashboardPage title="Edit Job" className="p-0">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {isLoading ? (
              <div className="text-muted-foreground px-4 text-sm lg:px-6">
                Loading job…
              </div>
            ) : job ? (
              <JobForm mode="edit" initialJob={job} />
            ) : (
              <div className="text-muted-foreground px-4 text-sm lg:px-6">
                Job not found.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardPage>
  )
}


