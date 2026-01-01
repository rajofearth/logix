"use client"

import * as React from "react"
import { IconPhone, IconMapPin, IconNotes, IconPencil, IconTrash } from "@tabler/icons-react"

import type { DriverDTO } from "@/app/dashboard/driver/_types"
import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Note {
    id: string
    content: string
    author: string
    timestamp: Date
}

interface DriverInfoPanelProps {
    driver: DriverDTO | null
}

function formatNoteTime(date: Date): string {
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

export function DriverInfoPanel({ driver }: DriverInfoPanelProps) {
    const [noteInput, setNoteInput] = React.useState("")
    const [notes, setNotes] = React.useState<Note[]>([])

    // Reset notes when driver changes
    React.useEffect(() => {
        setNotes([])
        setNoteInput("")
    }, [driver?.id])

    const handleAddNote = () => {
        if (noteInput.trim()) {
            const newNote: Note = {
                id: `note-${Date.now()}`,
                content: noteInput.trim(),
                author: "You",
                timestamp: new Date(),
            }
            setNotes((prev) => [newNote, ...prev])
            setNoteInput("")
        }
    }

    const handleDeleteNote = (noteId: string) => {
        setNotes((prev) => prev.filter((note) => note.id !== noteId))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleAddNote()
        }
    }

    if (!driver) {
        return (
            <div className="flex h-full items-center justify-center border-l border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">
                    Select a driver to view details
                </p>
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
        <div className="flex h-full flex-col border-l border-border bg-card">
            {/* Header with avatar and name */}
            <div className="border-b border-border p-4">
                <div className="flex items-center gap-3">
                    <Avatar size="lg">
                        <AvatarImage
                            src={driver.avatar ?? undefined}
                            alt={driver.name}
                        />
                        <AvatarFallback>{getInitials(driver.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">
                            {driver.name}
                        </h3>
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

            {/* Driver details */}
            <div className="p-4 border-b border-border">
                <div className="space-y-4">
                    {/* Phone */}
                    {driver.phone && (
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <IconPhone className="size-3.5" />
                                <span>Phone</span>
                            </div>
                            <p className="text-sm text-foreground pl-5.5">
                                {driver.phone}
                            </p>
                        </div>
                    )}

                    {/* Route */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <IconMapPin className="size-3.5" />
                            <span>Route</span>
                        </div>
                        {driver.route ? (
                            <div className="text-sm text-foreground pl-5.5">
                                <p className="font-medium">{driver.route.origin}</p>
                                <p className="text-primary my-0.5">↓</p>
                                <p className="font-medium">{driver.route.destination}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic pl-5.5">
                                No active route
                            </p>
                        )}
                    </div>

                    {/* Current Job */}
                    {driver.currentJob && (
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">
                                Current Job
                            </p>
                            <p className="text-sm text-foreground">
                                {driver.currentJob}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Notes section */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground px-4 pt-4 pb-2">
                    <IconNotes className="size-3.5" />
                    <span>Notes</span>
                </div>

                {/* Pinned notes list - scrollable area above input */}
                <ScrollArea className="flex-1 px-4">
                    <div className="space-y-3">
                        {notes.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-4">
                                No notes yet
                            </p>
                        ) : (
                            notes.map((note) => (
                                <div
                                    key={note.id}
                                    className="rounded-lg bg-muted/30 border border-border p-3"
                                >
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <Avatar size="sm">
                                            <AvatarFallback className="text-[0.5rem]">
                                                {getInitials(note.author)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-foreground">
                                                {note.author}
                                            </p>
                                            <p className="text-[0.65rem] text-muted-foreground">
                                                {formatNoteTime(note.timestamp)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteNote(note.id)}
                                            className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <IconTrash className="size-3" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-foreground/80 whitespace-pre-wrap">
                                        {note.content}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>

                {/* Notes input - fixed at bottom */}
                <div className="px-4 py-3 border-t border-border mt-auto">
                    <div className="flex items-start gap-2 rounded-lg bg-muted/50 border border-border p-2">
                        <Textarea
                            placeholder="Write a note..."
                            value={noteInput}
                            onChange={(e) => setNoteInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="min-h-[40px] max-h-[80px] border-0 bg-transparent focus-visible:ring-0 resize-none p-0 text-sm"
                            rows={1}
                        />
                        <div className="flex gap-1 shrink-0">
                            <IconPencil className="size-4 text-muted-foreground" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
