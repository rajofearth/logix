"use client"

import * as React from "react"
import {
  IconChevronDown,
  IconChevronUp,
  IconSelector,
  IconDotsVertical,
  IconEdit,
  IconMapPin,
  IconPlus,
  IconRoute,
  IconTrash,
  IconTruck,
  IconUser,
  IconUserPlus,
} from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import type { JobDTO, JobStatus } from "../_types"
import type { AvailableDriverDTO } from "../_server/driverList"
import { assignDriver } from "../_server/jobActions"
import { listAvailableDrivers } from "../_server/driverList"
import { planFulfillment } from "@/app/dashboard/fulfillment/_server/planActions"
import { executeFulfillmentPlan } from "@/app/dashboard/fulfillment/_server/executeActions"

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
  return `${(distanceMeters / 1000).toFixed(1)} km`
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  // Compact format: "Jan 3, 2:30 PM"
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  }) + ", " + d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

function getStatusBadge(status: JobStatus) {
  const variants: Record<JobStatus, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    pending: { variant: "secondary", label: "Pending" },
    in_progress: { variant: "default", label: "Active" },
    completed: { variant: "outline", label: "Done" },
    cancelled: { variant: "destructive", label: "Cancelled" },
  }
  const { variant, label } = variants[status]
  return <Badge variant={variant} className="text-xs px-1.5 py-0">{label}</Badge>
}

