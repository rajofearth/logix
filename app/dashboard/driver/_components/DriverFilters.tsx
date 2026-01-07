"use client"

import { IconSearch } from "@tabler/icons-react"
import type { DriverStatus } from "../_types"
import type { DriverStats } from "../_server/driverActions"
import { cn } from "@/lib/utils"

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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Filter Tabs using Win7 Tab styling */}
            <div role="tablist" style={{ display: 'flex' }}>
                {filters.map((filter) => (
                    <button
                        role="tab"
                        aria-selected={activeFilter === filter.key}
                        key={filter.key}
                        onClick={() => onFilterChange(filter.key)}
                        className={cn(
                            "px-3 py-1 text-xs select-none focus:outline-none -mb-[1px] border border-b-0 rounded-t-[3px]",
                            activeFilter === filter.key
                                ? "bg-white border-[#898c95] z-10" // Active tab
                                : "bg-[#f0f0f0] border-transparent text-gray-500 hover:text-black mt-[2px]" // Inactive tab
                        )}
                        style={{
                            minWidth: 80,
                            position: 'relative'
                        }}
                    >
                        {filter.label} ({stats[filter.statKey]})
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 pointer-events-none" />
                <input
                    type="search"
                    placeholder="Search drivers..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9 pr-2 h-8 w-full border border-[#8e8f8f] text-sm focus:border-blue-500 outline-none"
                    style={{
                        background: '#fff',
                        borderRadius: 0,
                        boxShadow: 'inset 0 0 0 1px #fff', // mimic bevel highlight
                    }}
                />
            </div>
        </div>
    )
}
