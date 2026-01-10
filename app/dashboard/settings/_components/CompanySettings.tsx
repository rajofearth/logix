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
                editable
                onEdit={() => {
                    // TODO: Implement company name edit
                    console.log("Edit company name")
                }}
            />
            <SettingsItem
                icon={<IconId className="size-4" />}
                title="GSTIN"
                description="Not configured"
                editable
                onEdit={() => {
                    // TODO: Implement GSTIN edit
                    console.log("Edit GSTIN")
                }}
            />
            <SettingsItem
                icon={<IconMapPin className="size-4" />}
                title="Address"
                description="Not configured"
                editable
                onEdit={() => {
                    // TODO: Implement address edit
                    console.log("Edit address")
                }}
            />
            <SettingsItem
                icon={<IconBuildingBank className="size-4" />}
                title="Bank Name"
                description="Not configured"
                editable
                onEdit={() => {
                    // TODO: Implement bank name edit
                    console.log("Edit bank name")
                }}
            />
            <SettingsItem
                icon={<IconCreditCard className="size-4" />}
                title="Account Number"
                description="Not configured"
                editable
                onEdit={() => {
                    // TODO: Implement account number edit
                    console.log("Edit account number")
                }}
            />
            <SettingsItem
                icon={<IconHash className="size-4" />}
                title="IFSC Code"
                description="Not configured"
                editable
                onEdit={() => {
                    // TODO: Implement IFSC code edit
                    console.log("Edit IFSC code")
                }}
                showDivider={false}
            />
        </SettingsSection>
    )
}
