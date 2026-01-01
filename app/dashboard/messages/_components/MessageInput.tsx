"use client"

import * as React from "react"
import { IconSend, IconPaperclip, IconMoodSmile } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface MessageInputProps {
    onSend: (content: string) => void
    disabled?: boolean
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
    const [message, setMessage] = React.useState("")

    const handleSend = () => {
        if (message.trim()) {
            onSend(message.trim())
            setMessage("")
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="border-t border-border bg-card/50 backdrop-blur px-4 py-3">
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 border border-border px-3 py-2">
                {/* Message input */}
                <Input
                    type="text"
                    placeholder='Type here ...'
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:border-0 px-0 h-8"
                />

                {/* Action buttons */}
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-foreground hover:bg-muted"
                        disabled={disabled}
                    >
                        <IconPaperclip className="size-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-foreground hover:bg-muted"
                        disabled={disabled}
                    >
                        <IconMoodSmile className="size-4" />
                    </Button>
                </div>

                {/* Send button */}
                <Button
                    onClick={handleSend}
                    disabled={!message.trim() || disabled}
                    size="sm"
                    className="shrink-0 gap-1.5"
                >
                    Send
                    <IconSend className="size-3.5" />
                </Button>
            </div>
        </div>
    )
}
