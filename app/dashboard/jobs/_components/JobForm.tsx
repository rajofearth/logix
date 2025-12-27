"use client"

import * as React from "react"
import { IconArrowLeft, IconLoader2, IconMapPin, IconRoute } from "@tabler/icons-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import type { DirectionsResult, JobDTO, JobUpsertInput, LngLat } from "../_types"
import { dateTimeLocalToIso, isoToDateTimeLocalValue } from "../_utils/datetime"
import { createJob, updateJob } from "../_server/jobActions"
import { getDirections } from "../_server/mapboxDirections"
import { reverseGeocode } from "../_server/mapboxGeocoding"
import { JobRouteMap } from "./JobRouteMap"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

type ActivePoint = "auto" | "pickup" | "drop"

type FormState = {
  title: string
  weightKg: number
  pickupAddress: string
  dropAddress: string
  pickupAtLocal: string
  dropStartLocal: string
  dropEndLocal: string
  distanceMeters: number
  pickup?: LngLat
  drop?: LngLat
}

function getInitialCreateState(now = new Date()): FormState {
  const plus1h = new Date(now.getTime() + 60 * 60 * 1000)
  const plus2h = new Date(now.getTime() + 2 * 60 * 60 * 1000)
  const plus4h = new Date(now.getTime() + 4 * 60 * 60 * 1000)

  return {
    title: "",
    weightKg: 100,
    pickupAddress: "",
    dropAddress: "",
    pickupAtLocal: isoToDateTimeLocalValue(plus1h.toISOString()),
    dropStartLocal: isoToDateTimeLocalValue(plus2h.toISOString()),
    dropEndLocal: isoToDateTimeLocalValue(plus4h.toISOString()),
    distanceMeters: 0,
    pickup: undefined,
    drop: undefined,
  }
}

function jobToFormState(job: JobDTO): FormState {
  return {
    title: job.title,
    weightKg: job.weightKg,
    pickupAddress: job.pickupAddress,
    dropAddress: job.dropAddress,
    pickupAtLocal: isoToDateTimeLocalValue(job.pickupAt),
    dropStartLocal: isoToDateTimeLocalValue(job.dropWindowStartAt),
    dropEndLocal: isoToDateTimeLocalValue(job.dropWindowEndAt),
    distanceMeters: job.distanceMeters,
    pickup: { lng: job.pickupLng, lat: job.pickupLat },
    drop: { lng: job.dropLng, lat: job.dropLat },
  }
}

function metersToKm(meters: number): string {
  return (meters / 1000).toFixed(2)
}

function secondsToMinutes(seconds: number): string {
  return `${Math.round(seconds / 60)} min`
}

