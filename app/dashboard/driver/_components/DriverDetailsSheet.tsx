"use client"

import * as React from "react"
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    XAxis,
    YAxis,
} from "recharts"
import {
    IconMapPin,
    IconTruck,
    IconClock,
    IconPackage,
    IconChartLine,
} from "@tabler/icons-react"

import type { DriverDTO } from "../_types"
import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/utils"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Mock shipment data for area chart
const shipmentData = [
    { month: "Jan", deliveries: 65, target: 80 },
    { month: "Feb", deliveries: 78, target: 80 },
    { month: "Mar", deliveries: 52, target: 80 },
    { month: "Apr", deliveries: 91, target: 80 },
    { month: "May", deliveries: 86, target: 80 },
    { month: "Jun", deliveries: 73, target: 80 },
    { month: "Jul", deliveries: 98, target: 80 },
    { month: "Aug", deliveries: 88, target: 80 },
    { month: "Sep", deliveries: 79, target: 80 },
    { month: "Oct", deliveries: 95, target: 80 },
    { month: "Nov", deliveries: 82, target: 80 },
    { month: "Dec", deliveries: 89, target: 80 },
]

// Mock delay reasons data for pie chart
const delayReasonsData = [
    { reason: "Misrouted Shipment", count: 18, fill: "var(--color-misrouted)" },
    { reason: "Vehicle Breakdown", count: 8, fill: "var(--color-breakdown)" },
    { reason: "Accident or Collision", count: 6, fill: "var(--color-accident)" },
    { reason: "Others", count: 8, fill: "var(--color-others)" },
]

const shipmentChartConfig = {
    deliveries: {
        label: "Deliveries",
        color: "oklch(0.646 0.222 41.116)", // primary orange
    },
    target: {
        label: "Target",
        color: "oklch(0.7 0.015 286.067)", // muted
    },
} satisfies ChartConfig

const delayChartConfig = {
    misrouted: {
        label: "Misrouted Shipment",
        color: "oklch(0.646 0.222 41.116)", // primary
    },
    breakdown: {
        label: "Vehicle Breakdown",
        color: "oklch(0.7 0.015 286.067)", // gray
    },
    accident: {
        label: "Accident or Collision",
        color: "oklch(0.47 0.157 37.304)", // dark orange
    },
    others: {
        label: "Others",
        color: "oklch(0.553 0.195 38.402)", // medium orange
    },
} satisfies ChartConfig

const statusConfig = {
    available: {
        label: "Available",
        ringColor: "ring-emerald-500",
        badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        progressColor: "bg-emerald-500",
    },
    "on-route": {
        label: "On Route",
        ringColor: "ring-primary",
        badgeClass: "bg-primary/10 text-primary",
        progressColor: "bg-primary",
    },
    "off-duty": {
        label: "Off Duty",
        ringColor: "ring-muted-foreground/50",
        badgeClass: "bg-muted text-muted-foreground",
        progressColor: "bg-muted-foreground/50",
    },
}

