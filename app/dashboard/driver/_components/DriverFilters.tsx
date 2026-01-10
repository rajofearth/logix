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

            {/* Windows 7 Search box - from _searchbox.scss */}
            <div className="relative w-full sm:w-72">
                <input
                    type="search"
                    placeholder="Search drivers..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="win7-search"
                    style={{
                        font: 'var(--w7-font)',
                        fontSize: '9pt',
                        width: '100%',
                        height: '24px',
                        padding: '3px 28px 3px 8px',
                        border: '1px solid transparent',
                        borderRadius: '2px',
                        background: '#fff',
                        color: '#000',
                        boxShadow: 'inset 1px 1px 0 #8e8f8f, inset -1px -1px 0 #ccc',
                        outline: 'none',
                        minWidth: '180px',
                    }}
                    onFocus={(e) => {
                        e.currentTarget.style.boxShadow = 'inset 1px 1px 0 #3d7bad, inset -1px -1px 0 #a5d1e9'
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.boxShadow = 'inset 1px 1px 0 #8e8f8f, inset -1px -1px 0 #ccc'
                    }}
                />
                <IconSearch
                    className="absolute right-2 top-1/2 -translate-y-1/2 size-3.5 pointer-events-none"
                    style={{ color: '#666' }}
                />
            </div>
        </div>
    )
}
