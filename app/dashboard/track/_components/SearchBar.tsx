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
                {/* Win7 Search input styling from _searchbox.scss */}
                <input
                    placeholder="Search deliveries..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{
                        font: 'var(--w7-font)',
                        fontSize: '9pt',
                        width: '100%',
                        height: '24px',
                        padding: '3px 28px 3px 8px',
                        border: '1px solid transparent',
                        borderRadius: '2px',
                        background: '#fff',
                        color: '#000',
                        boxShadow: 'inset 1px 1px 0 #8e8f8f, inset -1px -1px 0 #ccc',
                        outline: 'none',
                    }}
                    onFocus={(e) => {
                        e.currentTarget.style.boxShadow = 'inset 1px 1px 0 #3d7bad, inset -1px -1px 0 #a5d1e9'
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.boxShadow = 'inset 1px 1px 0 #8e8f8f, inset -1px -1px 0 #ccc'
                    }}
                />
                <Search
                    className="absolute right-2 top-1/2 -translate-y-1/2 size-3.5 pointer-events-none"
                    style={{ color: '#666' }}
                />
            </div>
            {/* Win7 Filter button */}
            <button
                className="win7-btn flex items-center justify-center"
                title="Filters"
                style={{
                    width: '26px',
                    height: '24px',
                    padding: 0,
                    minWidth: '26px',
                }}
            >
                <SlidersHorizontal className="size-3.5" style={{ color: '#000' }} />
            </button>
        </div>
    );
}
