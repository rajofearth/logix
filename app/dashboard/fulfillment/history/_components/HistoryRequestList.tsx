"use client"

import * as React from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

import type { FulfillmentRequestDTO } from "../../_server/historyActions"
import { PlansTable } from "./PlansTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
    case "in_progress":
      return "secondary"
    case "cancelled":
      return "destructive"
    default:
      return "outline"
  }
}

export function HistoryRequestList({ requests }: { requests: FulfillmentRequestDTO[] }) {
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set())

  const toggleExpand = React.useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No fulfillment requests found.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {requests.map((request) => {
        const isExpanded = expandedIds.has(request.id)
        return (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleExpand(request.id)}
                      className="flex items-center justify-center p-1 hover:bg-muted rounded"
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <CardTitle className="text-sm font-semibold">{request.title}</CardTitle>
                    <Badge variant={getStatusBadgeVariant(request.status)} className="text-xs">
                      {request.status}
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium">Pickup:</span> {request.pickupAddress}
                    </div>
                    <div>
                      <span className="font-medium">Drop:</span> {request.dropAddress}
                    </div>
                    <div className="mt-1">
                      Created: {formatDate(request.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {request.plans.length} plan{request.plans.length !== 1 ? "s" : ""}
                </div>
              </div>
            </CardHeader>
            {isExpanded && (
              <CardContent>
                <PlansTable plans={request.plans} />
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}
