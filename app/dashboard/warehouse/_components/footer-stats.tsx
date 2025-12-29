"use client";

import { Card } from "@/components/ui/card";
import {
    Archive,
    Users,
    Truck,
    PackageCheck
} from "lucide-react";

export function WarehouseFooterStats() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 shrink-0">
            {/* Storage Available */}
            <Card className="p-3 flex flex-col justify-between shadow-sm bg-card/80 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Archive className="h-3.5 w-3.5 text-primary" />
                    <span>Storage Available</span>
                </div>
                <div className="space-y-1">
                    <div className="flex items-end gap-2">
                        <div className="h-2 w-full bg-indigo-100 dark:bg-indigo-950/30 rounded-full overflow-hidden flex relative">
                            <div className="h-full bg-indigo-500 w-[75%] rounded-full"></div>
                        </div>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="font-bold">75%</span>
                        <span className="text-muted-foreground">Free: 25%</span>
                    </div>
                </div>
            </Card>

            {/* Total Items */}
            <Card className="p-3 shadow-sm bg-card/80 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded">
                        <PackageCheck className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span>Total Items</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold">189k</span>
                    <span className="text-[10px] font-medium text-emerald-600 flex items-center bg-emerald-100/50 dark:bg-emerald-900/20 px-1 rounded">
                        +43%
                    </span>
                </div>
            </Card>

            {/* Active workers */}
            <Card className="p-3 shadow-sm bg-card/80 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <div className="p-1 bg-indigo-100 dark:bg-indigo-900/30 rounded">
                        <Users className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span>Active workers</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold">200</span>
                </div>
            </Card>

            {/* Orders */}
            <Card className="p-3 shadow-sm bg-card/80 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <div className="p-1 bg-sky-100 dark:bg-sky-900/30 rounded">
                        <Truck className="h-3 w-3 text-sky-600 dark:text-sky-400" />
                    </div>
                    <span>Orders</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold">23k</span>
                    <span className="text-[10px] font-medium text-emerald-600 flex items-center bg-emerald-100/50 dark:bg-emerald-900/20 px-1 rounded">
                        +40%
                    </span>
                </div>
            </Card>

            {/* Stock utilization */}
            <Card className="p-3 shadow-sm bg-card/80 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <div className="p-1 bg-violet-100 dark:bg-violet-900/30 rounded">
                        <Archive className="h-3 w-3 text-violet-600 dark:text-violet-400" />
                    </div>
                    <span>Utilization</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold">78%</span>
                    <span className="text-[10px] font-medium text-rose-600 flex items-center bg-rose-100/50 dark:bg-rose-900/20 px-1 rounded">
                        -10%
                    </span>
                </div>
            </Card>
        </div>
    );
}
