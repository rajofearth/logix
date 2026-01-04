"use client"

import * as React from "react"

import type { ChatMessage } from "../_types"
import type { DriverDTO } from "@/app/dashboard/driver/_types"
import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { MessageInput } from "./MessageInput"

interface ConversationViewProps {
    driver: DriverDTO | null
    messages: ChatMessage[]
    onSendMessage: (content: string) => void
    canSend?: boolean
}

function formatTime(date: Date): string {
    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    })
}

function formatDate(date: Date): string {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
        return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday"
    } else {
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        })
    }
}

export function ConversationView({
    driver,
    messages,
    onSendMessage,
    canSend,
}: ConversationViewProps) {
    const scrollRef = React.useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom when messages change
    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    if (!driver) {
        return (
            <div className="flex h-full flex-col items-center justify-center bg-background">
                <div className="text-center">
                    <div className="mb-4 text-4xl">💬</div>
                    <h3 className="text-lg font-medium text-foreground">
                        Select a driver
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Choose a driver from the list to send a message
                    </p>
                </div>
            </div>
        )
    }

    const statusLabel =
        driver.status === "available"
            ? "Online"
            : driver.status === "on-route"
                ? "On Route"
                : "Offline"

    return (
        <div className="flex h-full flex-col bg-background">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
                <div className="flex items-center gap-3">
                    <Avatar size="lg">
                        <AvatarImage
                            src={driver.avatar ?? undefined}
                            alt={driver.name}
                        />
                        <AvatarFallback>{getInitials(driver.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-sm font-semibold text-foreground">
                            {driver.name}
                        </h2>
                        <Badge
                            variant="secondary"
                            className={cn(
                                "mt-0.5 text-[0.6rem]",
                                driver.status === "available" &&
                                "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                                driver.status === "on-route" &&
                                "bg-primary/10 text-primary",
                                driver.status === "off-duty" &&
                                "bg-muted text-muted-foreground"
                            )}
                        >
                            ● {statusLabel}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.length === 0 ? (
                        <div className="py-12 text-center text-sm text-muted-foreground">
                            No messages yet. Send a message to {driver.name}.
                        </div>
                    ) : (
                        messages.map((message, index) => {
                            const ts = new Date(message.createdAt)
                            const showDate =
                                index === 0 ||
                                formatDate(ts) !==
                                formatDate(new Date(messages[index - 1]!.createdAt))

                            const isAdmin = message.senderType === "admin"

                            return (
                                <React.Fragment key={message.id}>
                                    {showDate && (
                                        <div className="flex justify-center">
                                            <Badge
                                                variant="secondary"
                                                className="text-[0.65rem] bg-muted text-muted-foreground"
                                            >
                                                {formatDate(ts)}
                                            </Badge>
                                        </div>
                                    )}
                                    <div className={cn("flex", isAdmin ? "justify-end" : "justify-start")}>
                                        <div
                                            className={cn(
                                                "max-w-[70%] rounded-lg px-3 py-2",
                                                isAdmin
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted text-foreground"
                                            )}
                                        >
                                            <p className="text-sm whitespace-pre-wrap">
                                                {message.content}
                                            </p>
                                            <div className="mt-1 flex items-center justify-end gap-1">
                                                <span className="text-[0.65rem] opacity-70">
                                                    {formatTime(ts)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </React.Fragment>
                            )
                        })
                    )}
                </div>
            </ScrollArea>

            {/* Message Input */}
            <MessageInput onSend={onSendMessage} disabled={!canSend} />
        </div>
    )
}
