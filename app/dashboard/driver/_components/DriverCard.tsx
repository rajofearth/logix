"use client"

import { IconPhone, IconBriefcase, IconMapPin } from "@tabler/icons-react"

import type { DriverDTO } from "../_types"
import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

const statusConfig = {
    available: {
        label: "Available",
        dotClass: "bg-[#5cb85c]",
        badgeClass: "bg-[#dff0d8] text-[#3c763d] border-[#d6e9c6]",
    },
    "on-route": {
        label: "On Route",
        dotClass: "bg-[#5bc0de]",
        badgeClass: "bg-[#d9edf7] text-[#31708f] border-[#bce8f1]",
    },
    "off-duty": {
        label: "Off Duty",
        dotClass: "bg-[#999]",
        badgeClass: "bg-[#f5f5f5] text-[#777] border-[#ddd]",
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
                // Use win7-aero-card class for glass border effect
                "win7-aero-card",
                "group cursor-pointer",
                "hover:shadow-[2px_2px_12px_2px_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(255,255,255,0.9)]"
            )}
        >
            {/* Aero header - blue glass bar */}
            <div className="win7-aero-card-header">
                {/* Avatar */}
                <Avatar size="lg" className="border border-[rgba(0,0,0,0.5)] shadow-sm">
                    <AvatarImage src={driver.avatar ?? undefined} alt={driver.name} />
                    <AvatarFallback className="bg-[var(--w7-el-grad)] text-[#333]">
                        {getInitials(driver.name)}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0 ml-3">
                    <h3 className="font-semibold text-[11px] truncate">
                        {driver.name}
                    </h3>
                    {/* Status badge */}
                    <span className={cn(
                        "inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold uppercase rounded-[var(--w7-el-bdr)] border",
                        status.badgeClass
                    )}>
                        {status.label}
                    </span>
                </div>
            </div>

            {/* Aero body - content area */}
            <div className="win7-aero-card-body">
                {/* Phone */}
                {driver.phone && (
                    <div className="flex items-center gap-2 mb-3 text-[11px] text-[var(--w7-el-c)]">
                        <IconPhone className="size-3.5 shrink-0 text-[var(--w7-el-c-d)]" />
                        <span>{driver.phone}</span>
                    </div>
                )}

                {/* Job Section - fieldset from _groupbox.scss */}
                <fieldset className="border border-[#cdd7db] rounded-[var(--w7-el-bdr)] p-2 m-0 shadow-[inset_0_0_0_1px_#fff]">
                    <div className="space-y-2">
                        {/* Current Job */}
                        <div className="flex items-start gap-2">
                            <IconBriefcase
                                className={cn(
                                    "size-3.5 shrink-0 mt-0.5",
                                    hasActiveJob ? "text-[var(--w7-link-c)]" : "text-[var(--w7-el-c-d)]"
                                )}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] text-[var(--w7-el-c-d)] font-semibold uppercase mb-0.5">
                                    Current Job
                                </p>
                                <p className={cn(
                                    "text-[11px]",
                                    hasActiveJob ? "text-[var(--w7-el-c)]" : "text-[var(--w7-el-c-d)] italic"
                                )}>
                                    {driver.currentJob || "No job assigned"}
                                </p>
                            </div>
                        </div>

                        {/* Route */}
                        <div className="flex items-start gap-2">
                            <IconMapPin
                                className={cn(
                                    "size-3.5 shrink-0 mt-0.5",
                                    hasActiveJob ? "text-[var(--w7-link-c)]" : "text-[var(--w7-el-c-d)]"
                                )}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] text-[var(--w7-el-c-d)] font-semibold uppercase mb-0.5">
                                    Route
                                </p>
                                {hasActiveJob && driver.route ? (
                                    <div className="flex items-center gap-1 text-[11px] text-[var(--w7-el-c)]">
                                        <span className="truncate">{driver.route.origin}</span>
                                        <span className="text-[var(--w7-el-c-d)]">→</span>
                                        <span className="truncate">{driver.route.destination}</span>
                                    </div>
                                ) : (
                                    <p className="text-[11px] text-[var(--w7-el-c-d)] italic">—</p>
                                )}
                            </div>
                        </div>
                    </div>
                </fieldset>
            </div>
        </div>
    )
}
