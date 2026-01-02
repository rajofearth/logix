"use client"

import * as React from "react"
import { IconChevronDown, IconLayoutColumns, IconPlus, IconSearch } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { departmentOptions, statusOptions } from "../_server/teamsData"

interface TeamsFilterBarProps {
    searchQuery: string
    onSearchChange: (value: string) => void
    departmentFilter: string
    onDepartmentChange: (value: string) => void
    statusFilter: string
    onStatusChange: (value: string) => void
    onAddTeam: () => void
    visibleColumns: Record<string, boolean>
    onColumnVisibilityChange: (column: string, visible: boolean) => void
}

const availableColumns = [
    { id: "progress", label: "Progress %" },
    { id: "topKpi", label: "Top KPI" },
    { id: "status", label: "Status" },
    { id: "lastReportDate", label: "Last Report Date" },
    { id: "actions", label: "Actions" },
]

export function TeamsFilterBar({
    searchQuery,
    onSearchChange,
    departmentFilter,
    onDepartmentChange,
    statusFilter,
    onStatusChange,
    onAddTeam,
    visibleColumns,
    onColumnVisibilityChange,
}: TeamsFilterBarProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                    placeholder="Search teams by name or lead"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9"
                />
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Select value={departmentFilter} onValueChange={(value) => value && onDepartmentChange(value)}>
                    <SelectTrigger className="w-[140px]" size="sm">
                        <SelectValue placeholder="All Teams" />
                    </SelectTrigger>
                    <SelectContent>
                        {departmentOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={(value) => value && onStatusChange(value)}>
                    <SelectTrigger className="w-[120px]" size="sm">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
                        <IconLayoutColumns className="size-4" />
                        <span className="hidden lg:inline">Customize Columns</span>
                        <span className="lg:hidden">Columns</span>
                        <IconChevronDown className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        {availableColumns.map((column) => (
                            <DropdownMenuCheckboxItem
                                key={column.id}
                                checked={visibleColumns[column.id] !== false}
                                onCheckedChange={(checked) =>
                                    onColumnVisibilityChange(column.id, checked)
                                }
                            >
                                {column.label}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button size="sm" onClick={onAddTeam}>
                    <IconPlus className="size-4" />
                    <span className="hidden sm:inline">Add Team</span>
                </Button>
            </div>
        </div>
    )
}
