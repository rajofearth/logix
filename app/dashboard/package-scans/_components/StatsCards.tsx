"use client";

import {
    IconTrendingUp,
    IconTrendingDown,
    IconPackage,
    IconCheck,
    IconX,
    IconAlertTriangle,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
    stats: {
        total: number;
        pickupScans: number;
        deliveryScans: number;
        passed: number;
        failed: number;
        avgDamage: string;
    };
    className?: string;
    onFilterChange: (phase: string, status: string) => void;
}

export function StatsCards({ stats, className, onFilterChange }: StatsCardsProps) {
    const passRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : "0.0";
    const avgDamage = parseFloat(stats.avgDamage);

    return (
        <div className={cn("grid grid-cols-1 gap-2 font-['Segoe_UI',_sans-serif]", className)}>
            <style jsx>{`
                .win7-stats-group {
                    border: 1px solid #cdd7db;
                    border-radius: 3px;
                    padding: 8px;
                    background: linear-gradient(#fff, #f7f7f7);
                    position: relative;
                }
                .win7-stats-title {
                    color: #1e5774;
                    font-size: 11px;
                    margin-bottom: 2px;
                }
                .win7-stats-value {
                    font-size: 20px;
                    color: #000;
                    line-height: 1;
                    font-family: "Segoe UI", sans-serif;
                }
                .win7-btn-filter {
                    border: 1px solid #707070;
                    border-color: #707070 #707070 #707070;
                    border-radius: 2px;
                    background: linear-gradient(#f2f2f2, #ebebeb 45%, #dddddd 50%, #cfcfcf);
                    box-shadow: inset 0 0 0 1px #fff;
                    color: #000;
                    font-size: 11px;
                    padding: 2px 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex: 1;
                }
                .win7-btn-filter:hover {
                    border-color: #3c7fb1;
                    background: linear-gradient(#eaf6fd 45%, #bee6fd 45%, #a7d9f5);
                    box-shadow: inset 0 0 0 1px #fff;
                }
                .win7-btn-filter:active {
                    background: linear-gradient(#e5f4fc, #c4e5f6 30% 50%, #98d1ef 50%, #68b3db);
                    border-color: #6d91ab;
                }
            `}</style>

            {/* Total Scans */}
            <div className="win7-stats-group" onClick={() => onFilterChange("all", "all")}>
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <div className="win7-stats-title">Total Scans</div>
                        <div className="win7-stats-value">{stats.total.toLocaleString()}</div>
                    </div>
                    <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-gray-50 font-normal text-gray-600 border-gray-300">
                        All Time
                    </Badge>
                </div>
                <div className="flex gap-1">
                    <button
                        className="win7-btn-filter"
                        onClick={(e) => {
                            e.stopPropagation();
                            onFilterChange("pickup", "all");
                        }}
                    >
                        <span>Pickup</span>
                        <span className="font-bold ml-1">{stats.pickupScans}</span>
                    </button>
                    <button
                        className="win7-btn-filter"
                        onClick={(e) => {
                            e.stopPropagation();
                            onFilterChange("delivery", "all");
                        }}
                    >
                        <span>Delivery</span>
                        <span className="font-bold ml-1">{stats.deliveryScans}</span>
                    </button>
                </div>
            </div>

            {/* Pass Rate */}
            <div className="win7-stats-group">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <div className="win7-stats-title">Pass Rate</div>
                        <div className="flex items-baseline gap-2">
                            <div className="win7-stats-value">{passRate}%</div>
                            <span className={cn("text-[10px]", parseFloat(passRate) >= 80 ? "text-emerald-700" : "text-amber-700")}>
                                {parseFloat(passRate) >= 80 ? "Healthy" : "Attention"}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-1">
                    <button
                        className="win7-btn-filter"
                        onClick={() => onFilterChange("all", "true")}
                    >
                        <span className="text-emerald-700">Passed</span>
                        <span className="font-bold ml-1">{stats.passed}</span>
                    </button>
                    <button
                        className="win7-btn-filter"
                        onClick={() => onFilterChange("all", "false")}
                    >
                        <span className="text-red-700">Failed</span>
                        <span className="font-bold ml-1">{stats.failed}</span>
                    </button>
                </div>
            </div>

            {/* Approved */}
            <div
                className="win7-stats-group cursor-pointer hover:border-[#3c7fb1]"
                onClick={() => onFilterChange("all", "true")}
            >
                <div className="flex justify-between items-center">
                    <div>
                        <div className="win7-stats-title text-emerald-700 flex items-center gap-1">
                            <IconCheck className="size-3" /> Approved
                        </div>
                        <div className="win7-stats-value text-emerald-800">{stats.passed.toLocaleString()}</div>
                    </div>
                    <div className="text-[9px] text-gray-500 max-w-[60px] text-right leading-tight">
                        Good condition
                    </div>
                </div>
            </div>

            {/* Avg Damage */}
            <div className="win7-stats-group">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="win7-stats-title">Avg. Damage</div>
                        <div className="win7-stats-value">{stats.avgDamage}%</div>
                    </div>
                    <Badge variant="outline" className={cn("h-5 px-1.5 text-[10px] font-normal", avgDamage <= 15 ? "text-emerald-700 bg-emerald-50 border-emerald-200" : avgDamage <= 30 ? "text-amber-700 bg-amber-50 border-amber-200" : "text-red-700 bg-red-50 border-red-200")}>
                        {avgDamage <= 15 ? "Low" : avgDamage <= 30 ? "Moderate" : "High"}
                    </Badge>
                </div>
            </div>
        </div>
    );
}
