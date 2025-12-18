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

    const chartConfig = {
        value: {
            label: t("resultsCostIndex"),
            color: "#22c55e",
        },
    } satisfies ChartConfig;

    return (
        <section className="bg-white py-24 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        {t("resultsTitle").split(' ').slice(0, 3).join(' ')}<br />{t("resultsTitle").split(' ').slice(3).join(' ')}
                    </h2>
                    <p className="text-black/60">
                        {t("resultsSubtitle")}
                    </p>
                </div>

                <div className="bg-[#fcfcfc] border border-gray-100 rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden">
                    <div className="max-w-3xl relative z-10">
                        <h3 className="text-2xl md:text-3xl font-semibold leading-snug mb-8">
                            {t("resultsQuote").split('Logix')[0]}
                            <span className="text-[#22c55e]">Logix</span>
                            {t("resultsQuote").split('Logix')[1]}
                            {" "}
                            <span className="bg-black text-white px-2 py-0.5">
                                {t("resultsSavings")}
                            </span>
                        </h3>

                        <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden">
                                <Image
                                    src="/avatar.png"
                                    alt="James Anderson"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <p className="font-bold text-sm">James Anderson</p>
                                <p className="text-xs text-black/40">
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
                                        <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    tickFormatter={(value: string) => value.slice(0, 3)}
                                    stroke="#9ca3af"
                                    fontSize={12}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    stroke="#9ca3af"
                                    fontSize={12}
                                    tickFormatter={(value) => `${value}%`}
                                />
                                <ChartTooltip
                                    cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Area
                                    dataKey="value"
                                    type="monotone"
                                    stroke="var(--color-value)"
                                    strokeWidth={3}
                                    fill="url(#fillValue)"
                                    dot={({ payload, cx, cy }: { payload: { month: string }; cx: number; cy: number }) => {
                                        if (payload.month === "March" || payload.month === "September") {
                                            return (
                                                <svg x={cx - 6} y={cy - 6} width={12} height={12} fill="var(--color-value)" className="overflow-visible" key={`${payload.month}-dot`}>
                                                    <circle cx="6" cy="6" r="4" fill="currentColor" />
                                                    <circle cx="6" cy="6" r="8" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4" fill="none" />
                                                </svg>
                                            )
                                        }
                                        return <circle cx={cx} cy={cy} r={0} key={`${cx}-${cy}`} />
                                    }}
                                    activeDot={{
                                        r: 6,
                                        style: { fill: "var(--color-value)", strokeWidth: 0 },
                                    }}
                                />
                            </AreaChart>
                        </ChartContainer>
                        <div className="absolute top-0 right-0 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm text-right">
                            <p className="text-xs font-medium text-black/40 uppercase tracking-wider">{t("resultsCostIndex")}</p>
                            <p className="text-2xl font-bold text-[#22c55e]">-27%</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
