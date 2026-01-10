"use client"

import * as React from "react"
import { toast } from "sonner"

import { TeamsFilterBar } from "./_components/TeamsFilterBar"
import { TeamsTable } from "./_components/TeamsTable"
import { TeamAlertBanner } from "./_components/TeamAlertBanner"
import { TeamProgressTrendChart } from "./_components/TeamProgressTrendChart"
import { AddTeamModal } from "./_components/AddTeamModal"
import { ViewReportModal } from "./_components/ViewReportModal"
import { CommentPopoverStandalone } from "./_components/CommentPopover"

import {
    mockTeams,
    mockAlerts,
    type Team,
    type TeamAlert,
} from "./_server/teamsData"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function TeamsPage() {
    // Filter state
    const [searchQuery, setSearchQuery] = React.useState("")
    const [departmentFilter, setDepartmentFilter] = React.useState("all")
    const [statusFilter, setStatusFilter] = React.useState("all")
    const [visibleColumns, setVisibleColumns] = React.useState<Record<string, boolean>>({
        progress: true,
        topKpi: true,
        status: true,
        lastReportDate: true,
        actions: true,
    })

    // Data state
    const [teams, setTeams] = React.useState<Team[]>(mockTeams)
    const [alerts, setAlerts] = React.useState<TeamAlert[]>(mockAlerts)

    // Modal state
    const [addModalOpen, setAddModalOpen] = React.useState(false)
    const [viewModalOpen, setViewModalOpen] = React.useState(false)
    const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null)

    // Comment popover state
    const [commentPopoverOpen, setCommentPopoverOpen] = React.useState(false)
    const [commentTeam, setCommentTeam] = React.useState<Team | null>(null)
    const commentTriggerRef = React.useRef<HTMLButtonElement | null>(null)

    // Filter teams
    const filteredTeams = React.useMemo(() => {
        return teams.filter((team) => {
            const matchesSearch =
                team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                team.lead.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesDepartment =
                departmentFilter === "all" || team.department === departmentFilter
            const matchesStatus =
                statusFilter === "all" || team.status === statusFilter
            return matchesSearch && matchesDepartment && matchesStatus
        })
    }, [teams, searchQuery, departmentFilter, statusFilter])

    // Handlers
    const handleColumnVisibilityChange = (column: string, visible: boolean) => {
        setVisibleColumns((prev) => ({ ...prev, [column]: visible }))
    }

    const handleAddTeam = (data: { name: string; description: string; kpi: string }) => {
        const newTeam: Team = {
            id: `team-${Date.now()}`,
            name: data.name,
            progress: 0,
            topKpi: data.kpi,
            kpiValue: "0%",
            status: "healthy",
            lastReportDate: "Just now",
            lead: "Unassigned",
            department: "operations",
        }
        setTeams((prev) => [...prev, newTeam])
        toast.success(`Team "${data.name}" created successfully`)
    }

    const handleViewTeam = (team: Team) => {
        setSelectedTeam(team)
        setViewModalOpen(true)
    }

    const handleCommentClick = (team: Team, event: React.MouseEvent<HTMLButtonElement>) => {
        setCommentTeam(team)
        commentTriggerRef.current = event.currentTarget
        setCommentPopoverOpen(true)
    }

    const handleSendComment = (teamId: string, content: string) => {
        toast.success(`Comment sent to team`)
        console.log("Comment sent:", { teamId, content })
    }

    const handleResolveAlert = (alertId: string) => {
        setAlerts((prev) => prev.filter((a) => a.id !== alertId))
        toast.success("Alert resolved")
    }

    const handleDismissAlert = (alertId: string) => {
        setAlerts((prev) => prev.filter((a) => a.id !== alertId))
    }

    return (
        <DashboardShell title="Team Management and Monitoring">
            <div className="flex flex-col gap-4 bg-[#ece9d8]">
                <div className="flex flex-col gap-4 p-4">
                    {/* Page Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold font-sans">Teams</h1>
                            <p className="text-xs text-gray-500">
                                Monitor team progress and performance
                            </p>
                        </div>
                    </div>

                    {/* Alert Banner */}
                    <div className="win7-groupbox border-red-500">
                        <legend className="text-red-500">Alerts</legend>
                        <div className="win7-p-4">
                            <TeamAlertBanner
                                alerts={alerts}
                                onResolve={handleResolveAlert}
                                onDismiss={handleDismissAlert}
                            />
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="win7-groupbox">
                        <legend>Search and Filter</legend>
                        <div className="win7-p-4 text-xs">
                            <TeamsFilterBar
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                                departmentFilter={departmentFilter}
                                onDepartmentChange={setDepartmentFilter}
                                statusFilter={statusFilter}
                                onStatusChange={setStatusFilter}
                                onAddTeam={() => setAddModalOpen(true)}
                                visibleColumns={visibleColumns}
                                onColumnVisibilityChange={handleColumnVisibilityChange}
                            />
                        </div>
                    </div>

                    {/* Teams Table */}
                    <TeamsTable
                        teams={filteredTeams}
                        visibleColumns={visibleColumns}
                        onView={handleViewTeam}
                        onComment={handleCommentClick}
                        onAddTeam={() => setAddModalOpen(true)}
                    />

                    {/* Trend Chart */}
                    <div className="win7-groupbox">
                        <legend>Performance Trends</legend>
                        <div className="win7-p-4">
                            <TeamProgressTrendChart />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AddTeamModal
                open={addModalOpen}
                onOpenChange={setAddModalOpen}
                onSubmit={handleAddTeam}
            />

            <ViewReportModal
                open={viewModalOpen}
                onOpenChange={setViewModalOpen}
                team={selectedTeam}
            />

            {/* Comment Popover */}
            <CommentPopoverStandalone
                team={commentTeam}
                open={commentPopoverOpen}
                onOpenChange={setCommentPopoverOpen}
                onSend={handleSendComment}
                triggerRef={commentTriggerRef}
            />
        </DashboardShell>
    )
}
