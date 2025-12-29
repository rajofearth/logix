"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Eye,
    Users,
    Settings,
    Search,
    Package,
    MapPin,
    X,
} from "lucide-react";
import { Warehouse, Block, Product, getCategoryIcon } from "./types";

interface SearchResult {
    type: "product" | "block";
    product?: Product;
    block: Block;
    floorName: string;
    floorId: string;
}

interface WarehouseHeaderProps {
    warehouses: Warehouse[];
    selectedWarehouseId: string;
    onWarehouseChange: (warehouseId: string) => void;
    onSearchResultClick?: (floorId: string, blockId: string) => void;
}

export function WarehouseHeader({
    warehouses,
    selectedWarehouseId,
    onWarehouseChange,
    onSearchResultClick,
}: WarehouseHeaderProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const selectedWarehouse = warehouses.find((w) => w.id === selectedWarehouseId);

    // Search through all products and blocks
    const searchResults = useMemo(() => {
        if (!searchQuery.trim() || !selectedWarehouse) return [];

        const query = searchQuery.toLowerCase();
        const results: SearchResult[] = [];

        for (const floor of selectedWarehouse.floors) {
            for (const block of floor.blocks) {
                // Search by block name
                if (block.name.toLowerCase().includes(query) || block.id.toLowerCase().includes(query)) {
                    results.push({
                        type: "block",
                        block,
                        floorName: floor.name,
                        floorId: floor.id,
                    });
                }

                // Search by product name or SKU
                for (const product of block.products) {
                    if (
                        product.name.toLowerCase().includes(query) ||
                        product.sku.toLowerCase().includes(query)
                    ) {
                        results.push({
                            type: "product",
                            product,
                            block,
                            floorName: floor.name,
                            floorId: floor.id,
                        });
                    }
                }
            }
        }

        return results.slice(0, 10); // Limit to 10 results
    }, [searchQuery, selectedWarehouse]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleResultClick = (result: SearchResult) => {
        if (onSearchResultClick) {
            onSearchResultClick(result.floorId, result.block.id);
        }
        setSearchQuery("");
        setIsSearchFocused(false);
    };

    const showDropdown = isSearchFocused && searchQuery.trim().length > 0;

    return (
        <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-zinc-900/80 border border-zinc-800 shrink-0">
            {/* Left: Zone Info */}
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <span className="text-lg font-bold text-white">{selectedWarehouse?.code || "SZ-01"}</span>
                    <span className="text-xs text-zinc-400">Storage Zone</span>
                </div>

                <div className="flex items-center gap-2 ml-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-xs">
                        <Eye className="h-3.5 w-3.5" />
                        <span>{selectedWarehouse?.totalBlocks || 120}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-xs">
                        <Users className="h-3.5 w-3.5" />
                        <span>{selectedWarehouse?.workers || 120}</span>
                    </div>
                </div>

                <Select value={selectedWarehouseId} onValueChange={(value) => value && onWarehouseChange(value)}>
                    <SelectTrigger className="w-[120px] h-8 text-xs bg-zinc-800 border-zinc-700 text-zinc-300">
                        <SelectValue placeholder="Zone" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                        {warehouses.map((warehouse) => (
                            <SelectItem key={warehouse.id} value={warehouse.id} className="text-zinc-300">
                                {warehouse.code}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-md mx-4 relative" ref={searchRef}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        placeholder="Search products, SKUs, blocks..."
                        className="w-full h-9 pl-9 pr-9 rounded-md bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Search Results Dropdown */}
                {showDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden">
                        {searchResults.length > 0 ? (
                            <div className="max-h-80 overflow-y-auto">
                                {searchResults.map((result, index) => {
                                    const CategoryIcon = getCategoryIcon(result.block.category);
                                    return (
                                        <button
                                            key={`${result.type}-${result.block.id}-${result.product?.id || index}`}
                                            onClick={() => handleResultClick(result)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-800 transition-colors text-left border-b border-zinc-800 last:border-0"
                                        >
                                            <div className="p-1.5 rounded bg-zinc-800">
                                                {result.type === "product" ? (
                                                    <Package className="h-4 w-4 text-zinc-400" />
                                                ) : (
                                                    <CategoryIcon className="h-4 w-4 text-zinc-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm text-white font-medium truncate">
                                                    {result.type === "product" ? result.product?.name : `Block ${result.block.name}`}
                                                </div>
                                                <div className="text-xs text-zinc-500 flex items-center gap-2">
                                                    {result.type === "product" && (
                                                        <>
                                                            <span className="font-mono">{result.product?.sku}</span>
                                                            <span>•</span>
                                                        </>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {result.floorName}, Block {result.block.name}
                                                    </span>
                                                </div>
                                            </div>
                                            {result.type === "product" && (
                                                <div className="text-xs text-zinc-400">
                                                    {result.product?.quantity} qty
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="px-4 py-6 text-center text-zinc-500 text-sm">
                                No results found for "{searchQuery}"
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Right: Live Status & Actions */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-800 border border-zinc-700">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="text-xs text-zinc-300">Live Data</span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                    <Settings className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
