import { z } from "zod";

const SandboxConfigSchema = z.object({
  apiKey: z.string().min(1),
  apiSecret: z.string().min(1),
  baseUrl: z.string().url().default("https://api.sandbox.co.in"),
  apiVersion: z.string().min(1).default("1.0.0"),
  aadhaarApiVersion: z.string().min(1).default("2.0"),
});

export type SandboxConfig = z.infer<typeof SandboxConfigSchema>;

export function getSandboxConfig(): SandboxConfig {
  const parsed = SandboxConfigSchema.safeParse({
    apiKey: process.env.SANDBOX_API_KEY,
    apiSecret: process.env.SANDBOX_API_SECRET,
    baseUrl: process.env.SANDBOX_BASE_URL ?? "https://api.sandbox.co.in",
    apiVersion: process.env.SANDBOX_API_VERSION ?? "1.0.0",
    aadhaarApiVersion: process.env.SANDBOX_AADHAAR_API_VERSION ?? "2.0",
  });

  if (!parsed.success) {
    throw new Error(
      `Sandbox credentials not configured. Please set SANDBOX_API_KEY and SANDBOX_API_SECRET.\n${parsed.error.message}`,
    );
  }

  return parsed.data;
}


