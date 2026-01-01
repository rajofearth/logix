"use server"

import type { ProjectDTO, ProjectStatus, ProjectStats } from "../_types"

// Mock data for projects
const mockProjects: ProjectDTO[] = [
    {
        id: "proj-1",
        name: "Warehouse Logistics Optimization",
        description: "Optimize route planning for warehouse deliveries",
        client: "Acme Corp",
        status: "active",
        progress: 75,
        startDate: "2025-11-01",
        dueDate: "2026-01-31",
        teamMembers: [
            { id: "tm-1", name: "John Doe", avatar: null },
            { id: "tm-2", name: "Jane Smith", avatar: null },
            { id: "tm-3", name: "Mike Johnson", avatar: null },
        ],
        tags: ["logistics", "optimization"],
    },
    {
        id: "proj-2",
        name: "Fleet Management System",
        description: "Real-time tracking and management of delivery fleet",
        client: "Global Logistics Inc",
        status: "active",
        progress: 45,
        startDate: "2025-12-01",
        dueDate: "2026-03-15",
        teamMembers: [
            { id: "tm-4", name: "Sarah Williams", avatar: null },
            { id: "tm-5", name: "Tom Brown", avatar: null },
        ],
        tags: ["fleet", "tracking"],
    },
    {
        id: "proj-3",
        name: "Delivery Route Planner",
        description: "AI-powered route optimization for last-mile delivery",
        client: "QuickShip Ltd",
        status: "completed",
        progress: 100,
        startDate: "2025-08-15",
        dueDate: "2025-12-20",
        teamMembers: [
            { id: "tm-1", name: "John Doe", avatar: null },
            { id: "tm-6", name: "Emily Davis", avatar: null },
        ],
        tags: ["AI", "routing"],
    },
    {
        id: "proj-4",
        name: "Inventory Tracking Module",
        description: "Real-time inventory tracking across warehouses",
        client: "StoreSmart",
        status: "on-hold",
        progress: 30,
        startDate: "2025-10-01",
        dueDate: "2026-02-28",
        teamMembers: [
            { id: "tm-2", name: "Jane Smith", avatar: null },
        ],
        tags: ["inventory", "warehouse"],
    },
    {
        id: "proj-5",
        name: "Driver Performance Dashboard",
        description: "Analytics dashboard for driver performance metrics",
        client: "TransportCo",
        status: "pending",
        progress: 0,
        startDate: "2026-01-15",
        dueDate: "2026-04-30",
        teamMembers: [
            { id: "tm-3", name: "Mike Johnson", avatar: null },
            { id: "tm-4", name: "Sarah Williams", avatar: null },
            { id: "tm-5", name: "Tom Brown", avatar: null },
            { id: "tm-6", name: "Emily Davis", avatar: null },
        ],
        tags: ["analytics", "dashboard"],
    },
    {
        id: "proj-6",
        name: "Customer Portal Redesign",
        description: "Modern redesign of customer-facing tracking portal",
        client: "Acme Corp",
        status: "active",
        progress: 60,
        startDate: "2025-11-15",
        dueDate: "2026-02-15",
        teamMembers: [
            { id: "tm-6", name: "Emily Davis", avatar: null },
            { id: "tm-1", name: "John Doe", avatar: null },
        ],
        tags: ["UI", "customer"],
    },
    {
        id: "proj-7",
        name: "API Integration Suite",
        description: "Third-party API integrations for logistics partners",
        client: "Global Logistics Inc",
        status: "completed",
        progress: 100,
        startDate: "2025-07-01",
        dueDate: "2025-11-30",
        teamMembers: [
            { id: "tm-5", name: "Tom Brown", avatar: null },
        ],
        tags: ["API", "integration"],
    },
    {
        id: "proj-8",
        name: "Mobile Driver App",
        description: "Native mobile app for drivers",
        client: "QuickShip Ltd",
        status: "active",
        progress: 85,
        startDate: "2025-09-01",
        dueDate: "2026-01-10",
        teamMembers: [
            { id: "tm-2", name: "Jane Smith", avatar: null },
            { id: "tm-3", name: "Mike Johnson", avatar: null },
        ],
        tags: ["mobile", "driver"],
    },
]

const PAGE_SIZE = 6

export async function listProjects(
    filter: ProjectStatus | "all" = "all",
    search = "",
    page = 1
): Promise<{ projects: ProjectDTO[]; totalPages: number; total: number }> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    let filtered = [...mockProjects]

    // Filter by status
    if (filter !== "all") {
        filtered = filtered.filter((p) => p.status === filter)
    }

    // Filter by search
    if (search.trim()) {
        const q = search.toLowerCase()
        filtered = filtered.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.client?.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q)
        )
    }

    const total = filtered.length
    const totalPages = Math.ceil(total / PAGE_SIZE)
    const start = (page - 1) * PAGE_SIZE
    const projects = filtered.slice(start, start + PAGE_SIZE)

    return { projects, totalPages, total }
}

export async function getProjectStats(): Promise<ProjectStats> {
    await new Promise((resolve) => setTimeout(resolve, 100))

    return {
        all: mockProjects.length,
        active: mockProjects.filter((p) => p.status === "active").length,
        completed: mockProjects.filter((p) => p.status === "completed").length,
        onHold: mockProjects.filter((p) => p.status === "on-hold").length,
        pending: mockProjects.filter((p) => p.status === "pending").length,
    }
}

export async function getProjectById(id: string): Promise<ProjectDTO | null> {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return mockProjects.find((p) => p.id === id) ?? null
}
