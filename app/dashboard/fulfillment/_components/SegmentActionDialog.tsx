"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { GroundSegmentAdjust } from "./GroundSegmentAdjust"
import { AirSegmentAdjust } from "./AirSegmentAdjust"
import { TrainSegmentAdjust } from "./TrainSegmentAdjust"

type SegmentMode = "ground" | "air" | "train"

interface SegmentActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: SegmentMode
  segmentId: string
  planId: string
  jobId?: string
  shipmentId?: string
  trainShipmentId?: string
  onComplete: () => void
}

export function SegmentActionDialog({
  open,
  onOpenChange,
  mode,
  segmentId,
  planId,
  jobId,
  shipmentId,
  trainShipmentId,
  onComplete,
}: SegmentActionDialogProps) {
  const [isCompleting, setIsCompleting] = React.useState(false)

  const handleComplete = React.useCallback(async () => {
    setIsCompleting(true)
    try {
      await onComplete()
      onOpenChange(false)
    } finally {
      setIsCompleting(false)
    }
  }, [onComplete, onOpenChange])

  const title = React.useMemo(() => {
    switch (mode) {
      case "ground":
        return "Configure Ground Segment"
      case "air":
        return "Select Flight"
      case "train":
        return "Select Train"
      default:
        return "Configure Segment"
    }
  }, [mode])

  const description = React.useMemo(() => {
    switch (mode) {
      case "ground":
        return "Assign a driver and select a route for this ground delivery leg."
      case "air":
        return "Choose a flight for this air shipment leg."
      case "train":
        return "Select a train for this rail shipment leg."
      default:
        return "Configure this segment before proceeding."
    }
  }, [mode])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {mode === "ground" && jobId && (
            <GroundSegmentAdjust
              jobId={jobId}
              onComplete={handleComplete}
              isCompleting={isCompleting}
            />
          )}
          {mode === "air" && shipmentId && (
            <AirSegmentAdjust
              shipmentId={shipmentId}
              onComplete={handleComplete}
              isCompleting={isCompleting}
            />
          )}
          {mode === "train" && trainShipmentId && (
            <TrainSegmentAdjust
              trainShipmentId={trainShipmentId}
              onComplete={handleComplete}
              isCompleting={isCompleting}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
