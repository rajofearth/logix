"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
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
        <SiteHeader title="Fulfillment History" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h1 className="text-lg font-semibold">Fulfillment Requests History</h1>
                    <p className="text-sm text-muted-foreground">
                      Browse past fulfillment requests and their generated plans
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard/fulfillment")}
                  >
                    Back to Planner
                  </Button>
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
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
