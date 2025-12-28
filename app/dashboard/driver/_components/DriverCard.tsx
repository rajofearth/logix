"use client"

import { IconPhone, IconBriefcase, IconMapPin } from "@tabler/icons-react"

import type { DriverDTO } from "../_types"
import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const statusConfig = {
    available: {
        label: "Available",
        ringColor: "ring-emerald-500",
        badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        dotColor: "bg-emerald-500",
        nameHoverColor: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
    },
    "on-route": {
        label: "On Route",
        ringColor: "ring-primary",
        badgeClass: "bg-primary/10 text-primary",
        dotColor: "bg-primary",
        nameHoverColor: "group-hover:text-primary",
    },
    "off-duty": {
        label: "Off Duty",
        ringColor: "ring-muted-foreground/50",
        badgeClass: "bg-muted text-muted-foreground",
        dotColor: "bg-muted-foreground/50",
        nameHoverColor: "group-hover:text-muted-foreground",
    },
}

interface DriverCardProps {
    driver: DriverDTO
}

export function DriverCard({ driver }: DriverCardProps) {
    const status = statusConfig[driver.status]
    const hasActiveJob = driver.currentJob && driver.route

    return (
        <Card
            className={cn(
                "group relative overflow-hidden transition-all duration-300",
                "hover:shadow-lg hover:-translate-y-1 hover:border-primary/20",
                "cursor-pointer"
            )}
        >
            {/* Status indicator line */}
            <div
                className={cn(
                    "absolute top-0 left-0 right-0 h-0.5 transition-all duration-300",
                    status.dotColor,
                    "group-hover:h-1"
                )}
            />

            <CardContent className="pt-5 pb-4">
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
                            <AvatarImage src={driver.avatar} alt={driver.name} />
                            <AvatarFallback className="text-sm font-medium">
                                {getInitials(driver.name)}
                            </AvatarFallback>
                        </Avatar>
                        {/* Online indicator dot */}
                        <span
                            className={cn(
                                "absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background",
                                status.dotColor
                            )}
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className={cn(
                            "font-semibold text-sm truncate text-foreground transition-colors",
                            status.nameHoverColor
                        )}>
                            {driver.name}
                        </h3>
                        <Badge
                            variant="secondary"
                            className={cn("mt-1 text-[0.6rem] font-medium", status.badgeClass)}
                        >
                            {status.label}
                        </Badge>
                    </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <IconPhone className="size-3.5 shrink-0" />
                    <span className="text-xs">{driver.phone}</span>
                </div>

                {/* Job Section - always same height */}
                <div
                    className={cn(
                        "rounded-lg p-3 transition-colors",
                        hasActiveJob ? "bg-primary/5 border border-primary/10" : "bg-muted/30 border border-transparent"
                    )}
                >
                    <div className="space-y-2">
                        {/* Current Job */}
                        <div className="flex items-start gap-2">
                            <IconBriefcase className={cn(
                                "size-3.5 shrink-0 mt-0.5",
                                hasActiveJob ? "text-primary" : "text-muted-foreground/40"
                            )} />
                            <div className="flex-1 min-w-0">
                                <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                                    Current Job
                                </p>
                                <p className={cn(
                                    "text-xs truncate",
                                    hasActiveJob ? "font-medium text-foreground" : "text-muted-foreground/60 italic"
                                )}>
                                    {driver.currentJob || "No job assigned"}
                                </p>
                            </div>
                        </div>

                        {/* Route */}
                        <div className="flex items-start gap-2">
                            <IconMapPin className={cn(
                                "size-3.5 shrink-0 mt-0.5",
                                hasActiveJob ? "text-primary" : "text-muted-foreground/40"
                            )} />
                            <div className="flex-1 min-w-0">
                                <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                                    Route
                                </p>
                                {hasActiveJob && driver.route ? (
                                    <div className="flex items-center gap-1 text-xs text-foreground">
                                        <span className="truncate">{driver.route.origin}</span>
                                        <span className="text-primary font-medium shrink-0">→</span>
                                        <span className="truncate">{driver.route.destination}</span>
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground/60 italic">—</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
