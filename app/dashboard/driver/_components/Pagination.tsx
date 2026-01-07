"use client"

import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

interface PaginationProps {
    currentPage: number
    totalPages: number
    totalItems: number
    onPageChange: (page: number) => void
}

export function Pagination({
    currentPage,
    totalPages,
    totalItems,
    onPageChange,
}: PaginationProps) {
    if (totalPages <= 1) {
        return (
            <div className="text-xs text-black">
                Showing {totalItems} of {totalItems} results
            </div>
        )
    }

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages: (number | "...")[] = []

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            pages.push(1)
            if (currentPage > 3) pages.push("...")
            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)
            for (let i = start; i <= end; i++) pages.push(i)
            if (currentPage < totalPages - 2) pages.push("...")
            pages.push(totalPages)
        }
        return pages
    }

    return (
        <div className="flex items-center justify-between gap-4">
            <div className="text-xs text-black">
                Showing {(currentPage - 1) * 6 + 1}-{Math.min(currentPage * 6, totalItems)} of {totalItems} results
            </div>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="win7-btn min-w-[24px] h-[24px] px-1 flex items-center justify-center disabled:opacity-50"
                >
                    <IconChevronLeft className="size-3" />
                </button>

                {getPageNumbers().map((page, idx) =>
                    page === "..." ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-black text-xs">
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => onPageChange(page as number)}
                            className={cn(
                                "win7-btn min-w-[24px] h-[24px] px-1 text-xs font-sans",
                                currentPage === page && "font-bold bg-[#e3e3e3] border-[#8e8f8f] active" // Simulate active/pressed state
                            )}
                            disabled={currentPage === page}
                        >
                            {page}
                        </button>
                    )
                )}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="win7-btn min-w-[24px] h-[24px] px-1 flex items-center justify-center disabled:opacity-50"
                >
                    <IconChevronRight className="size-3" />
                </button>
            </div>
        </div>
    )
}
