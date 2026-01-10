import * as React from "react"
import { IconMoodSmile, IconPhoto, IconMicrophone } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

interface MessageInputProps {
    onSend: (content: string) => void
    disabled?: boolean
}

// Simple button component for toolbar to avoid heavy imports
const ToolbarButton = ({ icon: Icon, onClick, label }: { icon: React.ElementType, onClick?: () => void, label: string }) => (
    <button
        onClick={onClick}
        title={label}
        className="p-1 rounded hover:bg-[#cce8ff] hover:border-[#99d1ff] border border-transparent text-[#1e5774]"
    >
        <Icon className="size-4" />
    </button>
)

export function MessageInput({ onSend, disabled }: MessageInputProps) {
    const [message, setMessage] = React.useState("")

    const handleSend = () => {
        if (message.trim()) {
            onSend(message.trim())
            setMessage("")
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="flex flex-col border-t border-[#d9d9d9] bg-[#f0f0f0]">
            {/* Toolbar */}
            <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-b from-[#f7f7f7] to-[#e3e3e3] border-b border-[#d9d9d9]">
                <ToolbarButton icon={IconMoodSmile} label="Emoticons" />
                <ToolbarButton icon={IconPhoto} label="Send a photo" />
                <ToolbarButton icon={IconMicrophone} label="Voice clip" />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white">
                <textarea
                    placeholder='Type a message...'
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    className="w-full h-16 resize-none border-0 focus:ring-0 p-0 text-sm font-['Segoe_UI'] bg-transparent outline-none placeholder:italic placeholder:text-gray-400"
                />
            </div>

            {/* Footer / Send Button */}
            <div className="px-3 pb-3 flex justify-end bg-white">
                <button
                    onClick={handleSend}
                    disabled={!message.trim() || disabled}
                    className={cn(
                        "px-6 py-1 border rounded-[3px] text-sm font-['Segoe_UI'] flex items-center gap-2 transition-all",
                        "bg-gradient-to-b from-[#f2f2f2] to-[#cfcfcf] border-[#707070] text-[#1e5774] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)]",
                        "hover:from-[#eaf6fd] hover:to-[#a7d9f5] hover:border-[#3c7fb1]",
                        "active:bg-[#e5f4fc] active:border-[#3c7fb1] active:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]",
                        disabled && "opacity-50 grayscale cursor-not-allowed"
                    )}
                >
                    <span>Send</span>
                </button>
            </div>
        </div>
    )
}
