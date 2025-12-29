"use client";

import {
    Monitor,
    UtensilsCrossed,
    Shirt,
    Pill,
    Cog,
    Package,
    Box,
    ClipboardList,
    LucideIcon,
} from "lucide-react";

// Warehouse Management Types

export interface Product {
    id: string;
    sku: string;
    name: string;
    quantity: number;
    category: ProductCategory;
    expiryDate?: Date;
    lastUpdated: Date;
}

export type ProductCategory =
    | "electronics"
    | "food"
    | "apparel"
    | "pharmaceuticals"
    | "machinery"
    | "raw-materials"
    | "packaging"
    | "other";

export type BlockStatus = "normal" | "warning" | "critical" | "empty";

export interface Block {
    id: string;
    name: string;
    row: string; // A, B, C, etc.
    column: number; // 1, 2, 3, etc.
    capacity: number;
    used: number;
    status: BlockStatus;
    category: ProductCategory;
    products: Product[];
    temperature?: number;
    humidity?: number;
    lastActivity?: Date;
}

export interface FloorStats {
    totalCapacity: number;
    usedCapacity: number;
    totalItems: number;
    activeWorkers: number;
    averageTemperature?: number;
    averageHumidity?: number;
}

export interface Floor {
    id: string;
    name: string;
    level: number;
    blocks: Block[];
    stats: FloorStats;
}

export interface Warehouse {
    id: string;
    name: string;
    code: string;
    address: string;
    city: string;
    totalFloors: number;
    totalBlocks: number;
    totalCapacity: number;
    usedCapacity: number;
    floors: Floor[];
    workers: number;
    lastUpdated: Date;
}

// Helper functions
export function getBlockStatus(used: number, capacity: number): BlockStatus {
    const percentage = (used / capacity) * 100;
    if (percentage === 0) return "empty";
    if (percentage >= 90) return "critical";
    if (percentage >= 70) return "warning";
    return "normal";
}

export function getStatusColor(status: BlockStatus): string {
    switch (status) {
        case "critical":
            return "bg-red-500";
        case "warning":
            return "bg-amber-500";
        case "normal":
            return "bg-emerald-500";
        case "empty":
            return "bg-zinc-300 dark:bg-zinc-700";
    }
}

export function getCategoryIcon(category: ProductCategory): LucideIcon {
    switch (category) {
        case "electronics":
            return Monitor;
        case "food":
            return UtensilsCrossed;
        case "apparel":
            return Shirt;
        case "pharmaceuticals":
            return Pill;
        case "machinery":
            return Cog;
        case "raw-materials":
            return Package;
        case "packaging":
            return Box;
        default:
            return ClipboardList;
    }
}

export function getCategoryLabel(category: ProductCategory): string {
    switch (category) {
        case "electronics":
            return "Electronics";
        case "food":
            return "Food & Beverages";
        case "apparel":
            return "Apparel";
        case "pharmaceuticals":
            return "Pharmaceuticals";
        case "machinery":
            return "Machinery";
        case "raw-materials":
            return "Raw Materials";
        case "packaging":
            return "Packaging";
        default:
            return "Other";
    }
}

export function formatCapacityPercentage(used: number, capacity: number): number {
    return Math.round((used / capacity) * 100);
}
