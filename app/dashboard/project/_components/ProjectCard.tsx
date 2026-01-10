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
        <div
            onClick={onClick}
            className={cn(
                "group cursor-pointer font-['Segoe_UI'] relative",
                "bg-white border border-[#7f9db9] rounded-[3px]",
                "shadow-[2px_2px_5px_rgba(0,0,0,0.05)]",
                "hover:shadow-[2px_2px_12px_2px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(255,255,255,0.9)] hover:-translate-y-0.5 transition-all duration-200"
            )}
        >
            {/* Header: Title & Status */}
            <div className="px-3 py-2 bg-gradient-to-b from-[#eff7fa] to-[#d8eaf4] border-b border-[#a8bdbc] flex items-start gap-3 rounded-t-[2px]">
                <div className="flex size-8 shrink-0 items-center justify-center rounded bg-white border border-[#9eb9ce]">
                    <IconFolder className="size-4 text-[#1e5774]" />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate text-[#1e5774] drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
                        {project.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn("text-[10px] uppercase font-bold px-1.5 py-0 border rounded-[2px]", status.badgeClass)}>
                            {status.label}
                        </span>
                        {project.client && (
                            <span className="text-[11px] text-[#555] truncate">
                                {project.client}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-3">
                {/* Description */}
                {project.description && (
                    <p className="text-[11px] text-[#333] line-clamp-2 mb-3 h-[2.5em]">
                        {project.description}
                    </p>
                )}

                {/* Progress */}
                <div className="mb-3 bg-[#f5f5f5] p-2 border border-[#e0e0e0] rounded-[2px]">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-[#555] uppercase font-bold">Progress</span>
                        <span className="font-bold text-[#333]">{project.progress}%</span>
                    </div>
                    {/* Authentic Win7 Progress Bar */}
                    <div
                        role="progressbar"
                        aria-valuenow={project.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className={cn(
                            "h-[15px] border border-[#898c95] rounded-[3px] my-[2px] overflow-hidden relative shadow-[inset_0_0_0_1px_rgba(243,243,243,0.5),0_0_0_1px_rgba(234,234,234,0.5)]",
                            "bg-[radial-gradient(circle_at_0_50%,rgba(0,0,0,0.12)_10px,transparent_30px),radial-gradient(circle_at_100%_50%,rgba(0,0,0,0.12)_10px,transparent_30px),linear-gradient(to_bottom,rgba(243,243,243,0.69),rgba(252,252,252,0.69)_3px,rgba(219,219,219,0.69)_6px,rgba(202,202,202,0.69)_6px,rgba(213,213,213,0.69))]",
                            status.label === "On Hold" && "paused",
                            status.label === "Pending" && "error" // Using error style for pending to match red color request if needed, or just default green
                        )}
                        style={{ backgroundColor: '#ddd' }}
                    >
                        <div
                            className="h-full overflow-hidden relative shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
                            style={{
                                width: `${project.progress}%`,
                                backgroundColor: status.label === "On Hold" ? '#e6df1b' : status.label === "Pending" ? '#ef0000' : '#0bd82c', // paused=yellow, pending/error=red, else green
                                backgroundImage: `
                                    linear-gradient(to bottom, rgba(243,243,243,0.69), rgba(252,252,252,0.69) 3px, rgba(219,219,219,0.69) 6px, transparent 6px),
                                    radial-gradient(circle at 0 50%, rgba(0,0,0,0.18) 10px, transparent 30px),
                                    radial-gradient(circle at 100% 50%, rgba(0,0,0,0.18) 10px, transparent 30px),
                                    linear-gradient(to bottom, transparent 65%, rgba(255,255,255,0.33)),
                                    linear-gradient(to bottom, transparent 6px, rgba(202,202,202,0.2) 6px, rgba(213,213,213,0.2))
                                `
                            }}
                        >
                            {/* Animated sheen effect */}
                            <div className="absolute inset-0 block animate-[progressbar_3s_linear_infinite]"
                                style={{
                                    background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.5), transparent 40%)'
                                }}
                            />
                        </div>
                        <style jsx>{`
                            @keyframes progressbar {
                                0% { transform: translateX(-40%); }
                                60% { transform: translateX(100%); }
                                100% { transform: translateX(100%); }
                            }
                        `}</style>
                    </div>
                </div>

                {/* Footer: Team + Due Date */}
                <div className="flex items-center justify-between pt-1">
                    {/* Team Avatars */}
                    <div className="flex items-center">
                        <div className="flex -space-x-1.5 hover:space-x-0 transition-all">
                            {displayedMembers.map((member) => (
                                <Avatar
                                    key={member.id}
                                    className="size-6 border border-white ring-1 ring-[#c0c1cd]"
                                >
                                    <AvatarImage src={member.avatar ?? undefined} alt={member.name} />
                                    <AvatarFallback className="text-[8px] bg-[#e1e1e1] text-[#555]">
                                        {getInitials(member.name)}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                        {extraMembers > 0 && (
                            <span className="text-[10px] text-[#666] ml-2 font-medium bg-[#f0f0f0] px-1 rounded border border-[#ddd]">
                                +{extraMembers}
                            </span>
                        )}
                    </div>

                    {/* Due Date */}
                    {project.dueDate && (
                        <div className="flex items-center gap-1 text-[10px] text-[#666] font-medium bg-[#f9f9f9] px-1.5 py-0.5 border border-[#e6e6e6] rounded">
                            <IconCalendar className="size-3" />
                            <span>{formatDate(project.dueDate)}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
