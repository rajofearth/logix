"use client"

import * as React from "react"
import { IconEye, IconMessageCircle, IconPlus } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import type { Team, TeamStatus } from "../_server/teamsData"

interface TeamsTableProps {
    teams: Team[]
    visibleColumns: Record<string, boolean>
    onView: (team: Team) => void
    onComment: (team: Team, event: React.MouseEvent<HTMLButtonElement>) => void
    onAddTeam: () => void
}

function getStatusBadge(status: TeamStatus) {
    const config: Record<TeamStatus, { className: string; label: string }> = {
        healthy: {
            className: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 border-green-500/20",
            label: "Healthy",
        },
        at_risk: {
            className: "bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-500/20",
            label: "At Risk",
        },
        overdue: {
            className: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 border-red-500/20",
            label: "Overdue",
        },
    }
    const { className, label } = config[status]
    return <Badge variant="outline" className={className}>{label}</Badge>
}

export function TeamsTable({
    teams,
    visibleColumns,
    onView,
    onComment,
    onAddTeam,
}: TeamsTableProps) {
    const showColumn = (id: string) => visibleColumns[id] !== false

    if (teams.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-muted-foreground mb-4">
                    <svg
                        className="mx-auto size-12 opacity-50"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">No teams yet</h3>
                <p className="text-muted-foreground text-sm mb-4">
                    Get started by creating your first team
                </p>
                <Button onClick={onAddTeam}>
                    <IconPlus className="size-4" />
                    Add Team
                </Button>
            </div>
        )
    }

    return (
        <div className="overflow-hidden rounded-lg border">
            <Table>
                <TableHeader className="bg-muted">
                    <TableRow>
                        <TableHead>Team Name</TableHead>
                        {showColumn("progress") && (
                            <TableHead className="w-[180px]">Progress %</TableHead>
                        )}
                        {showColumn("topKpi") && <TableHead>Top KPI</TableHead>}
                        {showColumn("status") && <TableHead>Status</TableHead>}
                        {showColumn("lastReportDate") && (
                            <TableHead>Last Report Date</TableHead>
                        )}
                        {showColumn("actions") && (
                            <TableHead className="w-[100px]">Actions</TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {teams.map((team) => (
                        <TableRow key={team.id}>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium">{team.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        Lead: {team.lead}
                                    </span>
                                </div>
                            </TableCell>
                            {showColumn("progress") && (
                                <TableCell>
                                    <Progress value={team.progress} className="w-full">
                                        <div className="flex items-center justify-between w-full">
                                            <ProgressLabel className="text-xs">
                                                {team.progress}%
                                            </ProgressLabel>
                                            <ProgressValue />
                                        </div>
                                    </Progress>
                                </TableCell>
                            )}
                            {showColumn("topKpi") && (
                                <TableCell>
                                    <span className="text-sm">
                                        {team.topKpi}: <span className="font-medium">{team.kpiValue}</span>
                                    </span>
                                </TableCell>
                            )}
                            {showColumn("status") && (
                                <TableCell>{getStatusBadge(team.status)}</TableCell>
                            )}
                            {showColumn("lastReportDate") && (
                                <TableCell className="text-muted-foreground text-sm">
                                    {team.lastReportDate}
                                </TableCell>
                            )}
                            {showColumn("actions") && (
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => onView(team)}
                                            title="View Report"
                                        >
                                            <IconEye className="size-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={(e) => onComment(team, e)}
                                            title="Comment"
                                        >
                                            <IconMessageCircle className="size-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
