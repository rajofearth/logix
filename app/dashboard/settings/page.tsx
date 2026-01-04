"use client"

import { DashboardPage } from "@/components/dashboard/crm/DashboardPage"
import { ScrollArea } from "@/components/ui/scroll-area"

import { AppearanceSettings } from "./_components/AppearanceSettings"
import { ProfileSettings } from "./_components/ProfileSettings"
import { NotificationSettings } from "./_components/NotificationSettings"
import { CompanySettings } from "./_components/CompanySettings"
import { MapSettings } from "./_components/MapSettings"

export default function SettingsPage() {
    return (
        <DashboardPage title="Settings" className="p-0">
            <div className="flex flex-1 flex-col overflow-hidden">
                <ScrollArea className="flex-1">
                    <div className="max-w-2xl mx-auto py-4 px-4 md:py-6 lg:px-6 space-y-6">
                        <ProfileSettings />
                        <AppearanceSettings />
                        <NotificationSettings />
                        <MapSettings />
                        <CompanySettings />
                    </div>
                </ScrollArea>
            </div>
        </DashboardPage>
    )
}
