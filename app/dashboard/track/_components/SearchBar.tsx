"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
    return (
        <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                    placeholder="Search..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="pl-9 h-10 bg-background dark:bg-card border-border transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
            </div>
            <Button
                variant="outline"
                size="icon"
                className="size-10 shrink-0 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
            >
                <SlidersHorizontal className="size-4" />
            </Button>
        </div>
    );
}
