"use client";

import { useState } from "react";
import { Floor, Block, getCategoryLabel } from "./types";
import { BlockCard, BlockLegend } from "./block-card";
import { BlockDetailSheet } from "./block-detail-sheet";

interface WarehouseGridProps {
    floor: Floor;
    highlightedBlockId?: string | null;
    warehouseId?: string;
    onRefresh?: () => void;
}

export function WarehouseVisualGrid({ floor, highlightedBlockId, warehouseId, onRefresh }: WarehouseGridProps) {
    const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    // Group blocks by category for section display
    const blocksByCategory = floor.blocks.reduce<Record<string, Block[]>>((acc, block) => {
        const category = block.category;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(block);
        return acc;
    }, {});

    const categories = Object.keys(blocksByCategory);

    const handleBlockClick = (block: Block) => {
        setSelectedBlock(block);
        setSheetOpen(true);
    };

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Category Sections */}
            <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {categories.map((category) => (
                        <div
                            key={category}
                            className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800"
                        >
                            {/* Section Header */}
                            <div className="mb-4">
                                <span className="text-xs font-medium text-zinc-300 bg-zinc-800 px-2 py-1 rounded">
                                    {floor.name} - {getCategoryLabel(category as any)}
                                </span>
                            </div>

                            {/* Blocks Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {blocksByCategory[category]
                                    .sort((a, b) => a.column - b.column)
                                    .map((block) => (
                                        <BlockCard
                                            key={block.id}
                                            block={block}
                                            onClick={handleBlockClick}
                                            isHighlighted={block.id === highlightedBlockId}
                                        />
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="shrink-0 flex justify-end">
                <BlockLegend />
            </div>

            {/* Block Detail Sheet */}
            <BlockDetailSheet
                block={selectedBlock}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                warehouseId={warehouseId}
                floorId={floor.id}
                onRefresh={onRefresh}
            />
        </div>
    );
}