export function JobForm({
  mode,
  initialJob,
}: {
  mode: "create" | "edit"
  initialJob?: JobDTO
}) {
  const router = useRouter()
  const [activePoint, setActivePoint] = React.useState<ActivePoint>("auto")
  const [form, setForm] = React.useState<FormState>(() =>
    initialJob ? jobToFormState(initialJob) : getInitialCreateState()
  )
  const [route, setRoute] = React.useState<DirectionsResult | null>(null)
  const [isSaving, startSaving] = React.useTransition()
  const [isRouting, startRouting] = React.useTransition()

  React.useEffect(() => {
    setActivePoint("auto")
    setRoute(null)
    setForm(initialJob ? jobToFormState(initialJob) : getInitialCreateState())
  }, [initialJob])

  React.useEffect(() => {
    if (!form.pickup || !form.drop) return

    const handle = window.setTimeout(() => {
      startRouting(async () => {
        try {
          const res = await getDirections(form.pickup!, form.drop!)
          setRoute(res)
          setForm((prev) => ({
            ...prev,
            distanceMeters: res.distanceMeters,
          }))
        } catch (e) {
          setRoute(null)
          const msg = e instanceof Error ? e.message : "Failed to compute route"
          toast.error(msg)
        }
      })
    }, 300)

    return () => {
      window.clearTimeout(handle)
    }
  }, [form.pickup, form.drop])

  function handlePick(kind: "pickup" | "drop", coord: LngLat) {
    setForm((prev) => {
      const next: FormState = {
        ...prev,
        pickup: kind === "pickup" ? coord : prev.pickup,
        drop: kind === "drop" ? coord : prev.drop,
      }
      return next
    })

    // Auto-fill address from the clicked coordinate (do not overwrite if user already typed something).
    void (async () => {
      try {
        const address = await reverseGeocode(coord)
        setForm((prev) => {
          if (kind === "pickup") {
            if (prev.pickupAddress.trim()) return prev
            return { ...prev, pickupAddress: address }
          }
          if (prev.dropAddress.trim()) return prev
          return { ...prev, dropAddress: address }
        })
      } catch {
        // Best-effort: leave address as-is if reverse geocode fails
      }
    })()
  }

  const canSave = Boolean(
    form.title.trim() &&
      form.weightKg > 0 &&
      form.pickupAddress.trim() &&
      form.dropAddress.trim() &&
      form.pickup &&
      form.drop
  )

  function buildInput(): JobUpsertInput {
    if (!form.pickup || !form.drop) {
      throw new Error("Pickup and drop points are required")
    }

    return {
      title: form.title.trim(),
      weightKg: form.weightKg,
      pickupAddress: form.pickupAddress.trim(),
      pickupLng: form.pickup.lng,
      pickupLat: form.pickup.lat,
      dropAddress: form.dropAddress.trim(),
      dropLng: form.drop.lng,
      dropLat: form.drop.lat,
      pickupAt: dateTimeLocalToIso(form.pickupAtLocal),
      dropWindowStartAt: dateTimeLocalToIso(form.dropStartLocal),
      dropWindowEndAt: dateTimeLocalToIso(form.dropEndLocal),
      distanceMeters: form.distanceMeters,
    }
  }

  function handleSubmit() {
    startSaving(async () => {
      try {
        const input = buildInput()
        const saved =
          mode === "create"
            ? await createJob(input)
            : await updateJob(initialJob!.id, input)

        toast.success(mode === "create" ? "Job created" : "Job updated")
        router.push("/dashboard/jobs")
        router.refresh()
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to save job"
        toast.error(msg)
      }
    })
  }

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="outline" size="sm">
          <a href="/dashboard/jobs">
            <IconArrowLeft className="size-4" />
            Back to Jobs
          </a>
        </Button>
        <Button onClick={handleSubmit} disabled={!canSave || isSaving}>
          {isSaving ? <IconLoader2 className="size-4 animate-spin" /> : null}
          {mode === "create" ? "Create Job" : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="job-title">Title</Label>
          <Input
            id="job-title"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="e.g. Delhi → Jaipur"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="job-weight">Weight (kg)</Label>
          <Input
            id="job-weight"
            type="number"
            min={1}
            value={form.weightKg}
            onChange={(e) => setForm((p) => ({ ...p, weightKg: Number(e.target.value) }))}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="pickup-address">Pickup address</Label>
          <Input
            id="pickup-address"
            value={form.pickupAddress}
            onChange={(e) => setForm((p) => ({ ...p, pickupAddress: e.target.value }))}
            placeholder="Pickup address"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="drop-address">Drop address</Label>
          <Input
            id="drop-address"
            value={form.dropAddress}
            onChange={(e) => setForm((p) => ({ ...p, dropAddress: e.target.value }))}
            placeholder="Drop address"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="pickup-at">Pickup at</Label>
          <Input
            id="pickup-at"
            type="datetime-local"
            value={form.pickupAtLocal}
            onChange={(e) => setForm((p) => ({ ...p, pickupAtLocal: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="drop-start">Drop window start</Label>
          <Input
            id="drop-start"
            type="datetime-local"
            value={form.dropStartLocal}
            onChange={(e) => setForm((p) => ({ ...p, dropStartLocal: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="drop-end">Drop window end</Label>
          <Input
            id="drop-end"
            type="datetime-local"
            value={form.dropEndLocal}
            onChange={(e) => setForm((p) => ({ ...p, dropEndLocal: e.target.value }))}
          />
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <IconMapPin className="size-4" />
            <span className="text-sm font-medium">Map</span>
          </div>
          <ToggleGroup
            type="single"
            value={activePoint}
            onValueChange={(v) => setActivePoint((v as ActivePoint) || "auto")}
          >
            <ToggleGroupItem value="auto" aria-label="Auto">
              Auto
            </ToggleGroupItem>
            <ToggleGroupItem value="pickup" aria-label="Set pickup">
              Pickup
            </ToggleGroupItem>
            <ToggleGroupItem value="drop" aria-label="Set drop">
              Drop
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-5 items-center justify-center rounded-full border bg-white text-[11px] font-bold text-green-600">
                P
              </span>
              <span>Pickup</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex size-5 items-center justify-center rounded-full border bg-white text-[11px] font-bold text-red-600">
                D
              </span>
              <span>Drop</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-0.5 w-8 rounded bg-blue-600" />
              <span>Route</span>
            </div>
          </div>
          <div>
            {activePoint === "pickup"
              ? "Click map to set pickup"
              : activePoint === "drop"
                ? "Click map to set drop"
                : !form.pickup
                  ? "Click map to set pickup, then drop"
                  : "Click map to set drop"}
          </div>
        </div>

        <JobRouteMap
          pickup={form.pickup}
          drop={form.drop}
          routeGeoJson={route?.routeGeoJson ?? undefined}
          activePoint={activePoint}
          onPick={handlePick}
        />

        <div className="grid gap-3 md:grid-cols-3">
          <div className="flex flex-col gap-1">
            <div className="text-muted-foreground text-xs">Distance</div>
            <div className="flex items-center gap-2">
              <IconRoute className="size-4" />
              <div className="text-sm font-medium">
                {form.distanceMeters ? `${metersToKm(form.distanceMeters)} km` : "—"}
              </div>
              {isRouting ? <IconLoader2 className="size-4 animate-spin" /> : null}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-muted-foreground text-xs">Duration</div>
            <div className="text-sm font-medium">
              {route ? secondsToMinutes(route.durationSeconds) : "—"}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="distance-meters">Distance (meters)</Label>
            <Input
              id="distance-meters"
              type="number"
              min={0}
              value={form.distanceMeters}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  distanceMeters: Number(e.target.value),
                }))
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}


