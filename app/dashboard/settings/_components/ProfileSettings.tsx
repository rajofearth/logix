"use client"

import * as React from "react"
import { IconUser, IconMail, IconPhone, IconPhoto } from "@tabler/icons-react"
import { SettingsSection, SettingsItem } from "./SettingsSectionCard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "@/lib/auth-client"
import { Skeleton } from "@/components/ui/skeleton"

export function ProfileSettings() {
    const { data: session, isPending } = useSession()
    const [isChangingPicture, setIsChangingPicture] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handlePictureChange = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // TODO: Implement actual picture upload
            console.log("Picture upload:", file)
            setIsChangingPicture(false)
        }
    }

    if (isPending) {
        return (
            <SettingsSection title="User Account">
                <div className="flex items-center gap-4 px-3 py-4">
                    <Skeleton className="size-16 rounded-[2px]" />
                    <div className="space-y-2 flex-1">
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
        <SettingsSection title="User Account">
            {/* Profile Header */}
            <div className="flex items-center gap-4 px-3 py-4 border-b border-[#d9d9d9]">
                <div className="relative group">
                    <Avatar className="size-16 border-2 border-[#fff] shadow-[0_0_0_1px_#8e8f8f] rounded-[2px]">
                        <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? "User"} className="rounded-none" />
                        <AvatarFallback className="text-xl rounded-none bg-[#d9d9d9]">{initials}</AvatarFallback>
                    </Avatar>
                    <button
                        onClick={handlePictureChange}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2px] flex items-center justify-center"
                        aria-label="Change profile picture"
                    >
                        <IconPhoto className="size-5 text-white" />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold text-[#003399] leading-tight">{user?.name ?? "User"}</p>
                    <p className="text-[11px] text-[#666] mt-0.5 leading-tight">{user?.email ?? "No email"}</p>
                    <button
                        onClick={handlePictureChange}
                        className="text-[11px] text-[#0066cc] hover:text-[#0052a3] hover:underline mt-1.5 transition-colors"
                    >
                        Change your picture
                    </button>
                </div>
            </div>

            {/* Profile Items */}
            <SettingsItem
                icon={<IconUser className="size-4" />}
                title="Name"
                description={user?.name ?? "Not set"}
                editable
                onEdit={() => {
                    // TODO: Implement name edit
                    console.log("Edit name")
                }}
            />
            <SettingsItem
                icon={<IconMail className="size-4" />}
                title="Email"
                description={user?.email ?? "Not set"}
                editable
                onEdit={() => {
                    // TODO: Implement email edit
                    console.log("Edit email")
                }}
            />
            <SettingsItem
                icon={<IconPhone className="size-4" />}
                title="Phone"
                description="Not set"
                editable
                onEdit={() => {
                    // TODO: Implement phone edit
                    console.log("Edit phone")
                }}
                showDivider={false}
            />
        </SettingsSection>
    )
}