// Compact sortable header
function SortableHeader({
  column,
  title,
}: {
  column: { getIsSorted: () => false | "asc" | "desc"; toggleSorting: (desc?: boolean) => void }
  title: string
}) {
  const sorted = column.getIsSorted()
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 h-7 px-2 text-xs font-medium hover:bg-muted/60 group"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {title}
      <span className="ml-1 flex flex-col">
        {sorted === "asc" ? (
          <IconChevronUp className="size-3.5 text-orange-500" />
        ) : sorted === "desc" ? (
          <IconChevronDown className="size-3.5 text-orange-500" />
        ) : (
          <IconSelector className="size-3.5 opacity-40 group-hover:opacity-70" />
        )}
      </span>
    </Button>
  )
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
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [availableDrivers, setAvailableDrivers] = React.useState<AvailableDriverDTO[]>([])
  const [loadingDrivers, setLoadingDrivers] = React.useState(false)
  const [autoPlanJobId, setAutoPlanJobId] = React.useState<string | null>(null)

  const fetchAvailableDrivers = React.useCallback(async () => {
    if (availableDrivers.length > 0) return
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

  const handleAssignDriver = React.useCallback(async (job: JobDTO, driverId: string | null) => {
    try {
      const updatedJob = await assignDriver(job.id, driverId)
      toast.success(driverId ? "Driver assigned" : "Driver unassigned")
      onJobUpdate?.(updatedJob)
      setAvailableDrivers([])
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to assign driver"
      toast.error(msg)
    }
  }, [onJobUpdate])

  const handleAutoPlanAndExecute = React.useCallback(async (job: JobDTO) => {
    setAutoPlanJobId(job.id)
    try {
      const planned = await planFulfillment(job.id, "balanced")
      const executed = await executeFulfillmentPlan(planned.planId)
      if (!executed.success) {
        toast.error(executed.error)
        return
      }
      toast.success("Auto plan started")
      router.refresh()
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to auto plan"
      toast.error(msg)
    } finally {
      setAutoPlanJobId(null)
    }
  }, [router])

  const columns: ColumnDef<JobDTO>[] = React.useMemo(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => <SortableHeader column={column} title="Job" />,
        cell: ({ row }) => (
          <div className="max-w-[140px]">
            <span className="font-medium text-sm truncate block" title={row.original.title}>
              {row.original.title}
            </span>
          </div>
        ),
        size: 140,
      },
      {
        accessorKey: "status",
        header: ({ column }) => <SortableHeader column={column} title="Status" />,
        cell: ({ row }) => getStatusBadge(row.original.status),
        sortingFn: (rowA, rowB) => {
          const order: Record<JobStatus, number> = { pending: 0, in_progress: 1, completed: 2, cancelled: 3 }
          return order[rowA.original.status] - order[rowB.original.status]
        },
        size: 80,
      },
      {
        accessorKey: "driverName",
        header: ({ column }) => <SortableHeader column={column} title="Driver" />,
        cell: ({ row }) => {
          const job = row.original
          return job.driverName ? (
            <div className="flex items-center gap-1 max-w-[100px]">
              <IconUser className="size-3 text-muted-foreground shrink-0" />
              <span className="truncate text-sm" title={job.driverName}>
                {job.driverName}
              </span>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="sm" className="h-6 text-xs px-1.5 text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30" />}
                onPointerEnter={fetchAvailableDrivers}
              >
                <IconUserPlus className="size-3 mr-0.5" />
                Assign
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                {loadingDrivers ? (
                  <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
                ) : availableDrivers.length === 0 ? (
                  <DropdownMenuItem disabled>No drivers available</DropdownMenuItem>
                ) : (
                  availableDrivers.map((driver) => (
                    <DropdownMenuItem key={driver.id} onClick={() => handleAssignDriver(job, driver.id)}>
                      <IconUser className="size-3.5" />
                      {driver.name}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        sortingFn: (rowA, rowB) => {
          const a = rowA.original.driverName || ""
          const b = rowB.original.driverName || ""
          return a.localeCompare(b)
        },
        size: 100,
      },
      {
        accessorKey: "pickupAt",
        header: ({ column }) => <SortableHeader column={column} title="Pickup" />,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDateTime(row.original.pickupAt)}
          </span>
        ),
        sortingFn: (rowA, rowB) => {
          return new Date(rowA.original.pickupAt).getTime() - new Date(rowB.original.pickupAt).getTime()
        },
        size: 110,
      },
      {
        id: "route",
        header: () => <span className="text-xs font-medium">Route</span>,
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5 max-w-[180px]">
            <div className="flex items-center gap-1">
              <IconMapPin className="size-3 text-green-500 shrink-0" />
              <span className="text-xs truncate" title={row.original.pickupAddress}>
                {row.original.pickupAddress.split(",")[0]}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <IconRoute className="size-3 text-red-500 shrink-0" />
              <span className="text-xs truncate" title={row.original.dropAddress}>
                {row.original.dropAddress.split(",")[0]}
              </span>
            </div>
          </div>
        ),
        size: 180,
      },
      {
        accessorKey: "distanceMeters",
        header: ({ column }) => (
          <div className="text-right">
            <SortableHeader column={column} title="Dist" />
          </div>
        ),
        cell: ({ row }) => (
          <span className="text-right tabular-nums text-xs text-muted-foreground block">
            {formatKm(row.original.distanceMeters)}
          </span>
        ),
        size: 60,
      },
      {
        id: "actions",
        header: () => null,
        cell: ({ row }) => {
          const job = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-7" />}>
                <IconDotsVertical className="size-3.5" />
                <span className="sr-only">Actions</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => router.push(`/dashboard/jobs/${job.id}/edit`)}>
                  <IconEdit className="size-3.5" />
                  Edit
                </DropdownMenuItem>

                {job.status === "pending" && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger onPointerEnter={fetchAvailableDrivers}>
                      <IconUserPlus className="size-3.5" />
                      {job.driverName ? "Reassign" : "Assign Driver"}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-44">
                      {loadingDrivers ? (
                        <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
                      ) : availableDrivers.length === 0 ? (
                        <DropdownMenuItem disabled>No drivers</DropdownMenuItem>
                      ) : (
                        availableDrivers.map((driver) => (
                          <DropdownMenuItem key={driver.id} onClick={() => handleAssignDriver(job, driver.id)}>
                            {driver.name}
                          </DropdownMenuItem>
                        ))
                      )}
                      {job.driverId && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => handleAssignDriver(job, null)}>
                            Unassign
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )}

                <DropdownMenuSeparator />
                {job.status === "pending" && (
                  <DropdownMenuItem
                    onClick={() => void handleAutoPlanAndExecute(job)}
                    disabled={autoPlanJobId === job.id}
                  >
                    <IconRoute className="size-3.5" />
                    {autoPlanJobId === job.id ? "Planning..." : "Auto Plan & Execute"}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem variant="destructive" onClick={() => onDelete(job)}>
                  <IconTrash className="size-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        enableSorting: false,
        size: 40,
      },
    ],
    [availableDrivers, loadingDrivers, fetchAvailableDrivers, handleAssignDriver, handleAutoPlanAndExecute, autoPlanJobId, router, onDelete]
  )

  const table = useReactTable({
    data: jobs,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-lg bg-orange-500/10 text-orange-500">
            <IconTruck className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Delivery Jobs</h2>
            <p className="text-xs text-muted-foreground">
              Manage pickups, deliveries & driver assignments • <span className="tabular-nums font-medium">{jobs.length}</span> {jobs.length === 1 ? "job" : "jobs"}
            </p>
          </div>
        </div>
        <Button asChild size="sm" className="h-8 shadow-sm">
          <Link href="/dashboard/jobs/new">
            <IconPlus className="size-4" />
            New Job
          </Link>
        </Button>
      </div>

      {/* Table */}
      <div className="px-4 lg:px-6">
        <div className="rounded-lg border bg-card">
          <Table className="w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-b">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-9 px-2 first:pl-3 last:pr-3"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <IconPlus className="size-6 opacity-40" />
                      <span className="text-sm">No jobs yet</span>
                      <Button asChild variant="outline" size="sm" className="mt-1">
                        <Link href="/dashboard/jobs/new">Create your first job</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="group hover:bg-muted/40 transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/jobs/${row.original.id}/edit`)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-2 px-2 first:pl-3 last:pr-3"
                        style={{ width: cell.column.getSize() }}
                        onClick={(e) => {
                          // Prevent row click when clicking on interactive elements
                          if ((e.target as HTMLElement).closest("button, [role='menuitem']")) {
                            e.stopPropagation()
                          }
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
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
