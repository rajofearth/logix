import type { DriverStatus as PrismaDriverStatus } from "@/generated/prisma/client"

// Map Prisma enum to frontend display values
export type DriverStatus = "available" | "on-route" | "off-duty"

// Convert Prisma status to frontend status
export function toFrontendStatus(prismaStatus: PrismaDriverStatus): DriverStatus {
    switch (prismaStatus) {
        case "available":
            return "available"
        case "on_route":
            return "on-route"
        case "off_duty":
            return "off-duty"
        default: {
            // Exhaustive check
            const _exhaustive: never = prismaStatus
            return _exhaustive
        }
    }
}

// Convert frontend status to Prisma status
export function toPrismaStatus(frontendStatus: DriverStatus | "all"): PrismaDriverStatus | undefined {
    switch (frontendStatus) {
        case "all":
            return undefined
        case "available":
            return "available"
        case "on-route":
            return "on_route"
        case "off-duty":
            return "off_duty"
        default: {
            // Exhaustive check
            const _exhaustive: never = frontendStatus
            return _exhaustive
        }
    }
}

export interface DriverDTO {
    id: string
    name: string
    phone: string | null
    avatar: string | null
    status: DriverStatus
    currentJob: string | null
    route: {
        origin: string
        destination: string
    } | null
}
