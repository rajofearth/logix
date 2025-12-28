"use server"

import type { DriverDTO, DriverStatus } from "../_types"
import { mockDrivers } from "../_data"

const ITEMS_PER_PAGE = 6

export interface DriverListResult {
    drivers: DriverDTO[]
    total: number
    page: number
    totalPages: number
}

export interface DriverStats {
    all: number
    available: number
    onRoute: number
    offDuty: number
}

export async function listDrivers(
    filter?: DriverStatus | "all",
    search?: string,
    page = 1
): Promise<DriverListResult> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    let filtered = [...mockDrivers]

    // Apply status filter
    if (filter && filter !== "all") {
        filtered = filtered.filter((d) => d.status === filter)
    }

    // Apply search filter (name or phone)
    if (search && search.trim()) {
        const query = search.toLowerCase().trim()
        filtered = filtered.filter(
            (d) =>
                d.name.toLowerCase().includes(query) ||
                d.phone.includes(query) ||
                d.currentJob?.toLowerCase().includes(query)
        )
    }

    const total = filtered.length
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
    const start = (page - 1) * ITEMS_PER_PAGE
    const drivers = filtered.slice(start, start + ITEMS_PER_PAGE)

    return { drivers, total, page, totalPages }
}

export async function getDriverStats(): Promise<DriverStats> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 50))

    return {
        all: mockDrivers.length,
        available: mockDrivers.filter((d) => d.status === "available").length,
        onRoute: mockDrivers.filter((d) => d.status === "on-route").length,
        offDuty: mockDrivers.filter((d) => d.status === "off-duty").length,
    }
}
