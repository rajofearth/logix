import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function TrackLoading() {
    return (
        <DashboardShell title="Logix Dashboard - Tracking">
            <div className="flex w-full h-full relative" style={{ height: 'calc(100vh - 120px)' }}>

                {/* Left Panel - Cards Skeleton */}
                <div className="w-full md:w-[340px] lg:w-[380px] shrink-0 flex flex-col border-r border-[#898c95] bg-[#ece9d8]">
                    {/* Search Skeleton */}
                    <div className="p-3 pb-2">
                        <div className="h-9 w-full bg-white border border-[#7f9db9] rounded-none animate-pulse"></div>
                    </div>

                    {/* Card List Skeleton */}
                    <div className="flex-1 overflow-y-auto px-3 pb-3 pt-1 space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex gap-3 p-3 bg-white border border-[#dcdcdc] rounded-sm">
                                <div className="size-10 bg-gray-200 animate-pulse rounded-full shrink-0"></div>
                                <div className="space-y-2 w-full">
                                    <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded-sm"></div>
                                    <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded-sm"></div>
                                    <div className="h-3 w-1/3 bg-gray-200 animate-pulse rounded-sm mt-1"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel - Map Skeleton */}
                <div className="flex-1 overflow-hidden relative bg-[#808080] flex items-center justify-center">
                    <div className="text-white/50 flex flex-col items-center gap-2">
                        <div className="size-10 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                        <span className="text-sm shadow-black drop-shadow-md">Loading Map...</span>
                    </div>
                </div>

            </div>
        </DashboardShell>
    );
}
