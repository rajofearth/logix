"use client";

import { useState } from "react";
import { Floor, Block } from "./types";
import { BlockCard, BlockLegend } from "./block-card";
import { BlockDetailSheet } from "./block-detail-sheet";

interface WarehouseGridProps {
    floor: Floor;
}

export function WarehouseVisualGrid({ floor }: WarehouseGridProps) {
    const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    // Group blocks by row for grid layout
    const blocksByRow = floor.blocks.reduce<Record<string, Block[]>>((acc, block) => {
        if (!acc[block.row]) {
            acc[block.row] = [];
        }
        acc[block.row].push(block);
        return acc;
    }, {});

    // Sort rows alphabetically
    const sortedRows = Object.keys(blocksByRow).sort();

    const handleBlockClick = (block: Block) => {
        setSelectedBlock(block);
        setSheetOpen(true);
    };

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Block Grid */}
            <div className="flex-1 overflow-auto">
                <div className="space-y-3">
                    {sortedRows.map((row) => (
                        <div key={row} className="flex gap-3 items-stretch">
                            {/* Row Label */}
                            <div className="w-8 shrink-0 flex items-center justify-center">
                                <span className="text-sm font-bold text-muted-foreground bg-muted/50 rounded-md px-2 py-1">
                                    {row}
                                </span>
                            </div>
                            {/* Blocks in this row */}
                            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                {blocksByRow[row]
                                    .sort((a, b) => a.column - b.column)
                                    .map((block) => (
                                        <BlockCard
                                            key={block.id}
                                            block={block}
                                            onClick={handleBlockClick}
                                        />
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="shrink-0">
                <BlockLegend />
            </div>

            {/* Block Detail Sheet */}
            <BlockDetailSheet
                block={selectedBlock}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
            />
        </div>
    );
}
