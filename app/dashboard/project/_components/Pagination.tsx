"use client"

import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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
            <div className="text-xs text-muted-foreground">
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
            <div className="text-xs text-muted-foreground">
                Showing {(currentPage - 1) * 6 + 1}-{Math.min(currentPage * 6, totalItems)} of {totalItems} results
            </div>

            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                >
                    <IconChevronLeft className="size-3.5" />
                </Button>

                {getPageNumbers().map((page, idx) =>
                    page === "..." ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground text-xs">
                            ...
                        </span>
                    ) : (
                        <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="icon-sm"
                            onClick={() => onPageChange(page)}
                            className={cn(
                                "min-w-6",
                                currentPage === page && "pointer-events-none"
                            )}
                        >
                            {page}
                        </Button>
                    )
                )}

                <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                >
                    <IconChevronRight className="size-3.5" />
                </Button>
            </div>
        </div>
    )
}
