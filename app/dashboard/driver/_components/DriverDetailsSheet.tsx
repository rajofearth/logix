"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
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
    IconTruck,
    IconClock,
    IconPackage,
    IconChartLine,
    IconLocation,
    IconStar,
    IconPhone,
    IconMail,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"

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
    { month: "Jan", deliveries: 65 },
    { month: "Feb", deliveries: 78 },
    { month: "Mar", deliveries: 52 },
    { month: "Apr", deliveries: 91 },
    { month: "May", deliveries: 86 },
    { month: "Jun", deliveries: 73 },
    { month: "Jul", deliveries: 98 },
    { month: "Aug", deliveries: 88 },
    { month: "Sep", deliveries: 79 },
    { month: "Oct", deliveries: 95 },
    { month: "Nov", deliveries: 82 },
    { month: "Dec", deliveries: 89 },
]

// Mock delay reasons data for pie chart
const delayReasonsData = [
    { reason: "Misrouted", count: 18, fill: "var(--color-misrouted)" },
    { reason: "Breakdown", count: 8, fill: "var(--color-breakdown)" },
    { reason: "Accident", count: 6, fill: "var(--color-accident)" },
    { reason: "Others", count: 8, fill: "var(--color-others)" },
]

const shipmentChartConfig = {
    deliveries: {
        label: "Deliveries",
        color: "oklch(0.646 0.222 41.116)",
    },
} satisfies ChartConfig

const delayChartConfig = {
    misrouted: {
        label: "Misrouted",
        color: "oklch(0.646 0.222 41.116)",
    },
    breakdown: {
        label: "Breakdown",
        color: "oklch(0.7 0.015 286.067)",
    },
    accident: {
        label: "Accident",
        color: "oklch(0.47 0.157 37.304)",
    },
    others: {
        label: "Others",
        color: "oklch(0.553 0.195 38.402)",
    },
} satisfies ChartConfig

