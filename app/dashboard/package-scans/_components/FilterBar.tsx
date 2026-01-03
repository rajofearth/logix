"use client";

import { IconFilter, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface FilterBarProps {
    phase: string;
    passed: string;
    onPhaseChange: (value: string) => void;
    onPassedChange: (value: string) => void;
    onClearFilters: () => void;
}

export function FilterBar({
    phase,
    passed,
    onPhaseChange,
    onPassedChange,
    onClearFilters,
}: FilterBarProps) {
    const hasFilters = phase !== "all" || passed !== "all";

    return (
        <div className="flex items-center gap-2 px-4 lg:px-6">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                        <IconFilter className="size-4" />
                        Phase
                        {phase !== "all" && (
                            <Badge variant="secondary" className="ml-1 px-1.5">
                                {phase}
                            </Badge>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Filter by phase</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={phase} onValueChange={onPhaseChange}>
                        <DropdownMenuRadioItem value="all">All phases</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="pickup">Pickup only</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="delivery">Delivery only</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                        <IconFilter className="size-4" />
                        Status
                        {passed !== "all" && (
                            <Badge variant={passed === "true" ? "default" : "destructive"} className="ml-1 px-1.5">
                                {passed === "true" ? "Passed" : "Failed"}
                            </Badge>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={passed} onValueChange={onPassedChange}>
                        <DropdownMenuRadioItem value="all">All statuses</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="true">Passed only</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="false">Failed only</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            {hasFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    className="gap-2 text-muted-foreground"
                >
                    <IconX className="size-4" />
                    Clear filters
                </Button>
            )}
        </div>
    );
}
