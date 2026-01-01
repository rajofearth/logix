"use client"

import { IconFolder, IconCalendar, IconUsers } from "@tabler/icons-react"

import type { ProjectDTO } from "../_types"
import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const statusConfig = {
    active: {
        label: "Active",
        ringColor: "ring-primary",
        badgeClass: "bg-primary/10 text-primary",
        dotColor: "bg-primary",
        nameHoverColor: "group-hover:text-primary",
    },
    completed: {
        label: "Completed",
        ringColor: "ring-emerald-500",
        badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        dotColor: "bg-emerald-500",
        nameHoverColor: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
    },
    "on-hold": {
        label: "On Hold",
        ringColor: "ring-muted-foreground/50",
        badgeClass: "bg-muted text-muted-foreground",
        dotColor: "bg-muted-foreground/50",
        nameHoverColor: "group-hover:text-muted-foreground",
    },
    pending: {
        label: "Pending",
        ringColor: "ring-amber-500",
        badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        dotColor: "bg-amber-500",
        nameHoverColor: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
    },
}

interface ProjectCardProps {
    project: ProjectDTO
    onClick?: () => void
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
    const status = statusConfig[project.status]
    const displayedMembers = project.teamMembers.slice(0, 3)
    const extraMembers = project.teamMembers.length - 3

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }

    return (
        <Card
            onClick={onClick}
            className={cn(
                "group relative overflow-hidden transition-all duration-300",
                "hover:shadow-lg hover:-translate-y-1 hover:border-primary/20",
                "cursor-pointer"
            )}
        >
            {/* Status indicator line */}
            <div
                className={cn(
                    "absolute top-0 left-0 right-0 h-0.5 transition-all duration-300",
                    status.dotColor,
                    "group-hover:h-1"
                )}
            />

            <CardContent className="pt-5 pb-4">
                {/* Header: Icon + Name/Status */}
                <div className="flex items-start gap-3 mb-3">
                    <div
                        className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors",
                            "bg-primary/10 text-primary"
                        )}
                    >
                        <IconFolder className="size-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3
                            className={cn(
                                "font-semibold text-sm truncate text-foreground transition-colors",
                                status.nameHoverColor
                            )}
                        >
                            {project.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge
                                variant="secondary"
                                className={cn("text-[0.6rem] font-medium", status.badgeClass)}
                            >
                                {status.label}
                            </Badge>
                            {project.client && (
                                <span className="text-xs text-muted-foreground truncate">
                                    {project.client}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Description */}
                {project.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {project.description}
                    </p>
                )}

                {/* Progress */}
                <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium text-foreground">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-1.5" />
                </div>

                {/* Footer: Team + Due Date */}
                <div className="flex items-center justify-between">
                    {/* Team Avatars */}
                    <div className="flex items-center gap-1">
                        <IconUsers className="size-3.5 text-muted-foreground mr-1" />
                        <div className="flex -space-x-2">
                            {displayedMembers.map((member) => (
                                <Avatar
                                    key={member.id}
                                    size="sm"
                                    className="ring-2 ring-background"
                                >
                                    <AvatarImage src={member.avatar ?? undefined} alt={member.name} />
                                    <AvatarFallback className="text-[0.5rem]">
                                        {getInitials(member.name)}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                        {extraMembers > 0 && (
                            <span className="text-xs text-muted-foreground ml-1">
                                +{extraMembers}
                            </span>
                        )}
                    </div>

                    {/* Due Date */}
                    {project.dueDate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <IconCalendar className="size-3.5" />
                            <span>{formatDate(project.dueDate)}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
