"use client"

import {
    IconFolder,
    IconCalendar,
    IconUsers,
    IconTag,
    IconBriefcase,
} from "@tabler/icons-react"

import type { ProjectDTO } from "../_types"
import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/utils"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"

const statusConfig = {
    active: {
        label: "Active",
        badgeClass: "bg-primary/10 text-primary",
        progressColor: "bg-primary",
    },
    completed: {
        label: "Completed",
        badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        progressColor: "bg-emerald-500",
    },
    "on-hold": {
        label: "On Hold",
        badgeClass: "bg-muted text-muted-foreground",
        progressColor: "bg-muted-foreground/50",
    },
    pending: {
        label: "Pending",
        badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        progressColor: "bg-amber-500",
    },
}

interface ProjectDetailsSheetProps {
    project: ProjectDTO | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ProjectDetailsSheet({
    project,
    open,
    onOpenChange,
}: ProjectDetailsSheetProps) {
    if (!project) return null

    const status = statusConfig[project.status]

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader className="pb-4">
                    {/* Project Icon, Name and Status */}
                    <div className="flex items-center gap-4">
                        <div
                            className={cn(
                                "flex size-12 shrink-0 items-center justify-center rounded-lg",
                                "bg-primary/10 text-primary"
                            )}
                        >
                            <IconFolder className="size-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <SheetTitle className="text-base truncate">{project.name}</SheetTitle>
                                <Badge
                                    variant="secondary"
                                    className={cn("text-[0.6rem] shrink-0", status.badgeClass)}
                                >
                                    {status.label}
                                </Badge>
                            </div>
                            <SheetDescription className="truncate">
                                {project.client || "Project"}
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="space-y-4 px-4 pb-4">
                    {/* Progress Card */}
                    <Card className="overflow-hidden">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="font-medium">Progress</span>
                                <span className="text-primary font-semibold">{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} className="h-2" />

                            {/* Description */}
                            {project.description && (
                                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                                    {project.description}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <Card className="p-3 bg-muted/20 border-0">
                            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                                <IconCalendar className="size-3" />
                                <span className="text-[0.6rem] uppercase tracking-wide">Start Date</span>
                            </div>
                            <p className="text-sm font-medium">{formatDate(project.startDate)}</p>
                        </Card>
                        {project.dueDate && (
                            <Card className="p-3 bg-muted/20 border-0">
                                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                                    <IconBriefcase className="size-3" />
                                    <span className="text-[0.6rem] uppercase tracking-wide">Due Date</span>
                                </div>
                                <p className="text-sm font-medium">{formatDate(project.dueDate)}</p>
                            </Card>
                        )}
                    </div>

                    {/* Team Members */}
                    <Card className="overflow-hidden">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-sm font-medium mb-3">
                                <IconUsers className="size-4" />
                                Team Members ({project.teamMembers.length})
                            </div>
                            <div className="space-y-2">
                                {project.teamMembers.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                                    >
                                        <Avatar size="sm">
                                            <AvatarImage src={member.avatar ?? undefined} alt={member.name} />
                                            <AvatarFallback className="text-xs">
                                                {getInitials(member.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm">{member.name}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tags */}
                    {project.tags && project.tags.length > 0 && (
                        <Card className="overflow-hidden">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 text-sm font-medium mb-3">
                                    <IconTag className="size-4" />
                                    Tags
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {project.tags.map((tag) => (
                                        <Badge key={tag} variant="outline" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
