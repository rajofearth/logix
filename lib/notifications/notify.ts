import { prisma } from "@/lib/prisma"
import type { NotificationType, Prisma } from "@prisma/client"

export type CreateNotificationEventInput = {
  type: NotificationType
  title: string
  message: string
  actionUrl?: string
  metadata?: Prisma.InputJsonValue
}

export async function createNotificationEvent(
  input: CreateNotificationEventInput
): Promise<{ eventId: string }> {
  return prisma.$transaction(async (tx) => {
    const admins = await tx.adminUser.findMany({ select: { id: true } })

    const event = await tx.notificationEvent.create({
      data: {
        type: input.type,
        title: input.title,
        message: input.message,
        actionUrl: input.actionUrl,
        metadata: input.metadata,
      },
      select: { id: true },
    })

    if (admins.length > 0) {
      await tx.notificationReceipt.createMany({
        data: admins.map((a) => ({
          userId: a.id,
          eventId: event.id,
        })),
        skipDuplicates: true,
      })
    }

    return { eventId: event.id }
  })
}

export const notify = {
  jobCreated: async (args: {
    jobId: string
    title: string
    driverName?: string | null
  }) =>
    createNotificationEvent({
      type: "job",
      title: "New job created",
      message: args.driverName
        ? `${args.title} was created and assigned to ${args.driverName}.`
        : `${args.title} was created.`,
      actionUrl: "/dashboard/jobs",
      metadata: { jobId: args.jobId },
    }),

  jobUpdated: async (args: { jobId: string; title: string }) =>
    createNotificationEvent({
      type: "job",
      title: "Job updated",
      message: `${args.title} was updated.`,
      actionUrl: "/dashboard/jobs",
      metadata: { jobId: args.jobId },
    }),

  jobDeleted: async (args: { jobId: string; title?: string | null }) =>
    createNotificationEvent({
      type: "job",
      title: "Job deleted",
      message: args.title ? `${args.title} was deleted.` : "A job was deleted.",
      actionUrl: "/dashboard/jobs",
      metadata: { jobId: args.jobId },
    }),

  driverStartedJob: async (args: {
    jobId: string
    jobTitle: string
    driverName?: string | null
  }) =>
    createNotificationEvent({
      type: "driver",
      title: "Driver started job",
      message: args.driverName
        ? `${args.driverName} started ${args.jobTitle}.`
        : `A driver started ${args.jobTitle}.`,
      actionUrl: "/dashboard/driver",
      metadata: { jobId: args.jobId },
    }),

  driverCompletedJob: async (args: {
    jobId: string
    jobTitle: string
    driverName?: string | null
  }) =>
    createNotificationEvent({
      type: "driver",
      title: "Job completed",
      message: args.driverName
        ? `${args.driverName} completed ${args.jobTitle}.`
        : `A driver completed ${args.jobTitle}.`,
      actionUrl: "/dashboard/jobs",
      metadata: { jobId: args.jobId },
    }),

  packageVerificationSubmitted: async (args: {
    jobId: string
    phase: "pickup" | "delivery"
    passed: boolean
    damagePercentage?: number
  }) =>
    createNotificationEvent({
      type: "packageVerification",
      title: "Package verification submitted",
      message:
        args.phase === "pickup"
          ? `Pickup scan submitted (${args.passed ? "passed" : "failed"}${typeof args.damagePercentage === "number"
            ? `, ${args.damagePercentage.toFixed(1)}% damage`
            : ""
          }).`
          : "Delivery scan submitted.",
      actionUrl: "/dashboard/package-scans",
      metadata: {
        jobId: args.jobId,
        phase: args.phase,
        passed: args.passed,
        damagePercentage: args.damagePercentage,
      },
    }),
} as const


