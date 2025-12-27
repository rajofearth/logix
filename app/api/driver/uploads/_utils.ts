import { UTApi } from "uploadthing/server";

export const runtime = "nodejs";

export const utapi = new UTApi();

export async function requireFormFile(req: Request): Promise<File> {
  const form = await req.formData();
  const file = form.get("file");
  if (!file) {
    throw new Error("file is required");
  }
  // Handle File (browser) format
  if (file instanceof File) {
    return file;
  }
  // Handle Blob or other file-like objects (React Native)
  if (typeof file === "object" && "stream" in file) {
    const blob = file as Blob;
    const fileWithName = blob as Blob & { name?: string };
    const fileName = fileWithName.name || "upload";
    return new File([blob], fileName, { type: blob.type || "application/octet-stream" });
  }
  throw new Error("file must be a File or Blob");
}


