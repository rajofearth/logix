"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export const description = "An interactive area chart with Windows 7 styling"

const chartData = [
  { date: "2024-04-01", desktop: 222, mobile: 150 },
  { date: "2024-04-02", desktop: 97, mobile: 180 },
  { date: "2024-04-03", desktop: 167, mobile: 120 },
  { date: "2024-04-04", desktop: 242, mobile: 260 },
  { date: "2024-04-05", desktop: 373, mobile: 290 },
  { date: "2024-04-06", desktop: 301, mobile: 340 },
  { date: "2024-04-07", desktop: 245, mobile: 180 },
  { date: "2024-04-08", desktop: 409, mobile: 320 },
  { date: "2024-04-09", desktop: 59, mobile: 110 },
  { date: "2024-04-10", desktop: 261, mobile: 190 },
  { date: "2024-04-11", desktop: 327, mobile: 350 },
  { date: "2024-04-12", desktop: 292, mobile: 210 },
  { date: "2024-04-13", desktop: 342, mobile: 380 },
  { date: "2024-04-14", desktop: 137, mobile: 220 },
  { date: "2024-04-15", desktop: 120, mobile: 170 },
  { date: "2024-04-16", desktop: 138, mobile: 190 },
  { date: "2024-04-17", desktop: 446, mobile: 360 },
  { date: "2024-04-18", desktop: 364, mobile: 410 },
  { date: "2024-04-19", desktop: 243, mobile: 180 },
  { date: "2024-04-20", desktop: 89, mobile: 150 },
  { date: "2024-05-01", desktop: 165, mobile: 220 },
  { date: "2024-05-02", desktop: 293, mobile: 310 },
  { date: "2024-05-03", desktop: 247, mobile: 190 },
  { date: "2024-05-04", desktop: 385, mobile: 420 },
  { date: "2024-05-05", desktop: 481, mobile: 390 },
  { date: "2024-05-06", desktop: 498, mobile: 520 },
  { date: "2024-05-07", desktop: 388, mobile: 300 },
  { date: "2024-06-01", desktop: 178, mobile: 200 },
  { date: "2024-06-02", desktop: 470, mobile: 410 },
  { date: "2024-06-03", desktop: 103, mobile: 160 },
  { date: "2024-06-04", desktop: 439, mobile: 380 },
  { date: "2024-06-05", desktop: 88, mobile: 140 },
]

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = React.useState("90d")

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <div className="win7-groupbox" style={{ padding: 0 }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 12px",
        borderBottom: "1px solid #d5dfe7",
        background: "linear-gradient(#fff 45%, #f8f8f8 45%, #f0f0f0)"
      }}>
        <div>
          <div style={{ fontWeight: 600, color: "#0046d5", fontSize: 12 }}>Total Visitors</div>
          <div style={{ fontSize: 11, color: "#666" }}>Total for the last 3 months</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            className="win7-btn"
            onClick={() => setTimeRange("90d")}
            style={{
              minWidth: 80,
              minHeight: 22,
              fontSize: 11,
              background: timeRange === "90d" ? "linear-gradient(#e5f4fc, #c4e5f6 30% 50%, #98d1ef 50%, #68b3db)" : undefined,
              borderColor: timeRange === "90d" ? "#3c7fb1" : undefined
            }}
          >
            3 months
          </button>
          <button
            className="win7-btn"
            onClick={() => setTimeRange("30d")}
            style={{
              minWidth: 80,
              minHeight: 22,
              fontSize: 11,
              background: timeRange === "30d" ? "linear-gradient(#e5f4fc, #c4e5f6 30% 50%, #98d1ef 50%, #68b3db)" : undefined,
              borderColor: timeRange === "30d" ? "#3c7fb1" : undefined
            }}
          >
            30 days
          </button>
          <button
            className="win7-btn"
            onClick={() => setTimeRange("7d")}
            style={{
              minWidth: 60,
              minHeight: 22,
              fontSize: 11,
              background: timeRange === "7d" ? "linear-gradient(#e5f4fc, #c4e5f6 30% 50%, #98d1ef 50%, #68b3db)" : undefined,
              borderColor: timeRange === "7d" ? "#3c7fb1" : undefined
            }}
          >
            7 days
          </button>
        </div>
      </div>

      {/* Chart */}
      <div style={{ padding: 12, background: "#fff" }}>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={filteredData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillDesktopWin7" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4580c4" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4580c4" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillMobileWin7" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#68b3db" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#68b3db" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={{ stroke: "#c0c0c0" }}
              tickMargin={8}
              tick={{ fontSize: 10, fill: "#666" }}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: "#c0c0c0" }}
              tick={{ fontSize: 10, fill: "#666" }}
            />
            <Tooltip
              contentStyle={{
                background: "#f0f0f0",
                border: "1px solid #8e8f8f",
                borderRadius: 3,
                boxShadow: "2px 2px 4px rgba(0,0,0,0.2)",
                fontSize: 11,
              }}
              labelFormatter={(value) => {
                return new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              }}
            />
            <Area
              dataKey="mobile"
              type="monotone"
              fill="url(#fillMobileWin7)"
              stroke="#68b3db"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="desktop"
              type="monotone"
              fill="url(#fillDesktopWin7)"
              stroke="#4580c4"
              strokeWidth={2}
              stackId="a"
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 8, fontSize: 11 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 12, height: 12, background: "#4580c4", borderRadius: 2 }} />
            <span>Desktop</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 12, height: 12, background: "#68b3db", borderRadius: 2 }} />
            <span>Mobile</span>
          </div>
        </div>
      </div>
    </div>
  )
}
