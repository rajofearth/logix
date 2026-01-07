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

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Stats Cards */}
                    {loading ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-24 bg-white border border-[#7f9db9]" />
                            ))}
                        </div>
                    ) : data?.stats ? (
                        <div className="win7-groupbox">
                            <legend>System Statistics</legend>
                            <div className="win7-p-4">
                                <StatsCards stats={data.stats} />
                            </div>
                        </div>
                    ) : null}

                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Filters Panel */}
                        <div className="lg:w-64 shrink-0">
                            <div className="win7-groupbox h-auto">
                                <legend>Filters</legend>
                                <div className="win7-p-4 flex flex-col gap-4">
                                    <FilterBar
                                        phase={phase}
                                        passed={passed}
                                        onPhaseChange={setPhase}
                                        onPassedChange={setPassed}
                                        onClearFilters={handleClearFilters}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Scans Grid */}
                        <div className="flex-1">
                            {loading ? (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                    {[...Array(6)].map((_, i) => (
                                        <Skeleton key={i} className="h-80 bg-white border border-[#7f9db9]" />
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
