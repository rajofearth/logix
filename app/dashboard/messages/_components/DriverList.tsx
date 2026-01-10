"use client"

import * as React from "react"
import { IconSearch } from "@tabler/icons-react"

import type { DriverDTO } from "@/app/dashboard/driver/_types"
import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

const statusConfig = {
    available: { label: "Online", color: "#5cb85c" }, // Green
    "on-route": { label: "On Route", color: "#5bc0de" }, // Blue
    "off-duty": { label: "Offline", color: "#999" }, // Gray
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
            const matchesSearch = driver.name.toLowerCase().includes(search.toLowerCase())
            const matchesFilter = filter === "all" || driver.status !== "off-duty"
            return matchesSearch && matchesFilter
        })
    }, [drivers, search, filter])

    return (
        <div className="flex h-full flex-col font-['Segoe_UI'] bg-white">
            {/* Toolbar Area */}
            <div className="p-2 bg-[#f0f0f0] border-b border-[#a0a0a0] flex flex-col gap-2">
                {/* Win7 Search */}
                <div className="relative w-full">
                    <input
                        placeholder="Search contacts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-2 pr-7 h-6 w-full border border-[#7f9db9] text-xs outline-none focus:border-[#3c7fb1] italic placeholder:text-gray-400"
                        style={{ background: '#fff', borderRadius: '2px' }}
                    />
                    <div className="absolute right-[1px] top-[1px] bottom-[1px] w-[22px] flex items-center justify-center bg-gradient-to-b from-[#f2f2f2] to-[#cfcfcf] border-l border-[#7f9db9] pointer-events-none">
                        <IconSearch className="size-3 text-gray-500" />
                    </div>
                </div>

                {/* Filter Tabs (Simulated as Link Buttons) */}
                <div className="flex gap-1 text-[11px]">
                    <button
                        onClick={() => setFilter("open")}
                        className={cn("px-2 py-0.5 rounded border transition-colors", filter === "open" ? "bg-[#e5f4fc] border-[#3c7fb1] text-[#1e5774]" : "border-transparent text-gray-600 hover:bg-[#eaf6fd] hover:border-[#b8d6fb]")}
                    >
                        Online
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                        onClick={() => setFilter("all")}
                        className={cn("px-2 py-0.5 rounded border transition-colors", filter === "all" ? "bg-[#e5f4fc] border-[#3c7fb1] text-[#1e5774]" : "border-transparent text-gray-600 hover:bg-[#eaf6fd] hover:border-[#b8d6fb]")}
                    >
                        All Contacts
                    </button>
                </div>
            </div>

            {/* ListView */}
            <ScrollArea className="flex-1">
                <div className="p-1 space-y-[1px]">
                    {isLoading ? (
                        <div className="p-4 text-xs text-gray-500 text-center">Loading contacts...</div>
                    ) : filteredDrivers.length === 0 ? (
                        <div className="py-8 text-center text-xs text-gray-500">
                            No drivers found
                        </div>
                    ) : (
                        filteredDrivers.map((driver) => {
                            const status = statusConfig[driver.status]
                            const isSelected = driver.id === selectedDriverId

                            return (
                                <div
                                    key={driver.id}
                                    onClick={() => onDriverSelect(driver)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault()
                                            onDriverSelect(driver)
                                        }
                                    }}
                                    className={cn(
                                        "group flex items-center gap-2 p-1 px-2 cursor-pointer border border-transparent rounded-[2px] outline-none focus:ring-1 focus:ring-[#3c7fb1]",
                                        isSelected
                                            ? "bg-[#cce8ff] border-[#99d1ff]"
                                            : "hover:bg-[#e5f3fb] hover:border-[#d9ebf9]"
                                    )}
                                >
                                    {/* Win7 Avatar Frame */}
                                    <div className="relative shrink-0">
                                        <div className="size-8 bg-white border border-[#a9b2bd] p-[1px] shadow-sm rounded-sm">
                                            <Avatar className="size-full rounded-sm">
                                                <AvatarImage src={driver.avatar ?? undefined} alt={driver.name} />
                                                <AvatarFallback className="rounded-sm text-[10px] bg-[#e1e1e1] text-[#555]">{getInitials(driver.name)}</AvatarFallback>
                                            </Avatar>
                                        </div>
                                        {/* Status Dot */}
                                        <div
                                            className="absolute -bottom-0.5 -right-0.5 size-2.5 border-2 border-white rounded-full shadow-sm"
                                            style={{ backgroundColor: status.color }}
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-[#1e5774] truncate group-hover:text-black">
                                            {driver.name}
                                        </p>
                                        <p className="text-[10px] text-gray-500 truncate">
                                            {driver.route
                                                ? `${driver.route.origin} → ${driver.route.destination}`
                                                : <span className="italic opacity-80">{status.label}</span>}
                                        </p>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
