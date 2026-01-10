"use client"

import * as React from "react"
// ... imports
import { IconPhone, IconMapPin, IconTrash } from "@tabler/icons-react"

import type { DriverDTO } from "@/app/dashboard/driver/_types"

import { getInitials } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
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

// Win7 GroupBox Component
const GroupBox = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <fieldset className="border border-[#d0d0bf] rounded p-2 pt-1 mb-3">
        <legend className="px-1 text-[#1e5774] text-xs font-semibold">{label}</legend>
        {children}
    </fieldset>
)

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
            <div className="flex h-full items-center justify-center p-4 bg-[#f0f0f0] font-['Segoe_UI']">
                <p className="text-xs text-gray-500 italic">
                    Select a contact to view details
                </p>
            </div>
        )
    }

    const statusLabel =
        driver.status === "available" ? "Online" :
            driver.status === "on-route" ? "On Route" : "Offline"

    return (
        <div className="flex h-full flex-col bg-[#f0f0f0] font-['Segoe_UI'] overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-gradient-to-b from-white to-[#f0f0f0] border-b border-[#d9d9d9] flex flex-col items-center text-center">
                <div className="size-20 bg-white p-1 border border-[#a0a0a0] shadow-md rounded-[3px] mb-2 transform -rotate-1">
                    <Avatar className="size-full rounded-none">
                        <AvatarImage src={driver.avatar ?? undefined} alt={driver.name} />
                        <AvatarFallback className="rounded-none bg-[#e1e1e1] text-[#555] text-2xl">{getInitials(driver.name)}</AvatarFallback>
                    </Avatar>
                </div>
                <h3 className="text-base font-bold text-[#1e5774] drop-shadow-[0_1px_0_white]">
                    {driver.name}
                </h3>
                <div className="mt-1 px-2 py-0.5 rounded bg-white border border-[#d9d9d9] text-[10px] text-gray-600 shadow-sm">
                    {statusLabel}
                </div>
            </div>

            {/* Details Content */}
            <ScrollArea className="flex-1">
                <div className="p-3">
                    <GroupBox label="Contact Information">
                        {driver.phone ? (
                            <div className="flex items-center gap-2 text-xs">
                                <IconPhone className="size-3.5 text-gray-500" />
                                <span className="text-[#333]">{driver.phone}</span>
                            </div>
                        ) : <span className="text-xs text-gray-400 italic">No phone number</span>}
                    </GroupBox>

                    <GroupBox label="Current Status">
                        {driver.currentJob && (
                            <div className="mb-2 text-xs">
                                <span className="text-gray-500 block mb-0.5">Job ID:</span>
                                <span className="text-[#333] font-medium">{driver.currentJob}</span>
                            </div>
                        )}

                        {driver.route ? (
                            <div className="text-xs">
                                <div className="flex items-center gap-1 text-gray-500 mb-1">
                                    <IconMapPin className="size-3.5" />
                                    <span>Route:</span>
                                </div>
                                <div className="pl-4 border-l-2 border-[#d9d9d9] ml-1.5">
                                    <div className="text-[#333]">{driver.route.origin}</div>
                                    <div className="text-[10px] text-gray-400 my-0.5">to</div>
                                    <div className="text-[#333] font-medium">{driver.route.destination}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-xs text-gray-400 italic">No active route</div>
                        )}
                    </GroupBox>

                    <GroupBox label="Personal Notes">
                        <div className="space-y-2 mb-3 max-h-40 overflow-y-auto pr-1">
                            {notes.length === 0 ? (
                                <p className="text-[10px] text-gray-400 text-center py-2 italic">
                                    No notes added
                                </p>
                            ) : (
                                notes.map((note) => (
                                    <div key={note.id} className="bg-white border border-[#d6d6ce] p-1.5 rounded-[2px] shadow-sm relative group">
                                        <p className="text-[11px] text-[#333] whitespace-pre-wrap leading-tight">{note.content}</p>
                                        <div className="flex justify-between items-center mt-1 border-t border-[#f0f0f0] pt-0.5">
                                            <span className="text-[9px] text-gray-400">{formatNoteTime(note.timestamp)}</span>
                                            <button
                                                onClick={() => handleDeleteNote(note.id)}
                                                className="opacity-0 group-hover:opacity-100 p-0.5 text-red-400 hover:text-red-600 transition-opacity"
                                            >
                                                <IconTrash className="size-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Note Input */}
                        <div className="relative">
                            <textarea
                                placeholder="Add a note..."
                                value={noteInput}
                                onChange={(e) => setNoteInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                rows={2}
                                className="w-full resize-none border border-[#7f9db9] rounded-[2px] p-1 text-xs font-['Segoe_UI'] outline-none focus:border-[#3c7fb1]"
                            />
                            <div className="flex justify-end mt-1">
                                <button
                                    onClick={handleAddNote}
                                    disabled={!noteInput.trim()}
                                    className="px-2 py-0.5 bg-[#f0f0f0] border border-[#707070] text-[10px] rounded-[2px] hover:bg-[#eaf6fd] hover:border-[#3c7fb1] disabled:opacity-50"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </GroupBox>
                </div>
            </ScrollArea>
        </div>
    )
}
