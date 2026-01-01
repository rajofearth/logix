"use client"

import * as React from "react"
import { IconBell, IconMail, IconBrowserCheck } from "@tabler/icons-react"
import { SettingsSection, SettingsItem } from "./SettingsSectionCard"
import { Switch } from "@/components/ui/switch"

export function NotificationSettings() {
    const [emailNotifications, setEmailNotifications] = React.useState(true)
    const [pushNotifications, setPushNotifications] = React.useState(false)
    const [jobAlerts, setJobAlerts] = React.useState(true)
    const [driverAlerts, setDriverAlerts] = React.useState(true)
    const [billingAlerts, setBillingAlerts] = React.useState(false)

    return (
        <SettingsSection title="Notifications">
            <SettingsItem
                icon={<IconMail className="size-4" />}
                title="Email Notifications"
                description="Receive updates via email"
            >
                <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                />
            </SettingsItem>

            <SettingsItem
                icon={<IconBrowserCheck className="size-4" />}
                title="Push Notifications"
                description="Browser push notifications"
            >
                <Switch
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                />
            </SettingsItem>

            <SettingsItem
                icon={<IconBell className="size-4" />}
                title="Job Updates"
                description="New jobs and status changes"
            >
                <Switch
                    checked={jobAlerts}
                    onCheckedChange={setJobAlerts}
                />
            </SettingsItem>

            <SettingsItem
                title="Driver Alerts"
                description="Driver status and location updates"
            >
                <Switch
                    checked={driverAlerts}
                    onCheckedChange={setDriverAlerts}
                />
            </SettingsItem>

            <SettingsItem
                title="Billing & Invoices"
                description="Payment and invoice notifications"
                showDivider={false}
            >
                <Switch
                    checked={billingAlerts}
                    onCheckedChange={setBillingAlerts}
                />
            </SettingsItem>
        </SettingsSection>
    )
}
