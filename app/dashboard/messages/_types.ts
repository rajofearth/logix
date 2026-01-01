import type { DriverDTO } from "@/app/dashboard/driver/_types"

export interface MessageDTO {
    id: string
    content: string
    timestamp: Date
    status: "sent" | "delivered" | "read"
}

export interface ConversationDTO {
    driver: DriverDTO
    messages: MessageDTO[]
    lastMessageAt: Date | null
    unreadCount: number
}

// Mock data for development
export const mockMessages: MessageDTO[] = [
    {
        id: "msg-1",
        content: "Please pick up the package from Warehouse A and deliver to the downtown location.",
        timestamp: new Date(Date.now() - 3600000 * 2),
        status: "read",
    },
    {
        id: "msg-2", 
        content: "Update: The customer requested delivery between 2-4 PM. Please adjust your route accordingly.",
        timestamp: new Date(Date.now() - 3600000),
        status: "delivered",
    },
    {
        id: "msg-3",
        content: "Reminder: Don't forget to collect the signature upon delivery.",
        timestamp: new Date(Date.now() - 1800000),
        status: "sent",
    },
]
