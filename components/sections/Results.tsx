"use client";

import Image from "next/image";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { useLanguage } from "@/lib/LanguageContext";

const chartData = [
    { month: "March", value: 100 },
    { month: "April", value: 98 },
    { month: "May", value: 100 },
    { month: "June", value: 92 },
    { month: "July", value: 85 },
    { month: "August", value: 78 },
    { month: "September", value: 73 },
];

export function Results() {
    const { t } = useLanguage();

    // Use CSS variables set in @app/globals.css for primary color, text, backgrounds, etc.
    const chartConfig = {
        value: {
            label: t("resultsCostIndex"),
            // Use the --color-chart-3 variable which maps to --primary like var(--color-chart-3)
            color: "var(--color-chart-3)",
        },
    } satisfies ChartConfig;

    return (
        <section className="bg-background py-24 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
                        {t("resultsTitle").split(' ').slice(0, 3).join(' ')}<br />{t("resultsTitle").split(' ').slice(3).join(' ')}
                    </h2>
                    <p className="text-muted-foreground">
                        {t("resultsSubtitle")}
                    </p>
                </div>

                <div
                    className="rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden border"
                    style={{
                        backgroundColor: "var(--card)", // card background
                        borderColor: "var(--border)" // border color
                    }}
                >
                    <div className="max-w-3xl relative z-10">
                        <h3 className="text-2xl md:text-3xl font-semibold leading-snug mb-8 text-foreground">
                            {t("resultsQuote").split('Logix')[0]}
                            <span
                                className="font-bold"
                                style={{ color: "var(--color-primary)" }}
                            >
                                Logix
                            </span>
                            {t("resultsQuote").split('Logix')[1]}
                            {" "}
                            <span
                                className="rounded-md px-2 py-0.5 font-semibold"
                                style={{
                                    backgroundColor: "var(--color-foreground)",
                                    color: "var(--color-background)",
                                }}
                            >
                                {t("resultsSavings")}
                            </span>
                        </h3>

                        <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden">
                                <Image
                                    src="/images/avatar.png"
                                    alt="James Anderson"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-foreground">James Anderson</p>
                                <p className="text-xs text-muted-foreground">
                                    Chief Operating Officer, Scan Global Logistics
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Graph Section */}
                    <div className="mt-12 relative w-full h-[350px]">
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <AreaChart
                                data={chartData}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: -20,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-chart-3)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--color-chart-3)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    vertical={false}
                                    strokeDasharray="3 3"
                                    stroke="var(--border)"
                                />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    tickFormatter={(value: string) => value.slice(0, 3)}
                                    stroke="var(--muted-foreground)"
                                    fontSize={12}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    stroke="var(--muted-foreground)"
                                    fontSize={12}
                                    tickFormatter={(value) => `${value}%`}
                                />
                                <ChartTooltip
                                    cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Area
                                    dataKey="value"
                                    type="monotone"
                                    stroke="var(--color-chart-3)"
                                    strokeWidth={3}
                                    fill="url(#fillValue)"
                                    dot={({ payload, cx, cy }: { payload: { month: string }; cx: number; cy: number }) => {
                                        if (payload.month === "March" || payload.month === "September") {
                                            return (
                                                <svg x={cx - 6} y={cy - 6} width={12} height={12} fill="var(--color-chart-3)" className="overflow-visible" key={`${payload.month}-dot`}>
                                                    <circle cx="6" cy="6" r="4" fill="currentColor" />
                                                    <circle cx="6" cy="6" r="8" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4" fill="none" />
                                                </svg>
                                            )
                                        }
                                        return <circle cx={cx} cy={cy} r={0} key={`${cx}-${cy}`} />
                                    }}
                                    activeDot={{
                                        r: 6,
                                        style: { fill: "var(--color-chart-3)", strokeWidth: 0 },
                                    }}
                                />
                            </AreaChart>
                        </ChartContainer>
                        <div
                            className="absolute top-0 right-0 p-4 rounded-xl shadow-sm text-right border"
                            style={{
                                backgroundColor: "var(--popover)",
                                borderColor: "var(--border)"
                            }}
                        >
                            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>{t("resultsCostIndex")}</p>
                            <p className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>-27%</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
