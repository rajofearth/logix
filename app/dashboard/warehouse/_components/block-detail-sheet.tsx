"use client";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Block,
    formatCapacityPercentage,
    getCategoryIcon,
    getCategoryLabel,
} from "./types";
import {
    Package,
    Thermometer,
    Droplets,
    Clock,
    ArrowRightLeft,
    Plus,
    ClipboardList,
    AlertTriangle,
    Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BlockDetailSheetProps {
    block: Block | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function BlockDetailSheet({ block, open, onOpenChange }: BlockDetailSheetProps) {
    if (!block) return null;

    const usagePercent = formatCapacityPercentage(block.used, block.capacity);
    const categoryIcon = getCategoryIcon(block.category);
    const categoryLabel = getCategoryLabel(block.category);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg flex flex-col">
                <SheetHeader className="pb-4 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{categoryIcon}</span>
                            <div>
                                <SheetTitle className="text-xl">Block {block.name}</SheetTitle>
                                <SheetDescription>
                                    Location: Row {block.row}, Column {block.column}
                                </SheetDescription>
                            </div>
                        </div>
                        <Badge
                            className={cn(
                                "text-xs uppercase tracking-wide",
                                block.status === "critical" ? "bg-red-500 hover:bg-red-600" :
                                    block.status === "warning" ? "bg-amber-500 hover:bg-amber-600" :
                                        block.status === "empty" ? "bg-zinc-500 hover:bg-zinc-600" :
                                            "bg-emerald-500 hover:bg-emerald-600"
                            )}
                        >
                            {block.status}
                        </Badge>
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1 -mx-6 px-6">
                    <div className="space-y-6 py-4">
                        {/* Capacity Overview */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                Capacity Overview
                            </h4>
                            <div className="p-4 rounded-xl bg-muted/30 border">
                                <div className="flex items-baseline justify-between mb-2">
                                    <span className="text-3xl font-bold">{usagePercent}%</span>
                                    <span className="text-sm text-muted-foreground">
                                        {block.used.toLocaleString()} / {block.capacity.toLocaleString()} units
                                    </span>
                                </div>
                                <Progress value={usagePercent} className="h-3" />
                                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                    <span>Available: {(block.capacity - block.used).toLocaleString()} units</span>
                                    <span>Category: {categoryLabel}</span>
                                </div>
                            </div>
                        </div>

                        {/* Environment */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30">
                                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-1">
                                    <Thermometer className="h-4 w-4" />
                                    <span className="text-xs font-medium">Temperature</span>
                                </div>
                                <span className="text-lg font-bold">
                                    {block.temperature?.toFixed(1) ?? "--"}°C
                                </span>
                            </div>
                            <div className="p-3 rounded-lg bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900/30">
                                <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 mb-1">
                                    <Droplets className="h-4 w-4" />
                                    <span className="text-xs font-medium">Humidity</span>
                                </div>
                                <span className="text-lg font-bold">
                                    {block.humidity?.toFixed(0) ?? "--"}%
                                </span>
                            </div>
                        </div>

                        {/* Products List */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                                    Products ({block.products.length})
                                </h4>
                            </div>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                {block.products.map((product) => {
                                    const isExpiringSoon = product.expiryDate &&
                                        new Date(product.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                                    return (
                                        <div
                                            key={product.id}
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-lg border bg-card",
                                                isExpiringSoon && "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/10"
                                            )}
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm">{product.name}</span>
                                                    {isExpiringSoon && (
                                                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                                    <span className="font-mono">{product.sku}</span>
                                                    {product.expiryDate && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(product.expiryDate).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-bold text-sm">
                                                    {product.quantity.toLocaleString()}
                                                </span>
                                                <span className="text-xs text-muted-foreground ml-1">qty</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Last Activity */}
                        {block.lastActivity && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 bg-muted/30 rounded-lg">
                                <Clock className="h-3.5 w-3.5" />
                                <span>Last activity: {new Date(block.lastActivity).toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Quick Actions */}
                <div className="pt-4 border-t mt-auto">
                    <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                            <Plus className="h-3.5 w-3.5" />
                            Add Product
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                            <ArrowRightLeft className="h-3.5 w-3.5" />
                            Transfer
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                            <ClipboardList className="h-3.5 w-3.5" />
                            Picklist
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
