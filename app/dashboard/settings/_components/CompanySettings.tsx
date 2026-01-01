"use client"

import * as React from "react"
import { IconBuilding, IconId, IconMapPin, IconBuildingBank, IconCreditCard, IconHash } from "@tabler/icons-react"
import { SettingsSection, SettingsItem } from "./SettingsSectionCard"

export function CompanySettings() {
    return (
        <SettingsSection title="Company / Business">
            <SettingsItem
                icon={<IconBuilding className="size-4" />}
                title="Company Name"
                description="Not configured"
            />
            <SettingsItem
                icon={<IconId className="size-4" />}
                title="GSTIN"
                description="Not configured"
            />
            <SettingsItem
                icon={<IconMapPin className="size-4" />}
                title="Address"
                description="Not configured"
            />
            <SettingsItem
                icon={<IconBuildingBank className="size-4" />}
                title="Bank Name"
                description="Not configured"
            />
            <SettingsItem
                icon={<IconCreditCard className="size-4" />}
                title="Account Number"
                description="Not configured"
            />
            <SettingsItem
                icon={<IconHash className="size-4" />}
                title="IFSC Code"
                description="Not configured"
                showDivider={false}
            />
        </SettingsSection>
    )
}
