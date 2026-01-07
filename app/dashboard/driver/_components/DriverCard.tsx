"use client"

import { IconPhone, IconBriefcase, IconMapPin } from "@tabler/icons-react"

import type { DriverDTO } from "../_types"
import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/utils"
// import { Card, CardContent } from "@/components/ui/card" // REMOVED
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
// import { Badge } from "@/components/ui/badge" // REMOVED

const statusConfig = {
    available: {
        label: "Available",
        ringColor: "ring-emerald-500",
        badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
        dotColor: "bg-emerald-500",
        nameHoverColor: "group-hover:text-blue-600",
    },
    "on-route": {
        label: "On Route",
        ringColor: "ring-blue-500",
        badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
        dotColor: "bg-blue-500",
        nameHoverColor: "group-hover:text-blue-600",
    },
    "off-duty": {
        label: "Off Duty",
        ringColor: "ring-gray-400",
        badgeClass: "bg-gray-100 text-gray-800 border-gray-200",
        dotColor: "bg-gray-400",
        nameHoverColor: "group-hover:text-gray-600",
    },
}

interface DriverCardProps {
    driver: DriverDTO
    onClick?: () => void
}

export function DriverCard({ driver, onClick }: DriverCardProps) {
    const status = statusConfig[driver.status]
    const hasActiveJob = driver.currentJob && driver.route

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative overflow-hidden transition-all duration-300",
                "bg-white border border-[#707070] shadow-sm", // Win7 base border
                "hover:shadow-md hover:border-[#3399ff] cursor-pointer", // Win7 hover effect
                "p-4 rounded-sm" // Minimal rounding for Win7 look
            )}
        >
            {/* Status indicator line - simplified */}
            <div
                className={cn(
                    "absolute top-0 left-0 bottom-0 w-1 transition-all duration-300",
                    status.dotColor
                )}
            />

            <div className="pl-3">
                {/* Header: Avatar + Name/Status */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                        <Avatar
                            size="lg"
                            className={cn(
                                "ring-2 ring-offset-2 ring-offset-background transition-transform duration-300",
                                "group-hover:scale-105",
                                status.ringColor
                            )}
                        >
                            <AvatarImage src={driver.avatar ?? undefined} alt={driver.name} />
                            <AvatarFallback className="text-sm font-medium">
                                {getInitials(driver.name)}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className={cn(
                            "font-bold text-sm truncate text-[#1e1e1e] transition-colors",
                            status.nameHoverColor
                        )}>
                            {driver.name}
                        </h3>
                        <span className={cn(
                            "inline-block mt-1 px-2 py-0.5 text-[0.65rem] font-bold uppercase rounded border",
                            status.badgeClass
                        )}>
                            {status.label}
                        </span>
                    </div>
                </div>

                {/* Phone */}
                {driver.phone && (
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <IconPhone className="size-3.5 shrink-0" />
                        <span className="text-xs font-sans">{driver.phone}</span>
                    </div>
                )}

                {/* Job Section - Win7 "inset" look */}
                <div
                    className={cn(
                        "rounded px-2 py-2 transition-colors border",
                        hasActiveJob
                            ? "bg-[#eef3fa] border-[#abc0e4]"
                            : "bg-[#f5f5f5] border-[#e0e0e0]"
                    )}
                >
                    <div className="space-y-2">
                        {/* Current Job */}
                        <div className="flex items-start gap-2">
                            <IconBriefcase className={cn(
                                "size-3.5 shrink-0 mt-0.5",
                                hasActiveJob ? "text-[#0066cc]" : "text-gray-400"
                            )} />
                            <div className="flex-1 min-w-0">
                                <p className="text-[0.65rem] uppercase tracking-wide text-gray-500 font-bold mb-0.5">
                                    Current Job
                                </p>
                                <p className={cn(
                                    "text-xs truncate",
                                    hasActiveJob ? "font-medium text-[#333]" : "text-gray-400 italic"
                                )}>
                                    {driver.currentJob || "No job assigned"}
                                </p>
                            </div>
                        </div>

                        {/* Route */}
                        <div className="flex items-start gap-2">
                            <IconMapPin className={cn(
                                "size-3.5 shrink-0 mt-0.5",
                                hasActiveJob ? "text-[#0066cc]" : "text-gray-400"
                            )} />
                            <div className="flex-1 min-w-0">
                                <p className="text-[0.65rem] uppercase tracking-wide text-gray-500 font-bold mb-0.5">
                                    Route
                                </p>
                                {hasActiveJob && driver.route ? (
                                    <div className="flex items-center gap-1 text-xs text-[#333]">
                                        <span className="truncate">{driver.route.origin}</span>
                                        <span className="text-gray-400 font-medium shrink-0">→</span>
                                        <span className="truncate">{driver.route.destination}</span>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 italic">—</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
