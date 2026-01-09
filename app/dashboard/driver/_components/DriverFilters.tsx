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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            {/* Windows 7 Tab styling */}
            <div
                className="flex"
                style={{
                    borderBottom: '1px solid var(--w7-el-bd)',
                    paddingBottom: '0',
                }}
            >
                {filters.map((filter) => (
                    <button
                        key={filter.key}
                        onClick={() => onFilterChange(filter.key)}
                        className={cn(
                            "relative px-3 py-1.5 text-xs font-medium select-none transition-colors",
                            "-mb-[1px] border rounded-t-[3px]",
                            activeFilter === filter.key
                                ? "bg-white border-[var(--w7-el-bd)] border-b-white z-10"
                                : "bg-[var(--w7-el-grad)] border-transparent hover:bg-[#e5e5e5] text-[#555]"
                        )}
                        style={{
                            font: 'var(--w7-font)',
                            minWidth: '70px',
                        }}
                    >
                        {filter.label} ({stats[filter.statKey]})
                    </button>
                ))}
            </div>

            {/* Windows 7 Search box */}
            <div className="relative w-full sm:w-72">
                <IconSearch
                    className="absolute left-2 top-1/2 -translate-y-1/2 size-4 pointer-events-none"
                    style={{ color: '#666' }}
                />
                <input
                    type="search"
                    placeholder="Search drivers..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    style={{
                        font: 'var(--w7-font)',
                        fontSize: '9pt',
                        width: '100%',
                        height: '23px',
                        paddingLeft: '28px',
                        paddingRight: '8px',
                        border: '1px solid #abadb3',
                        borderRadius: '2px',
                        background: '#fff',
                        color: '#000',
                        outline: 'none',
                    }}
                    onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#3d7bad'
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#abadb3'
                    }}
                />
            </div>
        </div>
    )
}