interface DriverDetailsSheetProps {
    driver: DriverDTO | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function DriverDetailsSheet({
    driver,
    open,
    onOpenChange,
}: DriverDetailsSheetProps) {
    if (!driver) return null

    const status = statusConfig[driver.status]

    // Mock stats
    const stats = {
        totalDeliveries: 980,
        onTimeRate: 93,
        totalDelays: 40,
        progress: 63,
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader className="pb-4">
                    {/* Driver Avatar, Name and Status */}
                    <div className="flex items-center gap-4">
                        <Avatar
                            size="lg"
                            className={cn("ring-2 ring-offset-2 ring-offset-background", status.ringColor)}
                        >
                            <AvatarImage src={driver.avatar ?? undefined} alt={driver.name} />
                            <AvatarFallback>{getInitials(driver.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <SheetTitle className="text-base">{driver.name}</SheetTitle>
                                <Badge
                                    variant="secondary"
                                    className={cn("text-[0.6rem]", status.badgeClass)}
                                >
                                    {status.label}
                                </Badge>
                            </div>
                            <SheetDescription>Driver</SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="space-y-4 px-6 pb-6">
                    {/* Active Job Card */}
                    {driver.currentJob && (
                        <Card className="overflow-hidden">
                            {/* Card Header with job title and status */}
                            <CardHeader className="pb-3 border-b border-border/50">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <IconTruck className="size-4 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm">{driver.currentJob}</CardTitle>
                                            <p className="text-[0.65rem] text-muted-foreground mt-0.5">Active Delivery</p>
                                        </div>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className={cn("text-[0.6rem]", status.badgeClass)}
                                    >
                                        {status.label}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-4">
                                {/* Route Progress Section */}
                                <div className="space-y-4">
                                    {/* Progress indicator */}
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Route Progress</span>
                                        <span className="font-semibold text-primary">{stats.progress}%</span>
                                    </div>

                                    {/* Progress bar with truck */}
                                    <div className="relative py-3">
                                        {/* Base line */}
                                        <div className="h-1 w-full bg-muted rounded-full" />

                                        {/* Filled progress line */}
                                        <div
                                            className="absolute top-3 left-0 h-1 rounded-full bg-primary transition-all duration-500"
                                            style={{ width: `${stats.progress}%` }}
                                        />

                                        {/* Origin dot */}
                                        <div className="absolute top-2 left-0 -translate-x-1/2">
                                            <div className="size-3 rounded-full bg-primary border-2 border-background shadow-sm" />
                                        </div>

                                        {/* Truck icon at progress position */}
                                        <div
                                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-500"
                                            style={{ left: `${stats.progress}%` }}
                                        >
                                            <div className="size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg ring-2 ring-background">
                                                <IconTruck className="size-4" />
                                            </div>
                                        </div>

                                        {/* Destination dot */}
                                        <div className="absolute top-2 right-0 translate-x-1/2">
                                            <div className="size-3 rounded-full bg-muted-foreground/30 border-2 border-background" />
                                        </div>
                                    </div>

                                    {/* Origin and Destination */}
                                    <div className="grid grid-cols-2 gap-4 pt-1">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5">
                                                <div className="size-1.5 rounded-full bg-primary" />
                                                <span className="text-[0.6rem] text-muted-foreground uppercase tracking-wider">Pickup</span>
                                            </div>
                                            <p className="text-xs font-medium leading-tight">{driver.route?.origin || "Los Angeles, CA"}</p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <div className="flex items-center gap-1.5 justify-end">
                                                <span className="text-[0.6rem] text-muted-foreground uppercase tracking-wider">Drop-off</span>
                                                <div className="size-1.5 rounded-full bg-muted-foreground/50" />
                                            </div>
                                            <p className="text-xs font-medium leading-tight">{driver.route?.destination || "Chicago, IL"}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-3">
                        <Card size="sm">
                            <CardContent className="pt-3">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <IconPackage className="size-3.5" />
                                    <span className="text-[0.65rem] uppercase tracking-wide">This Week</span>
                                </div>
                                <p className="text-2xl font-bold">{stats.totalDeliveries}</p>
                                <p className="text-[0.65rem] text-muted-foreground">Completed Deliveries</p>
                            </CardContent>
                        </Card>
                        <Card size="sm">
                            <CardContent className="pt-3">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <IconTruck className="size-3.5" />
                                    <span className="text-[0.65rem] uppercase tracking-wide">Reviews</span>
                                </div>
                                <p className="text-2xl font-bold">52</p>
                                <p className="text-[0.65rem] text-muted-foreground">5-Star Ratings</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Shipment Statistics Chart */}
                    <Card size="sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <IconChartLine className="size-4 text-primary" />
                                Shipment Statistic
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={shipmentChartConfig} className="h-[160px] w-full">
                                <AreaChart data={shipmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 10 }}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 10 }}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Area
                                        type="monotone"
                                        dataKey="target"
                                        stroke="var(--color-target)"
                                        fill="var(--color-target)"
                                        fillOpacity={0.1}
                                        strokeWidth={1}
                                        strokeDasharray="4 4"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="deliveries"
                                        stroke="var(--color-deliveries)"
                                        fill="var(--color-deliveries)"
                                        fillOpacity={0.3}
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Performance Metrics */}
                    <Card size="sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <IconClock className="size-4 text-primary" />
                                Performance Metrics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wide mb-2">
                                On-Time Delivery Rate
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-primary transition-all duration-700"
                                        style={{ width: `${stats.onTimeRate}%` }}
                                    />
                                </div>
                                <span className="text-lg font-bold text-primary">{stats.onTimeRate}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                <span className="font-medium">{912}</span> total deliveries
                            </p>
                        </CardContent>
                    </Card>

                    {/* Delay Reasons Breakdown */}
                    <Card size="sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Delay Reasons Breakdown</CardTitle>
                            <p className="text-muted-foreground">
                                <span className="text-2xl font-bold text-foreground">{stats.totalDelays}</span>
                                <span className="text-xs ml-1">Delay Cases</span>
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <ChartContainer config={delayChartConfig} className="h-[120px] w-[120px]">
                                    <PieChart>
                                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                        <Pie
                                            data={delayReasonsData}
                                            dataKey="count"
                                            nameKey="reason"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={30}
                                            outerRadius={50}
                                            strokeWidth={2}
                                        >
                                            {delayReasonsData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ChartContainer>
                                <div className="flex-1 space-y-2">
                                    {delayReasonsData.map((item, index) => (
                                        <div key={index} className="flex items-center gap-2 text-xs">
                                            <span
                                                className="size-2 rounded-full shrink-0"
                                                style={{ backgroundColor: item.fill.replace("var(--color-", "").replace(")", "") === item.fill ? item.fill : undefined }}
                                            />
                                            <span className="flex-1 text-muted-foreground truncate">{item.reason}</span>
                                            <span className="font-medium">{Math.round(item.count / stats.totalDelays * 100)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </SheetContent>
        </Sheet >
    )
}
