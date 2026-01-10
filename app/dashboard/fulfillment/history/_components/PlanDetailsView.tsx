"use client"

import * as React from "react"

import type { FulfillmentPlanDetailsDTO } from "../../_server/historyActions"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

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

function getSegmentStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed":
      return "default"
    case "in_progress":
      return "secondary"
    case "failed":
      return "destructive"
    case "cancelled":
      return "destructive"
    default:
      return "outline"
  }
}

export function PlanDetailsView({ plan }: { plan: FulfillmentPlanDetailsDTO }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Master Job</CardTitle>
          <CardDescription>Original fulfillment request details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Title:</span> {plan.masterJob.title}
          </div>
          <div>
            <span className="font-medium">Pickup:</span> {plan.masterJob.pickupAddress}
          </div>
          <div>
            <span className="font-medium">Drop:</span> {plan.masterJob.dropAddress}
          </div>
          <div>
            <span className="font-medium">Weight:</span> {plan.masterJob.weightKg} kg
          </div>
          {plan.masterJob.cargoName && (
            <div>
              <span className="font-medium">Cargo:</span> {plan.masterJob.cargoName}
            </div>
          )}
          <div>
            <span className="font-medium">Status:</span>{" "}
            <Badge variant={getStatusBadgeVariant(plan.masterJob.status)} className="text-xs">
              {plan.masterJob.status}
            </Badge>
          </div>
          <div>
            <span className="font-medium">Created:</span> {formatDate(plan.masterJob.createdAt)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan Details</CardTitle>
          <CardDescription>Fulfillment plan metadata and configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Status:</span>{" "}
            <Badge variant={getStatusBadgeVariant(plan.status)} className="text-xs">
              {plan.status}
            </Badge>
          </div>
          <div>
            <span className="font-medium">Objective:</span> {plan.objective}
          </div>
          <div>
            <span className="font-medium">Selected Plan Key:</span>{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">
              {plan.selectedPlanKey ?? "—"}
            </code>
          </div>
          <div>
            <span className="font-medium">Created:</span> {formatDate(plan.createdAt)}
          </div>
          <div>
            <span className="font-medium">Updated:</span> {formatDate(plan.updatedAt)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Segments</CardTitle>
          <CardDescription>Fulfillment plan segments ({plan.segments.length} total)</CardDescription>
        </CardHeader>
        <CardContent>
          {plan.segments.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              No segments found for this plan.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Order</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Job ID</TableHead>
                    <TableHead>Shipment ID</TableHead>
                    <TableHead>Train Shipment ID</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plan.segments.map((segment) => (
                    <TableRow key={segment.id}>
                      <TableCell className="text-xs font-medium">
                        {segment.sortOrder + 1}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {segment.mode}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getSegmentStatusBadgeVariant(segment.status)}
                          className="text-xs"
                        >
                          {segment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {segment.jobId ? (
                          <span className="text-muted-foreground">{segment.jobId.slice(0, 8)}...</span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {segment.shipmentId ? (
                          <span className="text-muted-foreground">{segment.shipmentId.slice(0, 8)}...</span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {segment.trainShipmentId ? (
                          <span className="text-muted-foreground">{segment.trainShipmentId.slice(0, 8)}...</span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(segment.updatedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
