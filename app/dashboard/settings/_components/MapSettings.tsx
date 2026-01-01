"use client"

import * as React from "react"
import { IconMap, IconMapPin } from "@tabler/icons-react"
import { SettingsSection, SettingsItem } from "./SettingsSectionCard"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const mapStyles = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "satellite", label: "Satellite" },
] as const

export function MapSettings() {
    const [mapStyle, setMapStyle] = React.useState<string>("light")

    const handleStyleChange = (value: string | null) => {
        if (value) setMapStyle(value)
    }

    const currentStyleLabel = mapStyles.find((s) => s.value === mapStyle)?.label ?? "Light"

    return (
        <SettingsSection title="Map Preferences">
            <SettingsItem
                icon={<IconMap className="size-4" />}
                title="Map Style"
                description={currentStyleLabel}
            >
                <Select value={mapStyle} onValueChange={handleStyleChange}>
                    <SelectTrigger className="w-28 h-8">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {mapStyles.map((style) => (
                            <SelectItem key={style.value} value={style.value}>
                                {style.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </SettingsItem>

            <SettingsItem
                icon={<IconMapPin className="size-4" />}
                title="Default Location"
                description="Mumbai, India"
                showDivider={false}
            />
        </SettingsSection>
    )
}
