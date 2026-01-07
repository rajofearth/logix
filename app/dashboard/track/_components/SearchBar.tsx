"use client";

import { Search, SlidersHorizontal } from "lucide-react";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
    return (
        <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-gray-500 pointer-events-none" />
                <input
                    placeholder="Search deliveries..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="pl-7 pr-2 h-7 w-full border border-[#7f9db9] text-xs font-sans outline-none focus:border-[#3399ff]"
                    style={{
                        background: '#fff',
                        borderRadius: 0,
                    }}
                />
            </div>
            {/* Filter button - usually disabled or opens a dialog? Using Win7 button style */}
            <button
                className="win7-btn h-7 w-7 flex items-center justify-center p-0"
                title="Filters"
            >
                <SlidersHorizontal className="size-3.5" />
            </button>
        </div>
    );
}
