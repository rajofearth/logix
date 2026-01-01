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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => {
                    const count = stats[option.key]
                    const isActive = activeFilter === option.value

                    return (
                        <Button
                            key={option.value}
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => onFilterChange(option.value)}
                            className={cn(
                                "gap-1.5",
                                isActive && "shadow-sm"
                            )}
                        >
                            {option.label}
                            <span
                                className={cn(
                                    "text-[0.65rem] px-1.5 py-0.5 rounded-full",
                                    isActive
                                        ? "bg-primary-foreground/20 text-primary-foreground"
                                        : "bg-muted text-muted-foreground"
                                )}
                            >
                                {count}
                            </span>
                        </Button>
                    )
                })}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                    placeholder="Search projects..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9"
                />
            </div>
        </div>
    )
}
