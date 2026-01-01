"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

interface SettingsSectionProps {
    title: string
    children: React.ReactNode
    className?: string
}

export function SettingsSection({ title, children, className }: SettingsSectionProps) {
    return (
        <div className={cn("", className)}>
            <h3 className="text-xs font-medium text-primary uppercase tracking-wide px-4 py-2">
                {title}
            </h3>
            <div className="bg-card rounded-lg overflow-hidden">
                {children}
            </div>
        </div>
    )
}

interface SettingsItemProps {
    icon?: React.ReactNode
    title: string
    description?: string
    children?: React.ReactNode
    onClick?: () => void
    className?: string
    showDivider?: boolean
}

export function SettingsItem({
    icon,
    title,
    description,
    children,
    onClick,
    className,
    showDivider = true,
}: SettingsItemProps) {
    const Comp = onClick ? "button" : "div"

    return (
        <>
            <Comp
                className={cn(
                    "flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors",
                    onClick && "hover:bg-muted/50 cursor-pointer active:bg-muted",
                    className
                )}
                onClick={onClick}
            >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    {icon && (
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            {icon}
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{title}</p>
                        {description && (
                            <p className="text-xs text-muted-foreground truncate">{description}</p>
                        )}
                    </div>
                </div>
                {children && <div className="shrink-0">{children}</div>}
            </Comp>
            {showDivider && <Separator className="ml-15" />}
        </>
    )
}
