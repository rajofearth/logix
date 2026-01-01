"use client"

import * as React from "react"
import { IconDotsVertical, IconEdit, IconPlus, IconTrash, IconUser, IconUserPlus } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { JobDTO, JobStatus } from "../_types"
import type { AvailableDriverDTO } from "../_server/driverList"
import { assignDriver } from "../_server/jobActions"
import { listAvailableDrivers } from "../_server/driverList"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"

function formatKm(distanceMeters: number): string {
  return `${(distanceMeters / 1000).toFixed(2)} km`
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString()
}

function getStatusBadge(status: JobStatus) {
  const variants: Record<JobStatus, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    pending: { variant: "secondary", label: "Pending" },
    in_progress: { variant: "default", label: "In Progress" },
    completed: { variant: "outline", label: "Completed" },
    cancelled: { variant: "destructive", label: "Cancelled" },
  }
  const { variant, label } = variants[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function JobsTable({
  jobs,
  onDelete,
  onJobUpdate,
}: {
  jobs: JobDTO[]
  onDelete: (job: JobDTO) => void
  onJobUpdate?: (updatedJob: JobDTO) => void
}) {
  const router = useRouter()
  const [availableDrivers, setAvailableDrivers] = React.useState<AvailableDriverDTO[]>([])
  const [loadingDrivers, setLoadingDrivers] = React.useState(false)

  const fetchAvailableDrivers = React.useCallback(async () => {
    if (availableDrivers.length > 0) return // Already fetched
    setLoadingDrivers(true)
    try {
      const drivers = await listAvailableDrivers()
      setAvailableDrivers(drivers)
    } catch {
      toast.error("Failed to load available drivers")
    } finally {
      setLoadingDrivers(false)
    }
  }, [availableDrivers.length])

  const handleAssignDriver = async (job: JobDTO, driverId: string | null) => {
    try {
      const updatedJob = await assignDriver(job.id, driverId)
      toast.success(driverId ? "Driver assigned" : "Driver unassigned")
      onJobUpdate?.(updatedJob)
      // Refresh available drivers list
      setAvailableDrivers([])
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to assign driver"
      toast.error(msg)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2 px-4 lg:px-6">
        <div className="text-base font-medium">Jobs</div>
        <Button asChild size="sm">
          <Link href="/dashboard/jobs/new">
            <IconPlus className="size-4" />
            Create Job
          </Link>
        </Button>
      </div>

      <div className="px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Pickup at</TableHead>
                <TableHead className="hidden xl:table-cell">Pickup address</TableHead>
                <TableHead className="hidden xl:table-cell">Drop address</TableHead>
                <TableHead className="text-right">Distance</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground py-10 text-center">
                    No jobs yet. Create your first job.
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{getStatusBadge(job.status)}</TableCell>
                    <TableCell>
                      {job.driverName ? (
                        <div className="flex items-center gap-2">
                          <IconUser className="size-4 text-muted-foreground" />
                          <span className="truncate max-w-[150px]">{job.driverName}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDateTime(job.pickupAt)}
                    </TableCell>
                    <TableCell className="hidden max-w-[420px] truncate xl:table-cell">
                      {job.pickupAddress}
                    </TableCell>
                    <TableCell className="hidden max-w-[420px] truncate xl:table-cell">
                      {job.dropAddress}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatKm(job.distanceMeters)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon" className="size-8" />}
                        >
                          <IconDotsVertical className="size-4" />
                          <span className="sr-only">Open menu</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/jobs/${job.id}/edit`)}>
                            <IconEdit className="size-4" />
                            Edit
                          </DropdownMenuItem>

                          {job.status === "pending" && (
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger onPointerEnter={fetchAvailableDrivers}>
                                <IconUserPlus className="size-4" />
                                {job.driverName ? "Reassign Driver" : "Assign Driver"}
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent className="w-48">
                                {loadingDrivers ? (
                                  <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
                                ) : availableDrivers.length === 0 ? (
                                  <DropdownMenuItem disabled>No available drivers</DropdownMenuItem>
                                ) : (
                                  availableDrivers.map((driver) => (
                                    <DropdownMenuItem
                                      key={driver.id}
                                      onClick={() => handleAssignDriver(job, driver.id)}
                                    >
                                      {driver.name}
                                    </DropdownMenuItem>
                                  ))
                                )}
                                {job.driverId && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      variant="destructive"
                                      onClick={() => handleAssignDriver(job, null)}
                                    >
                                      Unassign Driver
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                          )}

                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => onDelete(job)}>
                            <IconTrash className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
