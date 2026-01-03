"use client"

import { IconBolt, IconClock, IconGasStation, IconLeaf, IconRoute } from "@tabler/icons-react"
import type { RouteOption, RouteType } from "../_types"

const ROUTE_CONFIG: Record<
    RouteType,
    { label: string; icon: React.ReactNode; color: string; bgColor: string }
> = {
    fastest: {
        label: "Fastest",
        icon: <IconBolt className="size-4" />,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
    },
    economy: {
        label: "Economy",
        icon: <IconLeaf className="size-4" />,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
    },
    via_gas_station: {
        label: "Via Gas Station",
        icon: <IconGasStation className="size-4" />,
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
    },
}

function metersToKm(meters: number): string {
    return (meters / 1000).toFixed(1)
}

function secondsToMinutes(seconds: number): number {
    return Math.round(seconds / 60)
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

interface RouteOptionCardProps {
    route: RouteOption
    isSelected: boolean
    onSelect: (type: RouteType) => void
}

export function RouteOptionCard({ route, isSelected, onSelect }: RouteOptionCardProps) {
    const config = ROUTE_CONFIG[route.type]

    return (
        <button
            type="button"
            onClick={() => onSelect(route.type)}
            className={`
        flex flex-col gap-1 rounded-lg border p-3 text-left transition-all
        ${isSelected
                    ? `${config.bgColor} border-current ${config.color} ring-2 ring-current/20`
                    : "border-border bg-background/80 hover:bg-muted/50"
                }
        backdrop-blur-sm
      `}
        >
            <div className="flex items-center justify-between gap-2">
                <div className={`flex items-center gap-1.5 font-medium ${config.color}`}>
                    {config.icon}
                    <span className="text-sm">{config.label}</span>
                </div>
                {isSelected && (
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wide">
                        Selected
                    </span>
                )}
            </div>

            <div className="text-muted-foreground mt-1 grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1">
                    <IconRoute className="size-3" />
                    <span>{metersToKm(route.distanceMeters)} km</span>
                </div>
                <div className="flex items-center gap-1">
                    <IconClock className="size-3" />
                    <span>{secondsToMinutes(route.durationSeconds)} min</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-[10px]">₹</span>
                    <span>{formatCurrency(route.estimatedFuelCost).replace("₹", "")}</span>
                </div>
            </div>

            {route.viaPoi && (
                <div className="text-muted-foreground mt-1 flex items-center gap-1 text-[11px]">
                    <IconGasStation className="size-3 text-orange-500" />
                    <span className="truncate">{route.viaPoi.name}</span>
                </div>
            )}
        </button>
    )
}

interface RouteOptionsPanelProps {
    routes: RouteOption[]
    selectedType: RouteType
    onSelect: (type: RouteType) => void
    isLoading?: boolean
}

export function RouteOptionsPanel({
    routes,
    selectedType,
    onSelect,
    isLoading,
}: RouteOptionsPanelProps) {
    if (isLoading) {
        return (
            <div className="absolute right-3 top-3 z-10 w-56">
                <div className="animate-pulse space-y-2 rounded-lg border bg-background/90 p-3 backdrop-blur-sm">
                    <div className="h-4 w-24 rounded bg-muted" />
                    <div className="h-3 w-full rounded bg-muted" />
                    <div className="h-3 w-20 rounded bg-muted" />
                </div>
            </div>
        )
    }

    if (!routes.length) {
        return null
    }

    return (
        <div className="absolute right-3 top-3 z-10 flex w-56 flex-col gap-2">
            {routes.map((route) => (
                <RouteOptionCard
                    key={route.type}
                    route={route}
                    isSelected={route.type === selectedType}
                    onSelect={onSelect}
                />
            ))}
        </div>
    )
}
