"use client"

import * as React from "react"
import { IconBriefcase, IconSearch } from "@tabler/icons-react"

import type { ProjectStatus } from "./_types"
import type { ProjectDTO } from "./_types"
import type { ProjectStats } from "./_types"
import { listProjects, getProjectStats } from "./_server/projectActions"
import { ProjectFilters } from "./_components/ProjectFilters"
import { ProjectsGrid } from "./_components/ProjectsGrid"
import { Pagination } from "./_components/Pagination"
import { ProjectDetailsSheet } from "./_components/ProjectDetailsSheet"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function ProjectsPage() {
    const [projects, setProjects] = React.useState<ProjectDTO[]>([])
    const [stats, setStats] = React.useState<ProjectStats>({
        all: 0,
        active: 0,
        completed: 0,
        onHold: 0,
        pending: 0,
    })
    const [isLoading, setIsLoading] = React.useState(true)
    const [filter, setFilter] = React.useState<ProjectStatus | "all">("all")
    const [search, setSearch] = React.useState("")
    const [page, setPage] = React.useState(1)
    const [totalPages, setTotalPages] = React.useState(1)
    const [totalItems, setTotalItems] = React.useState(0)

    // Sheet state
    const [selectedProject, setSelectedProject] = React.useState<ProjectDTO | null>(null)
    const [isSheetOpen, setIsSheetOpen] = React.useState(false)

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = React.useState("")
    React.useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300)
        return () => clearTimeout(timer)
    }, [search])

    // Fetch stats on mount
    React.useEffect(() => {
        getProjectStats().then(setStats)
    }, [])

    // Fetch projects when filter/search/page changes
    React.useEffect(() => {
        setIsLoading(true)
        listProjects(filter, debouncedSearch, page)
            .then((result) => {
                setProjects(result.projects)
                setTotalPages(result.totalPages)
                setTotalItems(result.total)
            })
            .finally(() => setIsLoading(false))
    }, [filter, debouncedSearch, page])

    // Reset to page 1 when filter or search changes
    React.useEffect(() => {
        setPage(1)
    }, [filter, debouncedSearch])

    // Handle project card click
    const handleProjectClick = (project: ProjectDTO) => {
        setSelectedProject(project)
        setIsSheetOpen(true)
    }

    return (
        <DashboardShell title="Project Management" >
            <div className="flex flex-col h-full bg-[#ece9d8]">
                {/* Header Toolbar */}
                <div className="flex items-center justify-between p-2 border-b border-white shadow-[0_1px_0_#aca899] mb-2">
                    <div className="flex items-center gap-2">
                        <IconBriefcase className="size-5 text-gray-500" />
                        <span className="font-bold text-sm">Active Projects</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Filters & Search - wrapped in groupbox if possible, or just placed */}
                    <div className="win7-groupbox">
                        <legend>Project Filters</legend>
                        <div className="win7-p-4">
                            <ProjectFilters
                                stats={stats}
                                activeFilter={filter}
                                onFilterChange={setFilter}
                                search={search}
                                onSearchChange={setSearch}
                            />
                        </div>
                    </div>

                    {/* Projects Grid */}
                    <div className="win7-inset-border bg-white p-4 min-h-[400px]">
                        <ProjectsGrid
                            projects={projects}
                            isLoading={isLoading}
                            onProjectClick={handleProjectClick}
                        />
                    </div>

                    {/* Pagination */}
                    {totalItems > 0 && (
                        <div className="flex justify-center pt-2">
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                totalItems={totalItems}
                                onPageChange={setPage}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Project Details Sheet */}
            <ProjectDetailsSheet
                project={selectedProject}
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
            />
        </DashboardShell>
    )
}
