"use client"

import * as React from "react"
import { toast } from "sonner"

import type { JobDTO } from "@/app/dashboard/jobs/_types"
import type { LngLat, RouteOption, RouteType } from "@/app/dashboard/jobs/_types"
import { dateTimeLocalToIso } from "@/app/dashboard/jobs/_utils/datetime"
import { getMultipleRoutes } from "@/app/dashboard/jobs/_server/getMultipleRoutes"
import { reverseGeocode } from "@/app/dashboard/jobs/_server/mapboxGeocoding"
import { createMasterJobFromRequest } from "../_server/requestActions"
import { JobRouteMap } from "@/app/dashboard/jobs/_components/JobRouteMap"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { LocationInput } from "./LocationInput"

type ActivePoint = "auto" | "pickup" | "drop"

type FormState = {
  title: string
  weightKg: number
  pickupAddress: string
  dropAddress: string
  pickupAtLocal: string
  dropStartLocal: string
  dropEndLocal: string
  pickup?: LngLat
  drop?: LngLat
}

function pad2(n: number): string {
  return n.toString().padStart(2, "0")
}

function toLocalInputValue(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = pad2(d.getMonth() + 1)
  const dd = pad2(d.getDate())
  const hh = pad2(d.getHours())
  const min = pad2(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

function getInitialState(now = new Date()): FormState {
  const pickupAt = new Date(now.getTime() + 60 * 60 * 1000)
  const dropStart = new Date(pickupAt.getTime() + 4 * 60 * 60 * 1000)
  const dropEnd = new Date(dropStart.getTime() + 2 * 60 * 60 * 1000)

  return {
    title: "",
    weightKg: 10,
    pickupAddress: "",
    dropAddress: "",
    pickupAtLocal: toLocalInputValue(pickupAt),
    dropStartLocal: toLocalInputValue(dropStart),
    dropEndLocal: toLocalInputValue(dropEnd),
  }
}

export function RequestForm({
  onCreated,
}: {
  onCreated: (job: JobDTO) => void | Promise<void>
}) {
  const [form, setForm] = React.useState<FormState>(() => getInitialState())
  const [activePoint, setActivePoint] = React.useState<ActivePoint>("auto")

  const [routes, setRoutes] = React.useState<RouteOption[]>([])
  const [selectedRouteType, setSelectedRouteType] = React.useState<RouteType>("fastest")
  const [isLoadingRoutes, setIsLoadingRoutes] = React.useState(false)

  const [creating, setCreating] = React.useState(false)

  const canCreate = Boolean(
    form.title.trim() &&
      form.weightKg > 0 &&
      form.pickupAddress.trim() &&
      form.dropAddress.trim() &&
      form.pickup &&
      form.drop
  )

  function handlePick(kind: "pickup" | "drop", coord: LngLat) {
    setForm((prev) => {
      const next: FormState = {
        ...prev,
        pickup: kind === "pickup" ? coord : prev.pickup,
        drop: kind === "drop" ? coord : prev.drop,
      }
      return next
    })

    // Always update address when map is clicked
    void (async () => {
      try {
        const addr = await reverseGeocode(coord)
        setForm((prev) => {
          if (kind === "pickup") {
            return { ...prev, pickupAddress: addr }
          }
          return { ...prev, dropAddress: addr }
        })
      } catch {
        // best-effort
      }
    })()
  }

  function handleLocationChange(kind: "pickup" | "drop", address: string, coordinates: LngLat) {
    setForm((prev) => {
      const next: FormState = {
        ...prev,
        pickup: kind === "pickup" ? coordinates : prev.pickup,
        drop: kind === "drop" ? coordinates : prev.drop,
        pickupAddress: kind === "pickup" ? address : prev.pickupAddress,
        dropAddress: kind === "drop" ? address : prev.dropAddress,
      }
      return next
    })
  }

  React.useEffect(() => {
    if (!form.pickup || !form.drop) return

    setIsLoadingRoutes(true)
    const handle = window.setTimeout(() => {
      void (async () => {
        try {
          const res = await getMultipleRoutes(form.pickup!, form.drop!)
          setRoutes(res.routes)
          // Keep selection if available; otherwise fall back to first route.
          if (!res.routes.some((r) => r.type === selectedRouteType)) {
            setSelectedRouteType(res.routes[0]?.type ?? "fastest")
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Failed to compute routes"
          toast.error(msg)
          setRoutes([])
        } finally {
          setIsLoadingRoutes(false)
        }
      })()
    }, 250)

    return () => window.clearTimeout(handle)
  }, [form.pickup, form.drop])

  async function handleCreate() {
    if (!canCreate || !form.pickup || !form.drop) return
    setCreating(true)
    try {
      const created = await createMasterJobFromRequest({
        title: form.title,
        weightKg: form.weightKg,
        pickupAddress: form.pickupAddress,
        dropAddress: form.dropAddress,
        pickup: { lat: form.pickup.lat, lng: form.pickup.lng },
        drop: { lat: form.drop.lat, lng: form.drop.lng },
        pickupAt: dateTimeLocalToIso(form.pickupAtLocal),
        dropWindowStartAt: dateTimeLocalToIso(form.dropStartLocal),
        dropWindowEndAt: dateTimeLocalToIso(form.dropEndLocal),
        preferredRouteType: selectedRouteType,
      })
      toast.success("Request created")
      await onCreated(created)
      setForm(getInitialState())
      setRoutes([])
      setSelectedRouteType("fastest")
      setActivePoint("auto")
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create request"
      toast.error(msg)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="fulfill-title">Shipment title</Label>
          <Input
            id="fulfill-title"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="e.g. Delhi → Jaipur (Electronics)"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="fulfill-weight">Weight (kg)</Label>
          <Input
            id="fulfill-weight"
            type="number"
            min={1}
            value={form.weightKg}
            onChange={(e) => setForm((p) => ({ ...p, weightKg: Number(e.target.value) }))}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <LocationInput
          id="fulfill-pickup-address"
          label="Pickup address"
          value={form.pickupAddress}
          placeholder="Search pickup location or click on map"
          onChange={(address, coordinates) => handleLocationChange("pickup", address, coordinates)}
          proximity={form.drop}
        />
        <LocationInput
          id="fulfill-drop-address"
          label="Drop address"
          value={form.dropAddress}
          placeholder="Search drop location or click on map"
          onChange={(address, coordinates) => handleLocationChange("drop", address, coordinates)}
          proximity={form.pickup}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="fulfill-pickup-at">Pickup time</Label>
          <Input
            id="fulfill-pickup-at"
            type="datetime-local"
            value={form.pickupAtLocal}
            onChange={(e) => setForm((p) => ({ ...p, pickupAtLocal: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="fulfill-drop-start">Drop window start</Label>
          <Input
            id="fulfill-drop-start"
            type="datetime-local"
            value={form.dropStartLocal}
            onChange={(e) => setForm((p) => ({ ...p, dropStartLocal: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="fulfill-drop-end">Drop window end</Label>
          <Input
            id="fulfill-drop-end"
            type="datetime-local"
            value={form.dropEndLocal}
            onChange={(e) => setForm((p) => ({ ...p, dropEndLocal: e.target.value }))}
          />
        </div>
      </div>

      <Separator />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <div className="text-xs font-medium">Pick points on map</div>
          <div className="text-xs text-muted-foreground">
            Choose Auto to click pickup then drop, or pick them individually.
          </div>
        </div>
        <ToggleGroup
          type="single"
          value={activePoint}
          onValueChange={(v) => setActivePoint((v as ActivePoint) || "auto")}
          variant="outline"
        >
          <ToggleGroupItem value="auto">Auto</ToggleGroupItem>
          <ToggleGroupItem value="pickup">Pickup</ToggleGroupItem>
          <ToggleGroupItem value="drop">Drop</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <JobRouteMap
        pickup={form.pickup}
        drop={form.drop}
        routes={routes}
        selectedRouteType={selectedRouteType}
        onSelectRoute={setSelectedRouteType}
        activePoint={activePoint}
        onPick={handlePick}
        isLoadingRoutes={isLoadingRoutes}
      />

      <div className="flex justify-end">
        <Button onClick={() => void handleCreate()} disabled={!canCreate || creating}>
          {creating ? "Creating..." : "Create Request"}
        </Button>
      </div>
    </div>
  )
}

