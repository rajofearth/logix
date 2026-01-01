export type ProjectStatus = "active" | "completed" | "on-hold" | "pending"

export interface TeamMember {
    id: string
    name: string
    avatar?: string | null
}

export interface ProjectDTO {
    id: string
    name: string
    description?: string | null
    client?: string | null
    status: ProjectStatus
    progress: number // 0-100
    startDate: string
    dueDate?: string | null
    teamMembers: TeamMember[]
    tags?: string[]
}

export interface ProjectStats {
    all: number
    active: number
    completed: number
    onHold: number
    pending: number
}