const statusConfig = {
    available: {
        label: "Available",
        ringColor: "ring-emerald-500",
        badgeClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        dotColor: "bg-emerald-500",
    },
    "on-route": {
        label: "On Route",
        ringColor: "ring-primary",
        badgeClass: "bg-primary/10 text-primary border-primary/20",
        dotColor: "bg-primary",
    },
    "off-duty": {
        label: "Off Duty",
        ringColor: "ring-muted-foreground/50",
        badgeClass: "bg-muted text-muted-foreground border-muted-foreground/20",
        dotColor: "bg-muted-foreground",
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
    const router = useRouter()

    if (!driver) return null

    const status = statusConfig[driver.status]
    const isAvailable = driver.status === "available"

    // Mock stats
    const stats = {
        totalDeliveries: 980,
        onTimeRate: 93,
        totalDelays: 40,
        progress: 63,
        rating: 4.9,
        reviews: 56,
        yearsExp: 3,
    }

    const handleTrackClick = () => {
        if (driver.currentJobId) {
            onOpenChange(false)
            router.push(`/dashboard/track?jobId=${driver.currentJobId}`)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
                {/* Header Section */}
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
                    <SheetHeader className="p-4 pb-3">
                        <div className="flex items-center gap-3">
                            <Avatar
                                size="lg"
                                className={cn("ring-2 ring-offset-2 ring-offset-background", status.ringColor)}
                            >
                                <AvatarImage src={driver.avatar ?? undefined} alt={driver.name} />
                                <AvatarFallback className="text-sm font-semibold">{getInitials(driver.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <SheetTitle className="text-base truncate">{driver.name}</SheetTitle>
                                    <Badge
                                        variant="outline"
                                        className={cn("text-[0.6rem] px-1.5 h-5 shrink-0 border", status.badgeClass)}
                                    >
                                        <span className={cn("size-1.5 rounded-full mr-1", status.dotColor)} />
                                        {status.label}
                                    </Badge>
                                </div>
                                <SheetDescription className="flex items-center gap-3 mt-0.5">
                                    <span className="flex items-center gap-1">
                                        <IconStar className="size-3 fill-amber-400 text-amber-400" />
                                        <span className="font-medium text-foreground">{stats.rating}</span>
                                        <span className="text-muted-foreground">({stats.reviews})</span>
                                    </span>
                                    <span className="text-muted-foreground">•</span>
                                    <span>{stats.yearsExp}+ years exp</span>
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>
                </div>

                <div className="p-4 space-y-4">
                    {/* Available Driver - Quick Actions */}
                    {isAvailable && (
                        <Card className="bg-emerald-500/5 border-emerald-500/20">
                            <CardContent className="p-3">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <IconTruck className="size-5 text-emerald-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Ready for Assignment</p>
                                        <p className="text-xs text-muted-foreground">This driver is available for new jobs</p>
                                    </div>
                                    <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white">
                                        Assign Job
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Active Job Card - Only for on-route drivers */}
                    {driver.currentJob && !isAvailable && (
                        <Card className="overflow-hidden border-primary/20">
                            <CardHeader className="p-3 pb-2 bg-primary/5">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <IconTruck className="size-4 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm">{driver.currentJob}</CardTitle>
                                            <p className="text-[0.65rem] text-muted-foreground">Active Delivery</p>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-3 pt-2">
                                <div className="space-y-3">
                                    {/* Progress bar */}
                                    <div>
                                        <div className="flex items-center justify-between text-xs mb-1.5">
                                            <span className="text-muted-foreground">Route Progress</span>
                                            <span className="font-semibold text-primary">{stats.progress}%</span>
                                        </div>
                                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-500"
                                                style={{ width: `${stats.progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Route */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <div className="flex-1 truncate">
                                            <span className="text-muted-foreground">From:</span>
                                            <span className="ml-1 font-medium">{driver.route?.origin || "Los Angeles, CA"}</span>
                                        </div>
                                        <span className="text-muted-foreground">→</span>
                                        <div className="flex-1 truncate text-right">
                                            <span className="font-medium">{driver.route?.destination || "Chicago, IL"}</span>
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full h-8 text-xs border-primary/30 text-primary hover:bg-primary/10"
                                        onClick={handleTrackClick}
                                    >
                                        <IconLocation className="size-3.5 mr-1.5" />
                                        Track Live
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2">
                        <Card className="p-3 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/10">
                            <div className="flex items-center gap-1.5 text-primary/70 mb-1">
                                <IconPackage className="size-3.5" />
                                <span className="text-[0.6rem] font-medium uppercase tracking-wide">Total</span>
                            </div>
                            <p className="text-2xl font-bold text-primary">{stats.totalDeliveries}</p>
                            <p className="text-[0.6rem] text-muted-foreground">Deliveries</p>
                        </Card>
                        <Card className="p-3 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/10">
                            <div className="flex items-center gap-1.5 text-emerald-600/70 mb-1">
                                <IconClock className="size-3.5" />
                                <span className="text-[0.6rem] font-medium uppercase tracking-wide">On-Time</span>
                            </div>
                            <p className="text-2xl font-bold text-emerald-600">{stats.onTimeRate}%</p>
                            <p className="text-[0.6rem] text-muted-foreground">Rate</p>
                        </Card>
                        <Card className="p-3 bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/10">
                            <div className="flex items-center gap-1.5 text-amber-600/70 mb-1">
                                <IconStar className="size-3.5" />
                                <span className="text-[0.6rem] font-medium uppercase tracking-wide">Rating</span>
                            </div>
                            <p className="text-2xl font-bold text-amber-600">{stats.rating}</p>
                            <p className="text-[0.6rem] text-muted-foreground">{stats.reviews} Reviews</p>
                        </Card>
                    </div>

                    {/* Performance Chart */}
                    <Card>
                        <CardHeader className="p-3 pb-1">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-xs font-medium">
                                    <IconChartLine className="size-4 text-primary" />
                                    Monthly Performance
                                </CardTitle>
                                <Badge variant="secondary" className="text-[0.6rem] h-5">
                                    Avg. {Math.round(shipmentData.reduce((sum, d) => sum + d.deliveries, 0) / 12)}/mo
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                            <ChartContainer config={shipmentChartConfig} className="h-[140px] w-full">
                                <AreaChart data={shipmentData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="fillDeliveries" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="var(--color-deliveries)" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="var(--color-deliveries)" stopOpacity={0.05} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                                        tickMargin={6}
                                        interval={1}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                                        tickCount={3}
                                        width={28}
                                    />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                        cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "3 3" }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="deliveries"
                                        stroke="var(--color-deliveries)"
                                        fill="url(#fillDeliveries)"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 3, fill: "var(--color-deliveries)", stroke: "hsl(var(--background))", strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Delay Analysis */}
                    <Card>
                        <CardHeader className="p-3 pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xs font-medium">Delay Analysis</CardTitle>
                                <Badge variant="outline" className="text-[0.6rem] h-5">
                                    {stats.totalDelays} Total
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                            <div className="flex items-center gap-4">
                                <ChartContainer config={delayChartConfig} className="h-[80px] w-[80px] shrink-0">
                                    <PieChart>
                                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                        <Pie
                                            data={delayReasonsData}
                                            dataKey="count"
                                            nameKey="reason"
                                            innerRadius={22}
                                            outerRadius={36}
                                            strokeWidth={2}
                                            paddingAngle={3}
                                        >
                                            {delayReasonsData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} stroke="hsl(var(--background))" />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ChartContainer>
                                <div className="flex-1 grid grid-cols-2 gap-2">
                                    {delayReasonsData.map((item, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div
                                                className="size-2.5 rounded-full shrink-0"
                                                style={{
                                                    backgroundColor:
                                                        item.fill === "var(--color-misrouted)" ? "oklch(0.646 0.222 41.116)" :
                                                            item.fill === "var(--color-breakdown)" ? "oklch(0.7 0.015 286.067)" :
                                                                item.fill === "var(--color-accident)" ? "oklch(0.47 0.157 37.304)" :
                                                                    "oklch(0.553 0.195 38.402)"
                                                }}
                                            />
                                            <div className="min-w-0">
                                                <p className="text-[0.65rem] font-medium">{item.reason}</p>
                                                <p className="text-[0.6rem] text-muted-foreground">
                                                    {Math.round(item.count / stats.totalDelays * 100)}% • {item.count} cases
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Info - For Available Drivers */}
                    {isAvailable && (
                        <Card>
                            <CardHeader className="p-3 pb-2">
                                <CardTitle className="text-xs font-medium">Quick Contact</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1 h-9 text-xs">
                                        <IconPhone className="size-3.5 mr-1.5" />
                                        Call Driver
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1 h-9 text-xs">
                                        <IconMail className="size-3.5 mr-1.5" />
                                        Send Message
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
