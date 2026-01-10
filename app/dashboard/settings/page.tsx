"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ScrollArea } from "@/components/ui/scroll-area"

import { AppearanceSettings } from "./_components/AppearanceSettings"
import { ProfileSettings } from "./_components/ProfileSettings"
import { NotificationSettings } from "./_components/NotificationSettings"
import { CompanySettings } from "./_components/CompanySettings"
import { MapSettings } from "./_components/MapSettings"

export default function SettingsPage() {
    return (
        <DashboardShell title="Control Panel - Settings">
            <div className="h-full flex flex-col bg-[#ece9d8]">
                <div className="flex-1 overflow-auto win7-p-4">
                    <div className="h-full space-y-4 pb-6">
                        {/* We keep the child components as is for functionality, 
                                    but wrap them in a nice Win7 container layout */}
                        <ProfileSettings />
                        <AppearanceSettings />
                        <NotificationSettings />
                        <MapSettings />
                        <CompanySettings />
                    </div>
                </div>
            </div>
        </DashboardShell>
    )
}
