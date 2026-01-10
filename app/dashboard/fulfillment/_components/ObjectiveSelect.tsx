"use client"

import * as React from "react"

import type { FulfillmentObjective } from "@/lib/fulfillment/types"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type UiObjective = Exclude<FulfillmentObjective, "revenue">

export function ObjectiveSelect({
  value,
  onChange,
  disabled,
}: {
  value: UiObjective
  onChange: (v: UiObjective) => void
  disabled?: boolean
}) {
  return (
    <div className="grid gap-2">
      <Label>Objective</Label>
      <Select
        value={value}
        onValueChange={(v) => onChange(v as UiObjective)}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select objective" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="balanced">Balanced</SelectItem>
          <SelectItem value="fastest">Fastest</SelectItem>
          <SelectItem value="cheapest">Cheapest</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

