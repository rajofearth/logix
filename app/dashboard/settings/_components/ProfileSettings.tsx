"use client"

import * as React from "react"
import { IconUser, IconMail, IconPhone, IconChevronRight } from "@tabler/icons-react"
import { SettingsSection, SettingsItem } from "./SettingsSectionCard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "@/lib/auth-client"
import { Skeleton } from "@/components/ui/skeleton"

export function ProfileSettings() {
    const { data: session, isPending } = useSession()

    if (isPending) {
        return (
            <SettingsSection title="Account">
                <div className="flex items-center gap-4 px-4 py-4">
                    <Skeleton className="size-14 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                    </div>
                </div>
            </SettingsSection>
        )
    }

    const user = session?.user
    const initials = user?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) ?? "U"

    return (
        <SettingsSection title="Account">
            {/* Profile Header */}
            <div className="flex items-center gap-4 px-4 py-4 border-b border-border">
                <Avatar className="size-14">
                    <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? "User"} />
                    <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{user?.name ?? "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email ?? "No email"}</p>
                </div>
                <IconChevronRight className="size-5 text-muted-foreground" />
            </div>

            {/* Profile Items */}
            <SettingsItem
                icon={<IconUser className="size-4" />}
                title="Name"
                description={user?.name ?? "Not set"}
            />
            <SettingsItem
                icon={<IconMail className="size-4" />}
                title="Email"
                description={user?.email ?? "Not set"}
            />
            <SettingsItem
                icon={<IconPhone className="size-4" />}
                title="Phone"
                description="Not set"
                showDivider={false}
            />
        </SettingsSection>
    )
}
