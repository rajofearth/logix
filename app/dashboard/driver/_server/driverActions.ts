"use server"

import { z } from "zod"

import type { DriverDTO, DriverStatus } from "../_types"
import { toFrontendStatus, toPrismaStatus } from "../_types"
import { prisma } from "@/lib/prisma"

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

// Input validation schemas
const listDriversSchema = z.object({
    filter: z.enum(["all", "available", "on-route", "off-duty"]).optional(),
    search: z.string().optional(),
    page: z.number().int().positive().optional().default(1),
})

function driverToDto(driver: {
    id: string
    name: string
    phoneNumber: string | null
    photoUrl: string | null
    status: "available" | "on_route" | "off_duty"
    jobs: Array<{
        id: string
        title: string
        pickupAddress: string
        dropAddress: string
    }>
}): DriverDTO {
    const currentJob = driver.jobs[0] ?? null

    return {
        id: driver.id,
        name: driver.name,
        phone: driver.phoneNumber,
        avatar: driver.photoUrl,
        status: toFrontendStatus(driver.status),
        currentJob: currentJob?.title ?? null,
        currentJobId: currentJob?.id ?? null,
        route: currentJob
            ? {
                origin: currentJob.pickupAddress,
                destination: currentJob.dropAddress,
            }
            : null,
    }
}

export async function listDrivers(
    filter?: DriverStatus | "all",
    search?: string,
    page = 1
): Promise<DriverListResult> {
    // Validate inputs
    const validated = listDriversSchema.parse({ filter, search, page })
    const prismaStatus = toPrismaStatus(validated.filter ?? "all")

    // Build where clause
    const where = {
        ...(prismaStatus && { status: prismaStatus }),
        ...(validated.search?.trim() && {
            OR: [
                { name: { contains: validated.search.trim(), mode: "insensitive" as const } },
                { phoneNumber: { contains: validated.search.trim() } },
            ],
        }),
    }

    // Get total count
    const total = await prisma.driver.count({ where })
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

    // Get paginated drivers with their current job
    const drivers = await prisma.driver.findMany({
        where,
        include: {
            jobs: {
                where: { status: "in_progress" },
                take: 1, // Only get current/latest job
                orderBy: { createdAt: "desc" },
            },
        },
        orderBy: { createdAt: "desc" },
        skip: (validated.page - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
    })

    return {
        drivers: drivers.map(driverToDto),
        total,
        page: validated.page,
        totalPages,
    }
}

export async function getDriverStats(): Promise<DriverStats> {
    const [all, available, onRoute, offDuty] = await Promise.all([
        prisma.driver.count(),
        prisma.driver.count({ where: { status: "available" } }),
        prisma.driver.count({ where: { status: "on_route" } }),
        prisma.driver.count({ where: { status: "off_duty" } }),
    ])

    return { all, available, onRoute, offDuty }
}
