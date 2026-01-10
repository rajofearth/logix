"use client"

import {
    IconFolder,
    IconCalendar,
    IconUsers,
    IconTag,
    IconBriefcase,
} from "@tabler/icons-react"

import type { ProjectDTO } from "../_types"
import { getInitials, cn } from "@/lib/utils"
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
            <SheetContent side="right" showCloseButton={false} className="w-full sm:max-w-md p-0 bg-transparent border-none shadow-none">
                <div className="win7-window h-full flex flex-col rounded-none w-full">
                    <div className="title-bar">
                        <div className="title-bar-text">Project Details</div>
                        <div className="title-bar-controls">
                            <button aria-label="Close" className="close" onClick={() => onOpenChange(false)}></button>
                        </div>
                    </div>

                    <div className="window-body flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Header Section */}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flx items-center justify-center p-2 bg-white/50 border border-[#8e8f8f] rounded-sm">
                                <IconFolder className="size-8 text-[#e5c365]" fill="#e5c365" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold text-[#003399] tracking-tight truncate">{project.name}</h3>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "text-[10px] uppercase font-bold px-2 py-0.5 rounded-[2px] border shadow-sm",
                                            status.badgeClass
                                        )}
                                    >
                                        {status.label}
                                    </Badge>
                                </div>
                                <p className="text-sm text-[#444] truncate">
                                    {project.client || "Client Project"}
                                </p>
                            </div>
                        </div>

                        {/* Progress Group Box */}
                        <fieldset className="border border-[#d9d9d9] rounded-[3px] p-3 pt-1 mb-2">
                            <legend className="text-[#003399] text-xs px-1">Progress Tracker</legend>
                            <div className="flex items-center justify-between text-sm mb-2 px-1">
                                <span className="font-medium">Completion</span>
                                <span className="font-bold text-[#0066cc]">{project.progress}%</span>
                            </div>
                            <div className="h-4 w-full bg-[#e6e6e6] border border-[#bcbcbc] rounded-[2px] relative overflow-hidden shadow-inner">
                                <div
                                    className="h-full bg-[linear-gradient(to_bottom,#06b025_0%,#00cc00_50%,#00b300_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
                                    style={{ width: `${project.progress}%` }}
                                />
                            </div>

                            {/* Description */}
                            {project.description && (
                                <div className="mt-3 p-2 bg-[#fff] border border-[#d9d9d9] text-sm text-[#333]">
                                    {project.description}
                                </div>
                            )}
                        </fieldset>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <fieldset className="border border-[#d9d9d9] rounded-[3px] p-2 bg-[#fcfcfc]">
                                <div className="flex items-center gap-1.5 text-[#666] mb-1">
                                    <IconCalendar className="size-3.5" />
                                    <span className="text-[10px] uppercase tracking-wide">Start Date</span>
                                </div>
                                <p className="text-sm font-bold text-[#333]">{formatDate(project.startDate)}</p>
                            </fieldset>
                            {project.dueDate && (
                                <fieldset className="border border-[#d9d9d9] rounded-[3px] p-2 bg-[#fcfcfc]">
                                    <div className="flex items-center gap-1.5 text-[#666] mb-1">
                                        <IconBriefcase className="size-3.5" />
                                        <span className="text-[10px] uppercase tracking-wide">Due Date</span>
                                    </div>
                                    <p className="text-sm font-bold text-[#333]">{formatDate(project.dueDate)}</p>
                                </fieldset>
                            )}
                        </div>

                        {/* Team Members */}
                        <fieldset className="border border-[#d9d9d9] rounded-[3px] p-3 pt-1">
                            <legend className="text-[#003399] text-xs px-1 flex items-center gap-1">
                                <IconUsers className="size-3" />
                                Team ({project.teamMembers.length})
                            </legend>
                            <div className="space-y-1 mt-1">
                                {project.teamMembers.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center gap-3 p-1.5 hover:bg-[#e8f4fc] hover:border-[#aaddfa] border border-transparent rounded-[2px] transition-colors cursor-default"
                                    >
                                        <Avatar className="size-6 border border-[#8e8f8f]">
                                            <AvatarImage src={member.avatar ?? undefined} alt={member.name} />
                                            <AvatarFallback className="text-[10px] bg-[#d9d9d9] text-[#333]">
                                                {getInitials(member.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm text-[#333]">{member.name}</span>
                                    </div>
                                ))}
                            </div>
                        </fieldset>

                        {/* Tags */}
                        {project.tags && project.tags.length > 0 && (
                            <fieldset className="border border-[#d9d9d9] rounded-[3px] p-3 pt-1">
                                <legend className="text-[#003399] text-xs px-1 flex items-center gap-1">
                                    <IconTag className="size-3" />
                                    Tags
                                </legend>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {project.tags.map((tag) => (
                                        <span key={tag} className="text-xs px-2 py-0.5 border border-[#8e8f8f] bg-[#f0f0f0] text-[#333] rounded-[2px] shadow-sm">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </fieldset>
                        )}
                    </div>
                    {/* Status Bar */}
                    <div className="status-bar">
                        <p className="status-bar-field">Status: {status.label}</p>
                        <p className="status-bar-field justify-end">Press F1 for help</p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
