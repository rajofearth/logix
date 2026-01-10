"use client"

import * as React from "react"
import type { CandidateSegment } from "@/lib/fulfillment/types"

function modeLabel(mode: CandidateSegment["mode"]): string {
  switch (mode) {
    case "ground":
      return "Ground"
    case "train":
      return "Train"
    case "air":
      return "Air"
    default:
      return "Segment"
  }
}

export function PlanSegments({ segments }: { segments: CandidateSegment[] }) {
  return (
    <div className="grid gap-2">
      {segments.map((s, idx) => (
        <div key={idx} className="rounded-md border bg-muted/20 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-medium">
              {idx + 1}. {modeLabel(s.mode)}
            </div>
            <div className="text-xs text-muted-foreground">{s.title}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

