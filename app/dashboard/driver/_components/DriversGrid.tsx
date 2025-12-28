"use client"

import * as React from "react"
import { IconUserOff } from "@tabler/icons-react"

import type { DriverDTO } from "../_types"
import { cn } from "@/lib/utils"
import { DriverCard } from "./DriverCard"

interface DriversGridProps {
    drivers: DriverDTO[]
    isLoading?: boolean
    onDriverClick?: (driver: DriverDTO) => void
}

export function DriversGrid({ drivers, isLoading, onDriverClick }: DriversGridProps) {
    // Track if this is the initial load (no drivers yet)
    const isInitialLoad = isLoading && drivers.length === 0

    if (isInitialLoad) {
        // Only show skeleton on very first load
        return (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-52 rounded-xl bg-muted/50 animate-pulse"
                    />
                ))}
            </div>
        )
    }

    if (drivers.length === 0 && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="size-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                    <IconUserOff className="size-8 text-muted-foreground/50" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">No drivers found</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                    Try adjusting your filters or search query to find drivers.
                </p>
            </div>
        )
    }

    return (
        <div
            className={cn(
                "grid gap-4 sm:grid-cols-2 xl:grid-cols-3 transition-opacity duration-300",
                isLoading ? "opacity-50 pointer-events-none" : "opacity-100"
            )}
        >
            {drivers.map((driver, index) => (
                <div
                    key={driver.id}
                    className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 fill-mode-both"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <DriverCard
                        driver={driver}
                        onClick={() => onDriverClick?.(driver)}
                    />
                </div>
            ))}
        </div>
    )
}
