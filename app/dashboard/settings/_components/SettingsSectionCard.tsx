"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { IconPencil } from "@tabler/icons-react"

interface SettingsSectionProps {
    title: string
    children: React.ReactNode
    className?: string
}

export function SettingsSection({ title, children, className }: SettingsSectionProps) {
    return (
        <fieldset className={cn("win7-groupbox", className)}>
          
            <div className="space-y-0.5">
            <legend>{title}</legend>
                {children}
            </div>
        </fieldset>
    )
}

interface SettingsItemProps {
    icon?: React.ReactNode
    title: string
    description?: string
    children?: React.ReactNode
    onClick?: () => void
    onEdit?: () => void
    className?: string
    showDivider?: boolean
    editable?: boolean
}

export function SettingsItem({
    icon,
    title,
    description,
    children,
    onClick,
    onEdit,
    className,
    showDivider = true,
    editable = false,
}: SettingsItemProps) {
    const hasAction = onClick || (editable && onEdit)
    const showEditButton = editable && !children

    return (
        <div className={cn("relative", showDivider && "border-b border-[#d9d9d9] last:border-0")}>
            <div
                className={cn(
                    "flex w-full items-center justify-between gap-4 px-3 py-2.5 text-left transition-colors",
                    hasAction && !showEditButton && "hover:bg-[#e6f4fc] hover:shadow-[inset_0_0_0_1px_#a8d8eb] rounded-[2px] cursor-pointer",
                    !hasAction && "cursor-default",
                    className
                )}
                onClick={onClick}
                onKeyDown={(e: React.KeyboardEvent) => {
                    if ((e.key === "Enter" || e.key === " ") && onClick) {
                        e.preventDefault()
                        onClick()
                    }
                }}
                tabIndex={hasAction && !showEditButton ? 0 : -1}
                role={hasAction && !showEditButton ? "button" : undefined}
            >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    {icon && (
                        <div className="flex size-5 shrink-0 items-center justify-center text-[#444]">
                            {icon}
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-medium text-black leading-tight">{title}</p>
                        {description && (
                            <p className="text-[11px] text-[#666] mt-0.5 leading-tight">{description}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {children && <div className="shrink-0" onClick={(e) => e.stopPropagation()}>{children}</div>}
                    {showEditButton && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onEdit?.()
                            }}
                            className="text-[#0066cc] hover:text-[#0052a3] p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-[#0066cc] focus:ring-offset-1"
                            aria-label={`Edit ${title}`}
                        >
                            <IconPencil className="size-3.5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
