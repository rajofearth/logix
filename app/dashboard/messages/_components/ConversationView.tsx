"use client"

import * as React from "react"

import type { ChatMessage } from "../_types"
import type { DriverDTO } from "@/app/dashboard/driver/_types"
import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { MessageInput } from "./MessageInput"

// ... imports remain similar but removing Shadcn components if unused

interface ConversationViewProps {
    driver: DriverDTO | null
    messages: ChatMessage[]
    onSendMessage: (content: string) => void
    canSend?: boolean
}



export function ConversationView({
    driver,
    messages,
    onSendMessage,
    canSend,
}: ConversationViewProps) {
    const scrollRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    if (!driver) {
        return (
            <div className="flex h-full flex-col items-center justify-center bg-white">
                <div className="text-center opacity-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/icon/msn.png" alt="" className="size-16 mx-auto mb-4 grayscale opacity-50" onError={(e) => e.currentTarget.style.display = 'none'} />
                    <h3 className="text-lg font-['Segoe_UI'] text-[#1e5774]">
                        Select a contact to start chatting
                    </h3>
                </div>
            </div>
        )
    }

    const statusLabel =
        driver.status === "available" ? "Online" :
            driver.status === "on-route" ? "On Route" : "Offline"

    const statusColor =
        driver.status === "available" ? "#5cb85c" :
            driver.status === "on-route" ? "#5bc0de" : "#999"

    return (
        <div className="flex h-full flex-col bg-white font-['Segoe_UI']">
            {/* Conversation Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-[#f2f2f2] to-[#e6e6e6] border-b border-[#d9d9d9]">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="size-10 bg-white p-[2px] border border-[#a0a0a0] shadow-sm rounded-[3px]">
                            <Avatar className="size-full rounded-[2px]">
                                <AvatarImage src={driver.avatar ?? undefined} alt={driver.name} />
                                <AvatarFallback className="rounded-[2px] bg-[#e1e1e1] text-[#555]">{getInitials(driver.name)}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div
                            className="absolute -bottom-1 -right-1 size-3 border-2 border-white rounded-full"
                            style={{ backgroundColor: statusColor }}
                        />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-[#1e5774] drop-shadow-[0_1px_0_rgba(255,255,255,1)]">
                            {driver.name}
                        </h2>
                        <p className="text-[10px] text-gray-500 flex items-center gap-1">
                            {driver.status === 'on-route' && <span className="text-[#e68b2c] font-bold">♪</span>}
                            <span className="italic">
                                {driver.route ? `Driving to ${driver.route.destination}` : `<${statusLabel}>`}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Chat Area - MSN Style */}
            <ScrollArea className="flex-1 bg-white">
                <div className="p-4 space-y-3 font-['Segoe_UI'] text-sm" ref={scrollRef}>
                    {messages.length === 0 ? (
                        <div className="py-8 text-center text-xs text-gray-400 italic">
                            You have just sent a nudge.
                        </div>
                    ) : (
                        messages.map((message, index) => {

                            const isAdmin = message.senderType === "admin"
                            const showHeader = index === 0 || messages[index - 1].senderType !== message.senderType

                            return (
                                <div key={message.id} className="mb-1">
                                    {showHeader && (
                                        <div className="mb-0.5 mt-2 flex items-baseline gap-2">
                                            <span className={cn("font-bold text-xs", isAdmin ? "text-[#1e5774]" : "text-[#e68b2c]")}>
                                                {isAdmin ? "You" : driver.name}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                                says:
                                            </span>
                                        </div>
                                    )}
                                    <div className={cn(
                                        "pl-0 text-[#333]",
                                        isAdmin ? "" : ""
                                    )}>
                                        <p className="whitespace-pre-wrap leading-relaxed">
                                            {message.content}
                                        </p>
                                    </div>
                                </div>
                            )
                        })
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Message Input */}
            <MessageInput onSend={onSendMessage} disabled={!canSend} />
        </div>
    )
}
