"use client"

import { IconSearch } from "@tabler/icons-react"

import type { ProjectStatus, ProjectStats } from "../_types"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ProjectFiltersProps {
    stats: ProjectStats
    activeFilter: ProjectStatus | "all"
    onFilterChange: (filter: ProjectStatus | "all") => void
    search: string
    onSearchChange: (value: string) => void
}

const filterOptions: { value: ProjectStatus | "all"; label: string; key: keyof ProjectStats }[] = [
    { value: "all", label: "All", key: "all" },
    { value: "active", label: "Active", key: "active" },
    { value: "completed", label: "Completed", key: "completed" },
    { value: "on-hold", label: "On Hold", key: "onHold" },
    { value: "pending", label: "Pending", key: "pending" },
]

export function ProjectFilters({
    stats,
    activeFilter,
    onFilterChange,
    search,
    onSearchChange,
}: ProjectFiltersProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between font-['Segoe_UI']">
            {/* Filter Tabs - Win7 Button Style */}
            <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => {
                    const count = stats[option.key]
                    const isActive = activeFilter === option.value

                    return (
                        <button
                            key={option.value}
                            onClick={() => onFilterChange(option.value)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1 text-xs border rounded-[3px] transition-colors outline-none",
                                isActive
                                    ? "bg-[#e5f4fc] border-[#3c7fb1] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.5)]"
                                    : "bg-gradient-to-b from-[#f2f2f2] to-[#cfcfcf] border-[#707070] hover:border-[#3c7fb1] hover:from-[#eaf6fd] hover:to-[#a7d9f5]"
                            )}
                        >
                            <span className="text-[#1e5774]">{option.label}</span>
                            <span
                                className={cn(
                                    "text-[10px] px-1 rounded-sm border",
                                    isActive
                                        ? "bg-white/50 border-[#3c7fb1]/30 text-[#1e5774]"
                                        : "bg-white/30 border-[#000]/10 text-gray-600"
                                )}
                            >
                                {count}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Win7 Search */}
            <div className="relative w-full sm:w-64">
                <input
                    placeholder="Search projects..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-2 pr-7 h-7 w-full border border-[#7f9db9] text-xs outline-none focus:border-[#3c7fb1] italic placeholder:text-gray-400"
                    style={{
                        background: '#fff',
                        borderRadius: '2px'
                    }}
                />
                <div className="absolute right-[1px] top-[1px] bottom-[1px] w-[26px] flex items-center justify-center bg-gradient-to-b from-[#f2f2f2] to-[#cfcfcf] border-l border-[#7f9db9] pointer-events-none">
                    <IconSearch className="size-3.5 text-gray-500" />
                </div>
            </div>
        </div>
    )
}
