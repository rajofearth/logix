export type DriverStatus = "available" | "on-route" | "off-duty"

export interface DriverDTO {
    id: string
    name: string
    phone: string
    avatar?: string
    status: DriverStatus
    currentJob?: string
    route?: {
        origin: string
        destination: string
    }
}
