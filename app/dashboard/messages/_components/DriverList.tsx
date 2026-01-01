"use client"

import * as React from "react"
import { IconSearch, IconFilter } from "@tabler/icons-react"

import type { DriverDTO } from "@/app/dashboard/driver/_types"
import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const statusConfig = {
    available: {
        label: "Online",
        dotColor: "bg-emerald-500",
    },
    "on-route": {
        label: "On Route",
        dotColor: "bg-primary",
    },
    "off-duty": {
        label: "Offline",
        dotColor: "bg-muted-foreground/50",
    },
}

interface DriverListProps {
    drivers: DriverDTO[]
    selectedDriverId: string | null
    onDriverSelect: (driver: DriverDTO) => void
    isLoading?: boolean
}

export function DriverList({
    drivers,
    selectedDriverId,
    onDriverSelect,
    isLoading,
}: DriverListProps) {
    const [search, setSearch] = React.useState("")
    const [filter, setFilter] = React.useState<"open" | "all">("open")

    const filteredDrivers = React.useMemo(() => {
        return drivers.filter((driver) => {
            const matchesSearch = driver.name
                .toLowerCase()
                .includes(search.toLowerCase())
            const matchesFilter =
                filter === "all" || driver.status !== "off-duty"
            return matchesSearch && matchesFilter
        })
    }, [drivers, search, filter])

    return (
        <div className="flex h-full flex-col border-r border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {/* Header */}
            <div className="border-b border-border p-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-foreground">Drivers</h2>
                    <Button variant="ghost" size="icon-sm">
                        <IconFilter className="size-4" />
                    </Button>
                </div>

                {/* Search */}
                <div className="relative">
                    <IconSearch className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search drivers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="mt-3 flex gap-2">
                    <Badge
                        variant={filter === "open" ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setFilter("open")}
                    >
                        Active
                    </Badge>
                    <Badge
                        variant={filter === "all" ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setFilter("all")}
                    >
                        All
                    </Badge>
                </div>
            </div>

            {/* Driver List */}
            <ScrollArea className="flex-1">
                <div className="p-2">
                    {isLoading ? (
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-16 animate-pulse rounded-lg bg-muted"
                                />
                            ))}
                        </div>
                    ) : filteredDrivers.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            No drivers found
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredDrivers.map((driver) => {
                                const status = statusConfig[driver.status]
                                const isSelected = driver.id === selectedDriverId

                                return (
                                    <button
                                        key={driver.id}
                                        onClick={() => onDriverSelect(driver)}
                                        className={cn(
                                            "w-full rounded-lg p-3 text-left transition-colors",
                                            "hover:bg-muted/50",
                                            isSelected && "bg-primary/10 border border-primary/20"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <Avatar size="default">
                                                    <AvatarImage
                                                        src={driver.avatar ?? undefined}
                                                        alt={driver.name}
                                                    />
                                                    <AvatarFallback className="text-xs">
                                                        {getInitials(driver.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span
                                                    className={cn(
                                                        "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background",
                                                        status.dotColor
                                                    )}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">
                                                    {driver.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {driver.route
                                                        ? `${driver.route.origin} → ${driver.route.destination}`
                                                        : "No active route"}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
