"use client"

import * as React from "react"
import Link from "next/link"

import type { FulfillmentPlanListItemDTO } from "../../_server/historyActions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed":
      return "default"
    case "executing":
      return "secondary"
    case "failed":
      return "destructive"
    case "cancelled":
      return "destructive"
    default:
      return "outline"
  }
}

export function PlansTable({ plans }: { plans: FulfillmentPlanListItemDTO[] }) {
  if (plans.length === 0) {
    return (
      <div className="py-4 text-center text-xs text-muted-foreground">
        No plans found for this request.
      </div>
    )
  }

  return (
    <div className="win7-groupbox p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead>Objective</TableHead>
            <TableHead>Selected Plan</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(plan.status)} className="text-xs">
                  {plan.status}
                </Badge>
              </TableCell>
              <TableCell className="text-xs">{plan.objective}</TableCell>
              <TableCell className="text-xs font-mono">
                {plan.selectedPlanKey ?? "—"}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatDate(plan.createdAt)}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatDate(plan.updatedAt)}
              </TableCell>
              <TableCell>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                >
                  <Link href={`/dashboard/fulfillment/history/plan/${plan.id}`}>
                    View
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
