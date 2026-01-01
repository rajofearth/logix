"use client"

import * as React from "react"

import type { DriverDTO } from "@/app/dashboard/driver/_types"
import type { MessageDTO } from "./_types"
import { mockMessages } from "./_types"
import { listDrivers } from "@/app/dashboard/driver/_server/driverActions"
import { DriverList } from "./_components/DriverList"
import { ConversationView } from "./_components/ConversationView"
import { DriverInfoPanel } from "./_components/DriverInfoPanel"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function MessagesPage() {
    const [drivers, setDrivers] = React.useState<DriverDTO[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [selectedDriver, setSelectedDriver] = React.useState<DriverDTO | null>(null)
    const [messages, setMessages] = React.useState<MessageDTO[]>(mockMessages)

    // Fetch drivers on mount
    React.useEffect(() => {
        setIsLoading(true)
        listDrivers("all", "", 1)
            .then((result) => {
                setDrivers(result.drivers)
            })
            .finally(() => setIsLoading(false))
    }, [])

    // Handle driver selection
    const handleDriverSelect = (driver: DriverDTO) => {
        setSelectedDriver(driver)
        // In a real app, you'd fetch messages for this driver here
        // For now, we use mock messages
    }

    // Handle sending a message
    const handleSendMessage = (content: string) => {
        const newMessage: MessageDTO = {
            id: `msg-${Date.now()}`,
            content,
            timestamp: new Date(),
            status: "sent",
        }
        setMessages((prev) => [...prev, newMessage])
    }

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader title="Messages" />
                <div className="flex flex-1 overflow-hidden">
                    {/* Three-panel layout */}
                    <div className="flex flex-1">
                        {/* Left: Driver List */}
                        <div className="w-72 shrink-0">
                            <DriverList
                                drivers={drivers}
                                selectedDriverId={selectedDriver?.id ?? null}
                                onDriverSelect={handleDriverSelect}
                                isLoading={isLoading}
                            />
                        </div>

                        {/* Center: Conversation View */}
                        <div className="flex-1 min-w-0">
                            <ConversationView
                                driver={selectedDriver}
                                messages={selectedDriver ? messages : []}
                                onSendMessage={handleSendMessage}
                            />
                        </div>

                        {/* Right: Driver Info Panel */}
                        <div className="w-72 shrink-0 hidden lg:block">
                            <DriverInfoPanel driver={selectedDriver} />
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
