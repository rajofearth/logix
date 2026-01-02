"use client"

import * as React from "react"
import { IconSend } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"

import type { Team } from "../_server/teamsData"

interface CommentPopoverProps {
    team: Team | null
    open: boolean
    onOpenChange: (open: boolean) => void
    anchorEl?: HTMLElement | null
    onSend: (teamId: string, content: string) => void
}

export function CommentPopover({
    team,
    open,
    onOpenChange,
    onSend,
}: CommentPopoverProps) {
    const [content, setContent] = React.useState("")

    const handleSend = () => {
        if (team && content.trim()) {
            onSend(team.id, content)
            setContent("")
            onOpenChange(false)
        }
    }

    if (!team) return null

    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger className="hidden" />
            <PopoverContent
                className="w-80"
                side="bottom"
                align="end"
            >
                <PopoverHeader>
                    <PopoverTitle>Comment on {team.name}</PopoverTitle>
                </PopoverHeader>
                <div className="flex flex-col gap-3">
                    <Textarea
                        placeholder={`@${team.name.split(" ")[0]} Add your comment...`}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={3}
                        className="resize-none"
                    />
                    <div className="flex justify-end">
                        <Button size="sm" onClick={handleSend} disabled={!content.trim()}>
                            <IconSend className="size-4" />
                            Send
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

// Standalone comment popover that can be positioned
export function CommentPopoverStandalone({
    team,
    open,
    onOpenChange,
    onSend,
    triggerRef,
}: CommentPopoverProps & { triggerRef: React.RefObject<HTMLButtonElement | null> }) {
    const [content, setContent] = React.useState("")

    const handleSend = () => {
        if (team && content.trim()) {
            onSend(team.id, content)
            setContent("")
            onOpenChange(false)
        }
    }

    React.useEffect(() => {
        if (!open) {
            setContent("")
        }
    }, [open])

    if (!team || !open) return null

    // Get position from trigger ref
    const triggerRect = triggerRef.current?.getBoundingClientRect()
    const top = triggerRect ? triggerRect.bottom + 8 : 0
    const left = triggerRect ? triggerRect.right - 320 : 0

    return (
        <div
            className="fixed z-50 w-80 rounded-lg border bg-popover p-3 shadow-lg"
            style={{ top, left: Math.max(16, left) }}
        >
            <div className="mb-3">
                <h4 className="text-sm font-medium">Comment on {team.name}</h4>
            </div>
            <div className="flex flex-col gap-3">
                <Textarea
                    placeholder={`@${team.name.split(" ")[0]} Add your comment...`}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={3}
                    className="resize-none"
                />
                <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button size="sm" onClick={handleSend} disabled={!content.trim()}>
                        <IconSend className="size-4" />
                        Send
                    </Button>
                </div>
            </div>
        </div>
    )
}
