"use client"

import { IconSearch, IconUsers } from "@tabler/icons-react"

import type { DriverStatus } from "../_types"
import type { DriverStats } from "../_server/driverActions"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface DriverFiltersProps {
    stats: DriverStats
    activeFilter: DriverStatus | "all"
    onFilterChange: (filter: DriverStatus | "all") => void
    search: string
    onSearchChange: (value: string) => void
}

const filters: { key: DriverStatus | "all"; label: string; statKey: keyof DriverStats }[] = [
    { key: "all", label: "All", statKey: "all" },
    { key: "available", label: "Available", statKey: "available" },
    { key: "on-route", label: "On Route", statKey: "onRoute" },
    { key: "off-duty", label: "Off Duty", statKey: "offDuty" },
]

export function DriverFilters({
    stats,
    activeFilter,
    onFilterChange,
    search,
    onSearchChange,
}: DriverFiltersProps) {
    return (
        <div className="flex flex-col gap-4">
            {/* Header with title and search */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <IconUsers className="size-4 text-primary" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-foreground">Driver Management</h2>
                        <p className="text-xs text-muted-foreground">{stats.all} total drivers</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-72">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                        type="search"
                        placeholder="Search by name, phone, or job..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 h-9"
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl w-fit">
                {filters.map((filter) => (
                    <button
                        key={filter.key}
                        onClick={() => onFilterChange(filter.key)}
                        className={cn(
                            "px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200",
                            "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                            activeFilter === filter.key
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-background/50"
                        )}
                    >
                        {filter.label}
                        <span
                            className={cn(
                                "ml-2 px-2 py-0.5 text-[0.65rem] font-semibold rounded-full transition-colors",
                                activeFilter === filter.key
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted-foreground/15 text-muted-foreground"
                            )}
                        >
                            {stats[filter.statKey]}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    )
}
