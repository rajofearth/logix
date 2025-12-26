import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { driverAuth } from "@/lib/auth-driver";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  adminProfilePicture: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const session = await auth.api.getSession({
        headers: req.headers,
      });

      if (!session?.user?.id) throw new UploadThingError("Unauthorized");

      return { adminUserId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        adminUserId: metadata.adminUserId,
        fileKey: file.key,
        url: file.ufsUrl,
      };
    }),

  driverAadharCard: f({
    image: {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
    pdf: {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const session = await driverAuth.api.getSession({
        headers: req.headers,
      });

      if (!session?.user?.id) throw new UploadThingError("Unauthorized");

      return { driverId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.driver.update({
        where: { id: metadata.driverId },
        data: {
          aadharCardFile: file.ufsUrl,
          aadharCardFileKey: file.key,
        },
      });

      return { driverId: metadata.driverId, fileKey: file.key, url: file.ufsUrl };
    }),

  driverPanCard: f({
    image: {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
    pdf: {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const session = await driverAuth.api.getSession({
        headers: req.headers,
      });

      if (!session?.user?.id) throw new UploadThingError("Unauthorized");

      return { driverId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.driver.update({
        where: { id: metadata.driverId },
        data: {
          panCardFile: file.ufsUrl,
          panCardFileKey: file.key,
        },
      });

      return { driverId: metadata.driverId, fileKey: file.key, url: file.ufsUrl };
    }),

  driverLicense: f({
    image: {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
    pdf: {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const session = await driverAuth.api.getSession({
        headers: req.headers,
      });

      if (!session?.user?.id) throw new UploadThingError("Unauthorized");

      return { driverId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.driver.update({
        where: { id: metadata.driverId },
        data: {
          driverLicenseFile: file.ufsUrl,
          driverLicenseFileKey: file.key,
        },
      });

      return { driverId: metadata.driverId, fileKey: file.key, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
