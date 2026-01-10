"use client"

import * as React from "react"
import { IconPalette, IconSun, IconMoon, IconDeviceDesktop, IconLanguage } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import { SettingsSection, SettingsItem } from "./SettingsSectionCard"
import { useLanguage, type Language } from "@/lib/LanguageContext"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const themes = [
    { value: "light", label: "Light", icon: IconSun },
    { value: "dark", label: "Dark", icon: IconMoon },
    { value: "system", label: "System", icon: IconDeviceDesktop },
] as const

const languages = [
    { value: "en", label: "English" },
    { value: "hi", label: "हिन्दी" },
    { value: "mr", label: "मराठी" },
] as const

export function AppearanceSettings() {
    const { theme, setTheme } = useTheme()
    const { language, setLanguage } = useLanguage()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => setMounted(true), [])

    const currentTheme = mounted ? theme : "system"
    const currentThemeLabel = themes.find((t) => t.value === currentTheme)?.label ?? "System"
    const currentLanguageLabel = languages.find((l) => l.value === language)?.label ?? "English"

    return (
        <SettingsSection title="Appearance">
            <SettingsItem
                icon={<IconPalette className="size-4" />}
                title="Theme"
                description={currentThemeLabel}
            >
                <Select value={currentTheme} onValueChange={(v) => v && setTheme(v)}>
                    <SelectTrigger className="w-[130px] h-[26px] text-[11px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {themes.map((t) => (
                            <SelectItem key={t.value} value={t.value} className="text-[11px]">
                                <div className="flex items-center gap-2">
                                    <t.icon className="size-3.5" />
                                    {t.label}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </SettingsItem>

            <SettingsItem
                icon={<IconLanguage className="size-4" />}
                title="Language"
                description={currentLanguageLabel}
                showDivider={false}
            >
                <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                    <SelectTrigger className="w-[130px] h-[26px] text-[11px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {languages.map((l) => (
                            <SelectItem key={l.value} value={l.value} className="text-[11px]">
                                {l.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </SettingsItem>
        </SettingsSection>
    )
}
