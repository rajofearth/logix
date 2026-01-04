export type ChatMessage = {
    id: string
    threadId: string
    senderType: "admin" | "driver"
    content: string
    createdAt: string // ISO
}

