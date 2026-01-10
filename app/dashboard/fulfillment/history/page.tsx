"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HistoryRequestList } from "./_components/HistoryRequestList"
import { listFulfillmentRequestsWithPlans } from "../_server/historyActions"
import type { FulfillmentRequestDTO } from "../_server/historyActions"

export default function FulfillmentHistoryPage() {
  const router = useRouter()
  const [requests, setRequests] = React.useState<FulfillmentRequestDTO[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [nextCursor, setNextCursor] = React.useState<string | null>(null)
  const [isLoadingMore, setIsLoadingMore] = React.useState(false)

  const fetchRequests = React.useCallback(async (cursor?: string) => {
    try {
      const result = await listFulfillmentRequestsWithPlans({
        limit: 20,
        cursor,
      })
      if (cursor) {
        setRequests((prev) => [...prev, ...result.requests])
      } else {
        setRequests(result.requests)
      }
      setNextCursor(result.nextCursor)
    } catch (error) {
      console.error("Failed to fetch fulfillment requests:", error)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [])

  React.useEffect(() => {
    void fetchRequests()
  }, [fetchRequests])

  const handleLoadMore = React.useCallback(() => {
    if (nextCursor && !isLoadingMore) {
      setIsLoadingMore(true)
      void fetchRequests(nextCursor)
    }
  }, [nextCursor, isLoadingMore, fetchRequests])

  return (
    <DashboardShell title="Fulfillment History">
      <div className="win7-groupbox win7-mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1>Fulfillment Requests History</h1>
            <p className="text-sm text-muted-foreground">
              Browse past fulfillment requests and their generated plans
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/dashboard/fulfillment")}>
            Back to Planner
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Loading...
          </CardContent>
        </Card>
      ) : (
        <>
          <HistoryRequestList requests={requests} />
          {nextCursor && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}
    </DashboardShell>
  )
}
