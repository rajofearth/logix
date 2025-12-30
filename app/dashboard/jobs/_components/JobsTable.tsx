"use client"

import * as React from "react"
import { IconDotsVertical, IconEdit, IconPlus, IconTrash } from "@tabler/icons-react"
import { useRouter } from "next/navigation"

import type { JobDTO } from "../_types"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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

export function JobsTable({
  jobs,
  onDelete,
}: {
  jobs: JobDTO[]
  onDelete: (job: JobDTO) => void
}) {
  const router = useRouter()

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
                  <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                    No jobs yet. Create your first job.
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
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
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/jobs/${job.id}/edit`)}>
                            <IconEdit className="size-4" />
                            Edit
                          </DropdownMenuItem>
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


