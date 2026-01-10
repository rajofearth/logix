"use client"

import * as React from "react"
import { toast } from "sonner"
import { assignDriver } from "@/app/dashboard/jobs/_server/jobActions"
import { updateJobRoute } from "@/app/dashboard/jobs/_server/jobActions"
import { getJob } from "@/app/dashboard/jobs/_server/jobActions"
import { getMultipleRoutes } from "@/app/dashboard/jobs/_server/getMultipleRoutes"
import { listAvailableDrivers } from "@/app/dashboard/jobs/_server/driverList"
import type { JobDTO, RouteOption, RouteType, LngLat } from "@/app/dashboard/jobs/_types"
import { JobRouteMap } from "@/app/dashboard/jobs/_components/JobRouteMap"
import { RouteOptionCard } from "@/app/dashboard/jobs/_components/RouteOptionCard"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

interface GroundSegmentAdjustProps {
  jobId: string
  onComplete: () => void
  isCompleting: boolean
}

export function GroundSegmentAdjust({
  jobId,
  onComplete,
  isCompleting,
}: GroundSegmentAdjustProps) {
  const [job, setJob] = React.useState<JobDTO | null>(null)
  const [availableDrivers, setAvailableDrivers] = React.useState<Array<{ id: string; name: string }>>([])
  const [selectedDriverId, setSelectedDriverId] = React.useState<string | null>(null)
  const [routes, setRoutes] = React.useState<RouteOption[]>([])
  const [selectedRouteType, setSelectedRouteType] = React.useState<RouteType>("fastest")
  const [isLoading, setIsLoading] = React.useState(true)
  const [isUpdating, setIsUpdating] = React.useState(false)

  React.useEffect(() => {
    void (async () => {
      try {
        const [jobData, drivers] = await Promise.all([
          getJob(jobId),
          listAvailableDrivers(),
        ])
        setJob(jobData)
        setSelectedDriverId(jobData.driverId)
        setAvailableDrivers(drivers)

        if (jobData.pickupLat && jobData.pickupLng && jobData.dropLat && jobData.dropLng) {
          const routeRes = await getMultipleRoutes(
            { lat: jobData.pickupLat, lng: jobData.pickupLng },
            { lat: jobData.dropLat, lng: jobData.dropLng }
          )
          setRoutes(routeRes.routes)
          setSelectedRouteType(jobData.routeType ?? "fastest")
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load job details")
      } finally {
        setIsLoading(false)
      }
    })()
  }, [jobId])

  const handleSave = React.useCallback(async () => {
    if (!job) return

    setIsUpdating(true)
    try {
      // Update driver if changed
      if (selectedDriverId !== job.driverId) {
        await assignDriver(jobId, selectedDriverId)
      }

      // Update route if changed
      const selectedRoute = routes.find((r) => r.type === selectedRouteType)
      if (selectedRoute && selectedRouteType !== job.routeType) {
        await updateJobRoute(
          jobId,
          selectedRoute.type,
          selectedRoute.routeGeoJson,
          selectedRoute.distanceMeters,
          selectedRoute.durationSeconds,
          selectedRoute.estimatedFuelCost
        )
      }

      toast.success("Segment configured")
      onComplete()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update segment")
    } finally {
      setIsUpdating(false)
    }
  }, [job, jobId, selectedDriverId, routes, selectedRouteType, onComplete])

  if (isLoading || !job) {
    return <div className="p-4 text-sm text-muted-foreground">Loading...</div>
  }

  const pickup: LngLat | undefined = job.pickupLat && job.pickupLng
    ? { lat: job.pickupLat, lng: job.pickupLng }
    : undefined
  const drop: LngLat | undefined = job.dropLat && job.dropLng
    ? { lat: job.dropLat, lng: job.dropLng }
    : undefined

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="driver-select">Assign Driver</Label>
          <Select
            value={selectedDriverId ?? "unassigned"}
            onValueChange={(v) => setSelectedDriverId(v === "unassigned" ? null : v)}
          >
            <SelectTrigger id="driver-select">
              <SelectValue placeholder="Select a driver" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {availableDrivers.map((driver) => (
                <SelectItem key={driver.id} value={driver.id}>
                  {driver.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          <Label>Route Selection</Label>
          {pickup && drop && routes.length > 0 && (
            <div className="space-y-3">
              <JobRouteMap
                pickup={pickup}
                drop={drop}
                routes={routes}
                selectedRouteType={selectedRouteType}
                onSelectRoute={setSelectedRouteType}
                activePoint="auto"
                onPick={() => {}}
                isLoadingRoutes={false}
              />
              <div className="grid gap-2 md:grid-cols-3">
                {routes.map((route) => (
                  <RouteOptionCard
                    key={route.type}
                    route={route}
                    isSelected={route.type === selectedRouteType}
                    onSelect={setSelectedRouteType}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          onClick={handleSave}
          disabled={isUpdating || isCompleting}
        >
          {isUpdating ? "Saving..." : "Confirm & Continue"}
        </Button>
      </div>
    </div>
  )
}
