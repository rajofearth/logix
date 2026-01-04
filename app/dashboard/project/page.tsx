"use client"

import * as React from "react"

import type { ProjectStatus } from "./_types"
import type { ProjectDTO } from "./_types"
import type { ProjectStats } from "./_types"
import { listProjects, getProjectStats } from "./_server/projectActions"
import { ProjectFilters } from "./_components/ProjectFilters"
import { ProjectsGrid } from "./_components/ProjectsGrid"
import { Pagination } from "./_components/Pagination"
import { ProjectDetailsSheet } from "./_components/ProjectDetailsSheet"

import { DashboardPage } from "@/components/dashboard/crm/DashboardPage"

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
        <DashboardPage title="Projects" className="p-0">
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 px-4 md:gap-6 md:py-6 lg:px-6">
                        {/* Filters & Search */}
                        <ProjectFilters
                            stats={stats}
                            activeFilter={filter}
                            onFilterChange={setFilter}
                            search={search}
                            onSearchChange={setSearch}
                        />

                        {/* Projects Grid */}
                        <ProjectsGrid
                            projects={projects}
                            isLoading={isLoading}
                            onProjectClick={handleProjectClick}
                        />

                        {/* Pagination - always visible when there are items */}
                        {totalItems > 0 && (
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                totalItems={totalItems}
                                onPageChange={setPage}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Project Details Sheet */}
            <ProjectDetailsSheet
                project={selectedProject}
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
            />
        </DashboardPage>
    )
}
