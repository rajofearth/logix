"use client"

import * as React from "react"
import { format } from "date-fns"
import { IconPlaneDeparture, IconPlaneArrival, IconClock, IconPlane } from "@tabler/icons-react"
import { toast } from "sonner"
import { getShipmentDetail, updateShipmentStatus, getFlightsForRoute } from "@/app/dashboard/air-shipments/_server/actions"
import type { FlightOption } from "@/app/dashboard/air-shipments/_server/actions"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

interface AirSegmentAdjustProps {
  shipmentId: string
  onComplete: () => void
  isCompleting: boolean
}

export function AirSegmentAdjust({
  shipmentId,
  onComplete,
  isCompleting,
}: AirSegmentAdjustProps) {
  const [shipment, setShipment] = React.useState<{ fromIcao: string; toIcao: string } | null>(null)
  const [flights, setFlights] = React.useState<FlightOption[]>([])
  const [selectedFlightIndex, setSelectedFlightIndex] = React.useState<number | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isLoadingFlights, setIsLoadingFlights] = React.useState(false)
  const [isUpdating, setIsUpdating] = React.useState(false)

  React.useEffect(() => {
    void (async () => {
      try {
        const detail = await getShipmentDetail(shipmentId)
        if (detail && detail.segments.length > 0) {
          const segment = detail.segments[0]
          if (segment.fromAirportIcao && segment.toAirportIcao) {
            setShipment({
              fromIcao: segment.fromAirportIcao,
              toIcao: segment.toAirportIcao,
            })
            loadFlights(segment.fromAirportIcao, segment.toAirportIcao)
          }
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load shipment details")
      } finally {
        setIsLoading(false)
      }
    })()
  }, [shipmentId])

  const loadFlights = React.useCallback(async (fromIcao: string, toIcao: string) => {
    setIsLoadingFlights(true)
    try {
      await new Promise((r) => setTimeout(r, 600))
      const options = await getFlightsForRoute(fromIcao, toIcao)
      setFlights(options)
      setSelectedFlightIndex(null)
    } catch (error) {
      console.error("Failed to load flights", error)
      toast.error("Failed to load flights")
    } finally {
      setIsLoadingFlights(false)
    }
  }, [])

  const handleSave = React.useCallback(async () => {
    if (selectedFlightIndex === null || !flights[selectedFlightIndex]) return

    setIsUpdating(true)
    try {
      const result = await updateShipmentStatus(shipmentId, "created", {
        flightDetails: flights[selectedFlightIndex]!,
      })
      if (result.success) {
        toast.success("Flight selected")
        onComplete()
      } else {
        toast.error("Failed to update flight")
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update flight")
    } finally {
      setIsUpdating(false)
    }
  }, [shipmentId, flights, selectedFlightIndex, onComplete])

  if (isLoading || !shipment) {
    return <div className="p-4 text-sm text-muted-foreground">Loading shipment details...</div>
  }

  const selectedFlight = selectedFlightIndex !== null ? flights[selectedFlightIndex] : null

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <Label>Available Flights ({shipment.fromIcao} → {shipment.toIcao})</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => loadFlights(shipment.fromIcao, shipment.toIcao)}
            disabled={isLoadingFlights}
          >
            {isLoadingFlights ? "Loading..." : "Refresh"}
          </Button>
        </div>

        {isLoadingFlights ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
                <Skeleton className="size-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {flights.map((flight, index) => {
                const isSelected = selectedFlightIndex === index
                const firstLeg = flight.legs[0]
                const lastLeg = flight.legs[flight.legs.length - 1]
                const isConnecting = flight.legs.length > 1

                const durationHrs = Math.floor(flight.totalDuration / 60)
                const durationMins = flight.totalDuration % 60

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedFlightIndex(index)}
                    className={`
                      cursor-pointer rounded-xl border p-4 transition-all w-full text-left
                      hover:bg-muted/50
                      ${isSelected
                        ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary"
                        : "bg-card"
                      }
                    `}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`
                          flex size-10 items-center justify-center rounded-full
                          ${isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}
                        `}>
                          <IconPlane className="size-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold leading-none">{firstLeg.carrier}</h4>
                          <p className="text-sm text-muted-foreground mt-1 font-mono">{firstLeg.flightNumber}</p>
                          {isConnecting && (
                            <p className="text-xs text-orange-500 mt-1">
                              {flight.legs.length - 1} stop via {flight.legs.slice(0, -1).map(l => l.to).join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold block text-lg">${flight.price}</span>
                        <span className="text-xs text-muted-foreground">{firstLeg.aircraft}</span>
                      </div>
                    </div>

                    <Separator className="my-3 opacity-50" />

                    <div className="flex items-center justify-between text-sm">
                      <div className="grid gap-0.5">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <IconPlaneDeparture className="size-3.5" />
                          <span>Departure</span>
                        </div>
                        <span className="font-medium">
                          {format(new Date(firstLeg.departureTime), "HH:mm")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(firstLeg.departureTime), "MMM d")}
                        </span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                          <IconClock className="size-3" />
                          {durationHrs}h {durationMins}m
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-px w-8 bg-border" />
                          {isConnecting ? (
                            <div className="flex items-center gap-1">
                              {flight.legs.map((_, i) => (
                                <div key={i} className={`size-2 rounded-full ${i === flight.legs.length - 1 ? "bg-green-500" : "bg-orange-500"}`} />
                              ))}
                            </div>
                          ) : (
                            <IconPlane className="size-3 text-muted-foreground rotate-90" />
                          )}
                          <div className="h-px w-8 bg-border" />
                        </div>
                        {isConnecting && (
                          <span className="text-xs text-orange-500 mt-1">
                            {flight.legs.length - 1} stop
                          </span>
                        )}
                      </div>

                      <div className="grid gap-0.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-muted-foreground">
                          <span>Arrival</span>
                          <IconPlaneArrival className="size-3.5" />
                        </div>
                        <span className="font-medium">
                          {format(new Date(lastLeg.arrivalTime), "HH:mm")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(lastLeg.arrivalTime), "MMM d")}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          onClick={handleSave}
          disabled={selectedFlightIndex === null || isUpdating || isCompleting}
        >
          {isUpdating ? "Saving..." : "Confirm & Continue"}
        </Button>
      </div>
    </div>
  )
}
