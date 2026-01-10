"use client"

import * as React from "react"

import type { DriverDTO } from "@/app/dashboard/driver/_types"
import type { ChatMessage } from "./_types"
import { listDrivers } from "@/app/dashboard/driver/_server/driverActions"
import { getOrCreateThreadForJob, listMessages, sendAdminMessage } from "./_server/chatActions"
import { DriverList } from "./_components/DriverList"
import { ConversationView } from "./_components/ConversationView"
import { DriverInfoPanel } from "./_components/DriverInfoPanel"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function MessagesPage() {
    const [drivers, setDrivers] = React.useState<DriverDTO[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [selectedDriver, setSelectedDriver] = React.useState<DriverDTO | null>(null)
    const [threadId, setThreadId] = React.useState<string | null>(null)
    const [messages, setMessages] = React.useState<ChatMessage[]>([])
    const lastCreatedAtRef = React.useRef<string | null>(null)

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
    }

    // Load thread + messages when selected driver changes
    React.useEffect(() => {
        let alive = true

        const run = async () => {
            setMessages([])
            setThreadId(null)
            lastCreatedAtRef.current = null

            if (!selectedDriver?.currentJobId) return

            const thread = await getOrCreateThreadForJob(selectedDriver.currentJobId)
            if (!alive) return
            if (!thread) return

            setThreadId(thread.threadId)
            const initial = await listMessages(thread.threadId)
            if (!alive) return
            setMessages(initial)
        }

        run().catch((e) => {
            console.error("[Messages] load thread error:", e)
        })

        return () => {
            alive = false
        }
    }, [selectedDriver?.id, selectedDriver?.currentJobId])

    // Track latest message timestamp for incremental fetches
    React.useEffect(() => {
        lastCreatedAtRef.current = messages[messages.length - 1]?.createdAt ?? null
    }, [messages])

    // Realtime updates via SSE
    React.useEffect(() => {
        if (!threadId) return

        const last = lastCreatedAtRef.current
        const url = last
            ? `/api/chat/threads/${threadId}/stream?after=${encodeURIComponent(last)}`
            : `/api/chat/threads/${threadId}/stream`

        const es = new EventSource(url)
        let alive = true

        const append = (incoming: ChatMessage[]) => {
            setMessages((prev) => {
                const seen = new Set(prev.map((m) => m.id))
                const next = [...prev]
                for (const m of incoming) {
                    if (!seen.has(m.id)) next.push(m)
                }
                return next
            })
        }

        es.addEventListener("message", (ev) => {
            if (!alive) return
            try {
                const dto = JSON.parse((ev as MessageEvent).data) as ChatMessage
                append([dto])
            } catch (e) {
                console.error("[Messages] SSE message parse error:", e)
            }
        })

        es.addEventListener("realtime", async (ev) => {
            if (!alive) return
            try {
                const payload = JSON.parse((ev as MessageEvent).data) as { type?: string }
                if (payload.type !== "message_created") return

                const after = lastCreatedAtRef.current ?? undefined
                const newer = await listMessages(threadId, after)
                if (!alive) return
                append(newer)
            } catch (e) {
                console.error("[Messages] SSE realtime handler error:", e)
            }
        })

        es.addEventListener("error", () => {
            // Browser auto-reconnects; keep quiet unless debugging
        })

        return () => {
            alive = false
            es.close()
        }
    }, [threadId])

    // Handle sending a message
    const handleSendMessage = async (content: string) => {
        if (!threadId) return
        const created = await sendAdminMessage(threadId, content)
        setMessages((prev) => [...prev, created])
    }

    const canSend =
        !!selectedDriver &&
        selectedDriver.status === "on-route" &&
        !!selectedDriver.currentJobId &&
        !!threadId

    return (
        <DashboardShell title="Messenger Service">
            <div className="flex flex-1 overflow-hidden bg-[#ece9d8] p-2">
                <div className="flex w-full h-full border border-white shadow-[1px_1px_0_#aca899] bg-white">
                    {/* Left: Driver List */}
                    <div className="w-72 shrink-0 border-r border-[#aca899] flex flex-col">
                        <div className="bg-[#ece9d8] p-1 border-b border-[#aca899]">
                            <p className="text-xs text-gray-600">Active Drivers</p>
                        </div>
                        <div className="flex-1 overflow-y-auto bg-white">
                            <DriverList
                                drivers={drivers}
                                selectedDriverId={selectedDriver?.id ?? null}
                                onDriverSelect={handleDriverSelect}
                                isLoading={isLoading}
                            />
                        </div>
                    </div>

                    {/* Center: Conversation View */}
                    <div className="flex-1 min-w-0 flex flex-col bg-[#eef1ff]">
                        <ConversationView
                            driver={selectedDriver}
                            messages={selectedDriver ? messages : []}
                            onSendMessage={handleSendMessage}
                            canSend={canSend}
                        />
                    </div>

                    {/* Right: Driver Info Panel */}
                    <div className="w-72 shrink-0 hidden lg:block border-l border-[#aca899] bg-[#f0f0f0]">
                        <DriverInfoPanel driver={selectedDriver} />
                    </div>
                </div>
            </div>
        </DashboardShell>
    )
}
