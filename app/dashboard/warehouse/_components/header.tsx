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
import {
    Eye,
    Users,
    Settings,
    Search,
    Package,
    MapPin,
    X,
    Plus,
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
    onAddWarehouse?: () => void;
}

export function WarehouseHeader({
    warehouses,
    selectedWarehouseId,
    onWarehouseChange,
    onSearchResultClick,
    onAddWarehouse,
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
        <div className="flex items-center justify-between px-3 py-2 bg-[var(--w7-surface)] border-b border-[var(--w7-el-bd)] shadow-[0_1px_0_#fff] select-none">
            {/* Left: Zone Info */}
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <span className="text-lg font-bold text-black font-sans">{selectedWarehouse?.code || "SZ-01"}</span>
                    <span className="text-xs text-gray-500">Storage Zone</span>
                </div>

                <div className="flex items-center gap-2 ml-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 border border-[var(--w7-el-bd)] bg-white text-black text-xs shadow-inner">
                        <Eye className="h-3.5 w-3.5 text-blue-600" />
                        <span>{selectedWarehouse?.totalBlocks || 120}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 border border-[var(--w7-el-bd)] bg-white text-black text-xs shadow-inner">
                        <Users className="h-3.5 w-3.5 text-green-600" />
                        <span>{selectedWarehouse?.workers || 120}</span>
                    </div>
                </div>

                <Select value={selectedWarehouseId} onValueChange={(value) => value && onWarehouseChange(value)}>
                    <SelectTrigger className="w-[140px] h-[23px] text-xs bg-white border-[var(--w7-el-bd)] text-black rounded-[2px] shadow-[inset_0_0_0_1px_#fff]">
                        <SelectValue placeholder="Zone">{selectedWarehouse?.name || "Select"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {warehouses.map((warehouse) => (
                            <SelectItem key={warehouse.id} value={warehouse.id}>
                                {warehouse.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-md mx-4 relative" ref={searchRef}>
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        placeholder="Search products, SKUs, blocks..."
                        className="win7-input w-full pl-8 pr-8 text-sm placeholder:text-gray-400"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Search Results Dropdown */}
                {showDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#7f9db9] shadow-lg z-50 overflow-hidden">
                        {searchResults.length > 0 ? (
                            <div className="max-h-80 overflow-y-auto">
                                {searchResults.map((result, index) => {
                                    const CategoryIcon = getCategoryIcon(result.block.category);
                                    return (
                                        <button
                                            key={`${result.type}-${result.block.id}-${result.product?.id || index}`}
                                            onClick={() => handleResultClick(result)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#316ac5] hover:text-white group transition-colors text-left border-b border-gray-100 last:border-0"
                                        >
                                            <div className="p-1 px-2 group-hover:bg-white/20">
                                                {result.type === "product" ? (
                                                    <Package className="h-4 w-4 text-blue-500 group-hover:text-white" />
                                                ) : (
                                                    <CategoryIcon className="h-4 w-4 text-blue-500 group-hover:text-white" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium truncate">
                                                    {result.type === "product" ? result.product?.name : `Block ${result.block.name}`}
                                                </div>
                                                <div className="text-xs text-gray-500 group-hover:text-white/80 flex items-center gap-2">
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
                                                <div className="text-xs text-gray-400 group-hover:text-white">
                                                    {result.product?.quantity} qty
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="px-4 py-6 text-center text-gray-500 text-sm">
                                No results found for &quot;{searchQuery}&quot;
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Right: Live Status & Actions */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-white border border-[var(--w7-el-bd)] shadow-inner rounded-[2px]" title="System Online">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs text-black uppercase font-bold">Online</span>
                </div>
                <button
                    className="win7-btn text-xs flex items-center gap-1 px-2 py-1"
                    onClick={onAddWarehouse}
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add Warehouse
                </button>
                <button className="win7-btn px-2 py-1">
                    <Settings className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
