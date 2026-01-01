"use server"

import { prisma } from "@/lib/prisma"

export type AvailableDriverDTO = {
    id: string
    name: string
    photoUrl: string | null
}

export async function listAvailableDrivers(): Promise<AvailableDriverDTO[]> {
    const drivers = await prisma.driver.findMany({
        where: { status: "available" },
        select: { id: true, name: true, photoUrl: true },
        orderBy: { name: "asc" },
    })
    return drivers
}
