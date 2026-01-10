"use client"

import * as React from "react"
import { toast } from "sonner"
import { getTrainShipmentDetail, searchTrains, updateTrainShipmentDetails } from "@/app/dashboard/train-shipments/_server/actions"
import type { TrainShipmentDetail } from "@/app/dashboard/train-shipments/_server/actions"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"

interface TrainSegmentAdjustProps {
  trainShipmentId: string
  onComplete: () => void
  isCompleting: boolean
}

interface TrainOption {
  trainNumber: string
  trainName: string
  departure: string
  arrival: string
  duration: string
  runningDays: string
}

export function TrainSegmentAdjust({
  trainShipmentId,
  onComplete,
  isCompleting,
}: TrainSegmentAdjustProps) {
  const [shipment, setShipment] = React.useState<TrainShipmentDetail | null>(null)
  const [trains, setTrains] = React.useState<TrainOption[]>([])
  const [selectedTrain, setSelectedTrain] = React.useState<TrainOption | null>(null)
  const [journeyDate, setJourneyDate] = React.useState("")
  const [coachType, setCoachType] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSearching, setIsSearching] = React.useState(false)
  const [isUpdating, setIsUpdating] = React.useState(false)

  React.useEffect(() => {
    void (async () => {
      try {
        const detail = await getTrainShipmentDetail(trainShipmentId)
        if (detail) {
          setShipment(detail)
          setJourneyDate(new Date(detail.journeyDate).toISOString().split("T")[0])
          setCoachType(detail.coachType || "")
          setSelectedTrain({
            trainNumber: detail.trainNumber,
            trainName: detail.trainName,
            departure: new Date(detail.scheduledDep).toTimeString().slice(0, 5),
            arrival: new Date(detail.scheduledArr).toTimeString().slice(0, 5),
            duration: `${Math.round((detail.scheduledArr.getTime() - detail.scheduledDep.getTime()) / (1000 * 60))} min`,
            runningDays: "Daily",
          })

          // Auto-search trains
          const result = await searchTrains(detail.fromStationCode, detail.toStationCode)
          if (result.success && result.data.length > 0) {
            setTrains(result.data.map((t) => ({
              trainNumber: t.trainNumber,
              trainName: t.trainName,
              departure: t.departure,
              arrival: t.arrival,
              duration: t.duration,
              runningDays: t.runningDays,
            })))
          }
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load shipment details")
      } finally {
        setIsLoading(false)
      }
    })()
  }, [trainShipmentId])

  const handleSearchTrains = React.useCallback(async () => {
    if (!shipment) return
    setIsSearching(true)
    try {
      const result = await searchTrains(shipment.fromStationCode, shipment.toStationCode)
      if (result.success) {
        setTrains(result.data.map((t) => ({
          trainNumber: t.trainNumber,
          trainName: t.trainName,
          departure: t.departure,
          arrival: t.arrival,
          duration: t.duration,
          runningDays: t.runningDays,
        })))
      } else {
        toast.error(result.error || "Failed to search trains")
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to search trains")
    } finally {
      setIsSearching(false)
    }
  }, [shipment])

  const handleSave = React.useCallback(async () => {
    if (!shipment || !selectedTrain || !journeyDate) return

    setIsUpdating(true)
    try {
      const dateObj = new Date(journeyDate)
      const [depHours, depMinutes] = selectedTrain.departure.split(":").map(Number)
      const [arrHours, arrMinutes] = selectedTrain.arrival.split(":").map(Number)

      const scheduledDep = new Date(dateObj)
      scheduledDep.setHours(depHours || 0, depMinutes || 0, 0, 0)

      const scheduledArr = new Date(dateObj)
      scheduledArr.setHours(arrHours || 0, arrMinutes || 0, 0, 0)
      if (scheduledArr < scheduledDep) {
        scheduledArr.setDate(scheduledArr.getDate() + 1)
      }

      const result = await updateTrainShipmentDetails(trainShipmentId, {
        trainNumber: selectedTrain.trainNumber,
        trainName: selectedTrain.trainName,
        journeyDate: dateObj,
        scheduledDep,
        scheduledArr,
        coachType: coachType || undefined,
      })

      if (result.success) {
        toast.success("Train selected")
        onComplete()
      } else {
        toast.error(result.error || "Failed to update train")
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update train")
    } finally {
      setIsUpdating(false)
    }
  }, [shipment, selectedTrain, journeyDate, coachType, trainShipmentId, onComplete])

  if (isLoading || !shipment) {
    return <div className="p-4 text-sm text-muted-foreground">Loading shipment details...</div>
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="journey-date">Journey Date</Label>
          <Input
            id="journey-date"
            type="date"
            value={journeyDate}
            onChange={(e) => setJourneyDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="coach-type">Coach Type (optional)</Label>
          <Input
            id="coach-type"
            placeholder="e.g., SL, 3A, 2A, 1A"
            value={coachType}
            onChange={(e) => setCoachType(e.target.value)}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <Label>Available Trains</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSearchTrains}
            disabled={isSearching}
          >
            {isSearching ? "Searching..." : "Refresh"}
          </Button>
        </div>

        <div className="grid gap-2 max-h-64 overflow-y-auto">
          {trains.map((train) => {
            const isSelected = selectedTrain?.trainNumber === train.trainNumber
            return (
              <button
                key={train.trainNumber}
                type="button"
                onClick={() => setSelectedTrain(train)}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "hover:border-muted-foreground/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{train.trainName}</span>
                  <span className="font-mono text-sm text-muted-foreground">
                    {train.trainNumber}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{train.departure} → {train.arrival}</span>
                  <span>{train.duration}</span>
                  <span>{train.runningDays}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          onClick={handleSave}
          disabled={!selectedTrain || !journeyDate || isUpdating || isCompleting}
        >
          {isUpdating ? "Saving..." : "Confirm & Continue"}
        </Button>
      </div>
    </div>
  )
}
