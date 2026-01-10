"use client"

import * as React from "react"
import { IconBell, IconMail, IconBrowserCheck, IconTruck, IconReceipt } from "@tabler/icons-react"
import { SettingsSection, SettingsItem } from "./SettingsSectionCard"
import { Checkbox } from "@/components/ui/checkbox"

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
                <Checkbox
                    checked={emailNotifications}
                    onCheckedChange={(checked) => setEmailNotifications(checked === true)}
                    aria-label="Email Notifications"
                />
            </SettingsItem>

            <SettingsItem
                icon={<IconBrowserCheck className="size-4" />}
                title="Push Notifications"
                description="Browser push notifications"
            >
                <Checkbox
                    checked={pushNotifications}
                    onCheckedChange={(checked) => setPushNotifications(checked === true)}
                    aria-label="Push Notifications"
                />
            </SettingsItem>

            <SettingsItem
                icon={<IconBell className="size-4" />}
                title="Job Updates"
                description="New jobs and status changes"
            >
                <Checkbox
                    checked={jobAlerts}
                    onCheckedChange={(checked) => setJobAlerts(checked === true)}
                    aria-label="Job Updates"
                />
            </SettingsItem>

            <SettingsItem
                icon={<IconTruck className="size-4" />}
                title="Driver Alerts"
                description="Driver status and location updates"
            >
                <Checkbox
                    checked={driverAlerts}
                    onCheckedChange={(checked) => setDriverAlerts(checked === true)}
                    aria-label="Driver Alerts"
                />
            </SettingsItem>

            <SettingsItem
                icon={<IconReceipt className="size-4" />}
                title="Billing & Invoices"
                description="Payment and invoice notifications"
                showDivider={false}
            >
                <Checkbox
                    checked={billingAlerts}
                    onCheckedChange={(checked) => setBillingAlerts(checked === true)}
                    aria-label="Billing & Invoices"
                />
            </SettingsItem>
        </SettingsSection>
    )
}
