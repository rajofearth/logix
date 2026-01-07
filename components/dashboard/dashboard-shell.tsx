"use client"

import * as React from "react"
import { Win7MenuBar } from "./win7-menu-bar"
import { Win7StatusBar } from "./win7-status-bar"

interface DashboardShellProps {
    children: React.ReactNode
    title?: string
    itemCount?: number
    selectedCount?: number
    statusMessage?: string
}

export function DashboardShell({
    children,
    title = "Logix Dashboard",
    itemCount,
    selectedCount,
    statusMessage,
}: DashboardShellProps) {
    return (
        <div className="win7-desktop">
            <div className="window active glass">
                {/* Title Bar */}
                <div className="title-bar active">
                    <span className="title-bar-text">{title}</span>
                    <div className="title-bar-controls">
                        <button aria-label="Minimize" type="button" />
                        <button aria-label="Maximize" type="button" />
                        <button aria-label="Close" type="button" />
                    </div>
                </div>

                {/* Menu Bar */}
                <Win7MenuBar />

                {/* Window Body / Content */}
                <div className="window-body">
                    {children}
                </div>

                {/* Status Bar */}
                <Win7StatusBar
                    itemCount={itemCount}
                    selectedCount={selectedCount}
                    customMessage={statusMessage}
                />
            </div>
        </div>
    )
}
