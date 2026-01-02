"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

import { trendChartData } from "../_server/teamsData"

const chartConfig = {
    progress: {
        label: "Progress",
        color: "var(--primary)",
    },
} satisfies ChartConfig

export function TeamProgressTrendChart() {
    return (
        <Card className="@container/card">
            <CardHeader>
                <CardTitle>Team Avg. Progress</CardTitle>
                <CardDescription>
                    30-day progress trend across all teams
                </CardDescription>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[200px] w-full"
                >
                    <AreaChart data={trendChartData}>
                        <defs>
                            <linearGradient id="fillProgress" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-progress)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-progress)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            domain={[60, 100]}
                            tickFormatter={(value) => `${value}%`}
                            tick={{ fontSize: 12 }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => value}
                                    formatter={(value) => [`${value}%`, "Progress"]}
                                    indicator="dot"
                                />
                            }
                        />
                        <Area
                            dataKey="progress"
                            type="monotone"
                            fill="url(#fillProgress)"
                            stroke="var(--color-progress)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
