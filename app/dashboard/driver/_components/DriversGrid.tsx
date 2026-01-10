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
        // Windows 7 style skeleton loading
        return (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            height: '180px',
                            background: 'linear-gradient(#fff 45%, #f0f0f0 45%, #e0e0e0)',
                            border: '1px solid #c0c1cd',
                            borderRadius: 'var(--w7-el-bdr)',
                        }}
                        className="animate-pulse"
                    />
                ))}
            </div>
        )
    }

    if (drivers.length === 0 && !isLoading) {
        // Windows 7 style empty state
        return (
            <div
                className="flex flex-col items-center justify-center py-12 text-center"
                style={{ color: '#000' }}
            >
                <div
                    className="size-16 flex items-center justify-center mb-4"
                    style={{
                        background: 'linear-gradient(#fff 45%, #f0f0f0 45%, #e0e0e0)',
                        border: '1px solid #c0c1cd',
                        borderRadius: 'var(--w7-el-bdr)',
                    }}
                >
                    <IconUserOff className="size-8" style={{ color: '#666' }} />
                </div>
                <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#000', marginBottom: '4px' }}>
                    No drivers found
                </h3>
                <p style={{ fontSize: '11px', color: '#666', maxWidth: '280px' }}>
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
