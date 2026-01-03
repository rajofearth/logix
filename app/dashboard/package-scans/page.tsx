"use client";

import * as React from "react";
import { IconPackage, IconRefresh, IconLoader2 } from "@tabler/icons-react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
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

    const fetchData = React.useCallback(async (reset = false) => {
        const currentOffset = reset ? 0 : offset;
        if (reset) {
            setLoading(true);
            setOffset(0);
        } else {
            setLoadingMore(true);
        }

        try {
            const params = new URLSearchParams();
            if (phase !== "all") params.set("phase", phase);
            if (passed !== "all") params.set("passed", passed);
            params.set("limit", "12");
            params.set("offset", String(currentOffset));

            const response = await fetch(`/api/package-verifications?${params}`);
            if (response.ok) {
                const result: ApiResponse = await response.json();
                if (reset) {
                    setData(result);
                } else {
                    setData((prev) => prev ? {
                        ...result,
                        verifications: [...prev.verifications, ...result.verifications],
                    } : result);
                }
            }
        } catch (error) {
            console.error("Failed to fetch package verifications:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [phase, passed, offset]);

    // Fetch data on mount and when filters change
    React.useEffect(() => {
        fetchData(true);
    }, [phase, passed]);

    const handleLoadMore = () => {
        if (data?.pagination.hasMore) {
            setOffset((prev) => prev + 12);
            fetchData(false);
        }
    };

    const handleClearFilters = () => {
        setPhase("all");
        setPassed("all");
    };

    return (
        <SidebarProvider
            style={{
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties}
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            {/* Page Header */}
                            <div className="flex items-center justify-between px-4 lg:px-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10">
                                        <IconPackage className="size-5 text-primary" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-semibold">Package Scans</h1>
                                        <p className="text-sm text-muted-foreground">
                                            Monitor package condition verifications across all jobs
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fetchData(true)}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <IconLoader2 className="size-4 animate-spin" />
                                    ) : (
                                        <IconRefresh className="size-4" />
                                    )}
                                    <span className="ml-2 hidden sm:inline">Refresh</span>
                                </Button>
                            </div>

                            {/* Stats Cards */}
                            {loading ? (
                                <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                                    {[...Array(4)].map((_, i) => (
                                        <Skeleton key={i} className="h-36 rounded-xl" />
                                    ))}
                                </div>
                            ) : data?.stats ? (
                                <StatsCards stats={data.stats} />
                            ) : null}

                            {/* Filter Bar */}
                            <FilterBar
                                phase={phase}
                                passed={passed}
                                onPhaseChange={setPhase}
                                onPassedChange={setPassed}
                                onClearFilters={handleClearFilters}
                            />

                            {/* Scans Grid */}
                            <div className="px-4 lg:px-6">
                                {loading ? (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {[...Array(8)].map((_, i) => (
                                            <Skeleton key={i} className="h-80 rounded-xl" />
                                        ))}
                                    </div>
                                ) : data?.verifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="flex items-center justify-center size-16 rounded-full bg-muted mb-4">
                                            <IconPackage className="size-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-medium mb-1">No package scans found</h3>
                                        <p className="text-sm text-muted-foreground max-w-sm">
                                            {phase !== "all" || passed !== "all"
                                                ? "Try adjusting your filters to see more results."
                                                : "Package verification data will appear here once drivers start scanning packages."}
                                        </p>
                                        {(phase !== "all" || passed !== "all") && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleClearFilters}
                                                className="mt-4"
                                            >
                                                Clear filters
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                            {data?.verifications.map((verification) => (
                                                <ScanCard key={verification.id} verification={verification} />
                                            ))}
                                        </div>

                                        {/* Load More */}
                                        {data?.pagination.hasMore && (
                                            <div className="flex justify-center mt-8">
                                                <Button
                                                    variant="outline"
                                                    onClick={handleLoadMore}
                                                    disabled={loadingMore}
                                                >
                                                    {loadingMore ? (
                                                        <>
                                                            <IconLoader2 className="size-4 mr-2 animate-spin" />
                                                            Loading...
                                                        </>
                                                    ) : (
                                                        <>Load more scans</>
                                                    )}
                                                </Button>
                                            </div>
                                        )}

                                        {/* Results count */}
                                        <div className="text-center text-sm text-muted-foreground mt-4">
                                            Showing {data?.verifications.length} of {data?.pagination.total} scans
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
