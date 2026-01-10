"use client";

import * as React from "react";
import { IconPackage, IconRefresh, IconLoader2, IconSearch, IconFilter } from "@tabler/icons-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { StatsCards } from "./_components/StatsCards";
import { FilterBar } from "./_components/FilterBar";
import { ScanCard } from "./_components/ScanCard";

interface Job {
    id: string;
    title: string;
    status: string;
    pickupAddress: string;
    dropAddress: string;
    driver: {
        id: string;
        name: string;
        photoUrl: string | null;
    } | null;
}

interface PackageVerification {
    id: string;
    phase: "pickup" | "delivery";
    capturedImageUrl: string;
    heatmapImageUrl: string | null;
    damagePercentage: number;
    anomalyDetected: boolean;
    threshold: number;
    passed: boolean;
    createdAt: string;
    job: Job;
}

interface Stats {
    total: number;
    pickupScans: number;
    deliveryScans: number;
    passed: number;
    failed: number;
    avgDamage: string;
}

interface ApiResponse {
    verifications: PackageVerification[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
    stats: Stats;
}

export default function PackageScansPage() {
    const [data, setData] = React.useState<ApiResponse | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [loadingMore, setLoadingMore] = React.useState(false);
    const [phase, setPhase] = React.useState("all");
    const [passed, setPassed] = React.useState("all");
    const [offset, setOffset] = React.useState(0);

    // Fetch data on mount and when filters change
    React.useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            setOffset(0);

            try {
                const params = new URLSearchParams();
                if (phase !== "all") params.set("phase", phase);
                if (passed !== "all") params.set("passed", passed);
                params.set("limit", "12");
                params.set("offset", "0");

                const response = await fetch(`/api/package-verifications?${params}`);
                if (response.ok) {
                    const result: ApiResponse = await response.json();
                    setData(result);
                }
            } catch (error) {
                console.error("Failed to fetch package verifications:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [phase, passed]);

    const fetchMoreData = async () => {
        setLoadingMore(true);

        try {
            const params = new URLSearchParams();
            if (phase !== "all") params.set("phase", phase);
            if (passed !== "all") params.set("passed", passed);
            params.set("limit", "12");
            params.set("offset", String(offset + 12));

            const response = await fetch(`/api/package-verifications?${params}`);
            if (response.ok) {
                const result: ApiResponse = await response.json();
                setData((prev) => prev ? {
                    ...result,
                    verifications: [...prev.verifications, ...result.verifications],
                } : result);
                setOffset((prev) => prev + 12);
            }
        } catch (error) {
            console.error("Failed to fetch more verifications:", error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        if (data?.pagination.hasMore) {
            fetchMoreData();
        }
    };

    const handleRefresh = () => {
        setOffset(0);
        // Trigger re-fetch by toggling a dummy state or just re-run the effect
        // Since phase/passed didn't change, we need to force a refresh
        setLoading(true);
        const fetchData = async () => {
            try {
                const params = new URLSearchParams();
                if (phase !== "all") params.set("phase", phase);
                if (passed !== "all") params.set("passed", passed);
                params.set("limit", "12");
                params.set("offset", "0");

                const response = await fetch(`/api/package-verifications?${params}`);
                if (response.ok) {
                    const result: ApiResponse = await response.json();
                    setData(result);
                }
            } catch (error) {
                console.error("Failed to refresh verifications:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    };

    const handleClearFilters = () => {
        setPhase("all");
        setPassed("all");
    };

    return (
        <DashboardShell title="Package Condition Monitor">
            <div className="flex flex-col h-full bg-[#ece9d8]">
                {/* Header Toolbar */}
                <div className="flex items-center justify-between p-2 border-b border-[#fff] shadow-[0_1px_0_#aca899]">
                    <div className="flex items-center gap-2">
                        <IconPackage className="size-5 text-gray-500" />
                        <span className="font-bold text-sm">Scan Verification Logs</span>
                    </div>
                    <button
                        className="win7-btn text-xs flex items-center gap-1"
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        {loading ? <IconLoader2 className="size-3.5 animate-spin" /> : <IconRefresh className="size-3.5" />}
                        Refresh
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Sidebar: Stats & Filters */}
                    <div className="w-[350px] flex-shrink-0 border-r border-[#aca899] bg-[#f0f0f0] p-4 overflow-y-auto hidden lg:block">
                        <div className="space-y-4">
                            {/* Stats Section with Interactive Filtering */}
                            {loading ? (
                                <div className="space-y-4">
                                    {[...Array(4)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-24 animate-pulse"
                                            style={{
                                                background: 'linear-gradient(#fff 45%, #f0f0f0 45%, #e0e0e0)',
                                                border: '1px solid #c0c1cd',
                                                borderRadius: '3px',
                                            }}
                                        />
                                    ))}
                                </div>
                            ) : data?.stats ? (
                                <div className="win7-groupbox">
                                    <legend>System Statistics</legend>
                                    <div className="win7-p-4 pl-0 pr-0">
                                        <p className="px-4 text-xs text-gray-500 mb-2">
                                            Click on cards to filter scans.
                                        </p>
                                        <StatsCards
                                            stats={data.stats}
                                            className="grid-cols-1 lg:grid-cols-1 @xl/main:grid-cols-1 @5xl/main:grid-cols-1 px-0 lg:px-0"
                                            onFilterChange={(newPhase, newStatus) => {
                                                setPhase(newPhase);
                                                setPassed(newStatus);
                                            }}
                                        />
                                    </div>
                                </div>
                            ) : null}

                            {/* Active Filters Display */}
                            {(phase !== "all" || passed !== "all") && (
                                <div className="win7-groupbox">
                                    <legend>Active Filters</legend>
                                    <div className="win7-p-4 flex flex-wrap gap-2">
                                        {phase !== "all" && (
                                            <div className="flex items-center gap-1 bg-white border border-[#7f9db9] px-2 py-1 rounded text-xs">
                                                <span className="text-gray-500">Phase:</span>
                                                <span className="font-bold capitalize">{phase}</span>
                                                <button onClick={() => setPhase("all")} className="ml-1 hover:text-red-500"><IconFilter className="size-3" /></button>
                                            </div>
                                        )}
                                        {passed !== "all" && (
                                            <div className="flex items-center gap-1 bg-white border border-[#7f9db9] px-2 py-1 rounded text-xs">
                                                <span className="text-gray-500">Status:</span>
                                                <span className="font-bold capitalize">{passed === "true" ? "Passed" : "Failed"}</span>
                                                <button onClick={() => setPassed("all")} className="ml-1 hover:text-red-500"><IconFilter className="size-3" /></button>
                                            </div>
                                        )}
                                        <button
                                            onClick={handleClearFilters}
                                            className="text-xs text-blue-600 hover:underline ml-auto"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Content: Scans Grid */}
                    <div className="flex-1 flex flex-col min-w-0 bg-white">
                        {/* Mobile Filters (visible only on small screens) */}
                        <div className="lg:hidden p-4 border-b border-[#aca899] bg-[#f0f0f0]">
                            <FilterBar
                                phase={phase}
                                passed={passed}
                                onPhaseChange={setPhase}
                                onPassedChange={setPassed}
                                onClearFilters={handleClearFilters}
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {loading && !data ? (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                    {[...Array(6)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-80 animate-pulse"
                                            style={{
                                                background: 'linear-gradient(#fff 45%, #f0f0f0 45%, #e0e0e0)',
                                                border: '1px solid #c0c1cd',
                                                borderRadius: 'var(--w7-el-bdr)',
                                            }}
                                        />
                                    ))}
                                </div>
                            ) : data?.verifications.length === 0 ? (
                                <div className="win7-groupbox bg-white flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                                    <IconPackage className="size-12 text-[#adaa9c] mb-4" />
                                    <h3 className="text-lg font-bold mb-1">No package scans found</h3>
                                    <p className="text-sm text-gray-500 mb-4 max-w-sm">
                                        {phase !== "all" || passed !== "all"
                                            ? "Try adjusting your filters to see more results."
                                            : "Package verification data will appear here once drivers start scanning packages."}
                                    </p>
                                    {(phase !== "all" || passed !== "all") && (
                                        <button
                                            className="win7-btn"
                                            onClick={handleClearFilters}
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                        {data?.verifications.map((verification) => (
                                            <div key={verification.id} className="win7-window p-1 bg-white">
                                                <ScanCard verification={verification} />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Load More */}
                                    {data?.pagination.hasMore && (
                                        <div className="flex justify-center mt-4">
                                            <button
                                                className="win7-btn min-w-[120px]"
                                                onClick={handleLoadMore}
                                                disabled={loadingMore}
                                            >
                                                {loadingMore ? (
                                                    <>
                                                        <IconLoader2 className="size-3.5 mr-2 animate-spin inline" />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    "Load more scans"
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    <div className="text-center text-xs text-gray-500 mt-2">
                                        Showing {data?.verifications.length} of {data?.pagination.total} scans relative to filters
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
