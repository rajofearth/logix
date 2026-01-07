"use client"

import * as React from "react"
import {
  IconChevronDown,
  IconChevronUp,
  IconDotsVertical,
  IconEdit,
  IconMapPin,
  IconPlus,
  IconRoute,
  IconTrash,
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

import { Button } from "@/components/ui/button"
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
import Link from "next/link"

function formatKm(distanceMeters: number): string {
  return `${(distanceMeters / 1000).toFixed(1)} km`
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  }) + ", " + d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

function getStatusBadge(status: JobStatus) {
  const labels: Record<JobStatus, string> = {
    pending: "Pending",
    in_progress: "Active",
    completed: "Done",
    cancelled: "Cancelled",
  }
  return <span className="text-xs">{labels[status]}</span>
}

// Win7 Sortable Header (clickable text/area, not a button element to avoid double-styling)
function SortableHeader({
  column,
  title,
}: {
  column: { getIsSorted: () => false | "asc" | "desc"; toggleSorting: (desc?: boolean) => void }
  title: string
}) {
  const sorted = column.getIsSorted()
  return (
    <div
      className="flex items-center gap-1 cursor-pointer select-none h-full"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {title}
      {sorted === "asc" && <IconChevronUp className="size-3" />}
      {sorted === "desc" && <IconChevronDown className="size-3" />}
    </div>
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

  const columns: ColumnDef<JobDTO>[] = React.useMemo(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => <SortableHeader column={column} title="Job" />,
        cell: ({ row }) => (
          <div className="max-w-[140px] truncate" title={row.original.title}>
            {row.original.title}
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
            <div className="flex items-center gap-1 max-w-[100px] truncate" title={job.driverName}>
              <IconUser className="size-3 text-muted-foreground shrink-0" />
              {job.driverName}
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="win7-btn-ghost text-xs text-blue-600 hover:underline flex items-center gap-0.5"
                  onPointerEnter={fetchAvailableDrivers}
                >
                  <IconUserPlus className="size-3" /> Assign
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                {loadingDrivers ? (
                  <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
                ) : availableDrivers.length === 0 ? (
                  <DropdownMenuItem disabled>No drivers available</DropdownMenuItem>
                ) : (
                  availableDrivers.map((driver) => (
                    <DropdownMenuItem key={driver.id} onClick={() => handleAssignDriver(job, driver.id)}>
                      <IconUser className="size-3.5 mr-2" />
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
        cell: ({ row }) => formatDateTime(row.original.pickupAt),
        sortingFn: (rowA, rowB) => {
          return new Date(rowA.original.pickupAt).getTime() - new Date(rowB.original.pickupAt).getTime()
        },
        size: 110,
      },
      {
        id: "route",
        header: () => "Route",
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5 max-w-[180px]">
            <div className="flex items-center gap-1 w-full">
              <IconMapPin className="size-3 text-green-600 shrink-0" />
              <span className="truncate" title={row.original.pickupAddress}>
                {row.original.pickupAddress.split(",")[0]}
              </span>
            </div>
            <div className="flex items-center gap-1 w-full">
              <IconRoute className="size-3 text-red-600 shrink-0" />
              <span className="truncate" title={row.original.dropAddress}>
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
          <div className="text-right w-full">
            <SortableHeader column={column} title="Dist" />
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right">
            {formatKm(row.original.distanceMeters)}
          </div>
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
              <DropdownMenuTrigger asChild>
                <button className="win7-btn-ghost size-6 -my-1 h-5 w-5 flex items-center justify-center">
                  <IconDotsVertical className="size-3.5" />
                  <span className="sr-only">Actions</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => router.push(`/dashboard/jobs/${job.id}/edit`)}>
                  <IconEdit className="size-3.5 mr-2" />
                  Edit
                </DropdownMenuItem>

                {job.status === "pending" && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger onPointerEnter={fetchAvailableDrivers}>
                      <IconUserPlus className="size-3.5 mr-2" />
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
                <DropdownMenuItem variant="destructive" onClick={() => onDelete(job)}>
                  <IconTrash className="size-3.5 mr-2" />
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
    [availableDrivers, loadingDrivers, fetchAvailableDrivers, handleAssignDriver, router, onDelete]
  )

  const table = useReactTable({
    data: jobs,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  // Win7 styling setup
  return (
    <div className="flex flex-col gap-2">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-base font-bold text-[#003399]">Delivery Jobs</h2>
          <p className="text-xs text-gray-600">
            {jobs.length} {jobs.length === 1 ? "job" : "jobs"} found
          </p>
        </div>
        <Link href="/dashboard/jobs/new">
          <button className="win7-btn flex items-center justify-center">
            <span className="flex items-center gap-1">
              <IconPlus className="size-3" /> New Job
            </span>
          </button>
        </Link>
      </div>

      {/* Win7 Table */}
      <table className="win7-table w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-8 text-gray-500">
                No jobs found.
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-blue-50"
                onClick={(e) => {
                  // Basic row click handling
                  if (!(e.target as HTMLElement).closest("button, a, [role='menuitem'], [role='button']")) {
                    router.push(`/dashboard/jobs/${row.original.id}/edit`)
                  }
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
