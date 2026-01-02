"use client"

import * as React from "react"
import { IconAlertTriangle, IconChevronDown, IconChevronUp, IconX } from "@tabler/icons-react"

import { Alert, AlertAction, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import type { TeamAlert } from "../_server/teamsData"

interface TeamAlertBannerProps {
    alerts: TeamAlert[]
    onResolve: (alertId: string) => void
    onDismiss: (alertId: string) => void
}

export function TeamAlertBanner({
    alerts,
    onResolve,
    onDismiss,
}: TeamAlertBannerProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(false)

    if (alerts.length === 0) return null

    return (
        <div className="space-y-2">
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                {isCollapsed ? (
                    <IconChevronDown className="size-4" />
                ) : (
                    <IconChevronUp className="size-4" />
                )}
                <span>{alerts.length} Active Alert{alerts.length > 1 ? "s" : ""}</span>
            </button>

            {!isCollapsed && (
                <div className="space-y-2">
                    {alerts.map((alert) => (
                        <Alert
                            key={alert.id}
                            variant={alert.severity === "critical" ? "destructive" : "default"}
                            className="pr-24"
                        >
                            <IconAlertTriangle className="size-4" />
                            <AlertTitle className="flex items-center gap-2">
                                <span className="font-medium">{alert.teamName}:</span>
                                <span>{alert.message}</span>
                                <Badge
                                    variant={alert.severity === "critical" ? "destructive" : "outline"}
                                    className="ml-2"
                                >
                                    {alert.severity === "critical" ? "Critical" : "Warning"}
                                </Badge>
                            </AlertTitle>
                            <AlertAction className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onResolve(alert.id)}
                                >
                                    Resolve
                                </Button>
                                <Button
                                    size="icon-sm"
                                    variant="ghost"
                                    onClick={() => onDismiss(alert.id)}
                                >
                                    <IconX className="size-4" />
                                </Button>
                            </AlertAction>
                        </Alert>
                    ))}
                </div>
            )}
        </div>
    )
}
