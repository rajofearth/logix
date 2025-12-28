"use client"

import { IconUserOff } from "@tabler/icons-react"

import type { DriverDTO } from "../_types"
import { DriverCard } from "./DriverCard"

interface DriversGridProps {
    drivers: DriverDTO[]
    isLoading?: boolean
}

export function DriversGrid({ drivers, isLoading }: DriversGridProps) {
    if (isLoading) {
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

    if (drivers.length === 0) {
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {drivers.map((driver) => (
                <DriverCard key={driver.id} driver={driver} />
            ))}
        </div>
    )
}
