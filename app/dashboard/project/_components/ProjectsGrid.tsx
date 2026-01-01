"use client"

import type { ProjectDTO } from "../_types"
import { ProjectCard } from "./ProjectCard"
import { Skeleton } from "@/components/ui/skeleton"

interface ProjectsGridProps {
    projects: ProjectDTO[]
    isLoading: boolean
    onProjectClick: (project: ProjectDTO) => void
}

export function ProjectsGrid({ projects, isLoading, onProjectClick }: ProjectsGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-lg border bg-card p-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <Skeleton className="size-10 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-4/5" />
                        <Skeleton className="h-1.5 w-full" />
                        <div className="flex justify-between">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <svg
                        className="size-8 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                        />
                    </svg>
                </div>
                <h3 className="text-sm font-medium text-foreground mb-1">No projects found</h3>
                <p className="text-xs text-muted-foreground">
                    Try adjusting your search or filter criteria.
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
                <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => onProjectClick(project)}
                />
            ))}
        </div>
    )
}
