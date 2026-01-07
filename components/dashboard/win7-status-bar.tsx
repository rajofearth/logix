"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

interface Win7StatusBarProps {
    itemCount?: number
    selectedCount?: number
    customMessage?: string
}

export function Win7StatusBar({ itemCount, selectedCount, customMessage }: Win7StatusBarProps) {
    const pathname = usePathname()

    // Derive page name from pathname
    const getPageName = () => {
        const segments = pathname.split("/").filter(Boolean)
        if (segments.length <= 1) return "Dashboard"
        const pageName = segments[segments.length - 1]
        return pageName.charAt(0).toUpperCase() + pageName.slice(1).replace(/-/g, " ")
    }

    const getStatusText = () => {
        if (customMessage) return customMessage
        if (selectedCount && selectedCount > 0) {
            return `${selectedCount} item${selectedCount > 1 ? "s" : ""} selected`
        }
        if (itemCount !== undefined) {
            return `${itemCount} item${itemCount !== 1 ? "s" : ""}`
        }
        return "Ready"
    }

    return (
        <div className="status-bar">
            <span className="status-bar-field">{getStatusText()}</span>
            <span className="status-bar-field" style={{ flexGrow: 0, minWidth: 120 }}>
                {getPageName()}
            </span>
        </div>
    )
}
