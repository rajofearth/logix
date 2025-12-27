import type { SandboxResponse } from "./types";
import { getSandboxConfig } from "./config";

type TokenCache = {
  token: string;
  expiresAtMs: number;
};

let cache: TokenCache | null = null;

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return Buffer.from(padded, "base64").toString("utf8");
}

function tryGetJwtExpMs(token: string): number | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payloadJson = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadJson) as { exp?: number };
    if (!payload.exp) return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

export async function getSandboxAccessToken(): Promise<string> {
  const now = Date.now();
  if (cache && cache.expiresAtMs - now > 60_000) {
    return cache.token;
  }

  const cfg = getSandboxConfig();
  const res = await fetch(`${cfg.baseUrl}/authenticate`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-api-key": cfg.apiKey,
      "x-api-secret": cfg.apiSecret,
      "x-api-version": cfg.apiVersion,
    },
  });

  const json = (await res.json()) as SandboxResponse<{
    access_token?: string;
  }> & {
    access_token?: string;
    data?: { access_token?: string };
  };

  if (!res.ok) {
    const msg =
      "message" in json && typeof json.message === "string"
        ? json.message
        : `Sandbox authenticate failed (${res.status})`;
    throw new Error(msg);
  }

  const token =
    (typeof json.access_token === "string" && json.access_token) ||
    (json.data && typeof json.data.access_token === "string" && json.data.access_token) ||
    null;

  if (!token) {
    throw new Error("Sandbox authenticate succeeded but access_token was missing in response.");
  }

  const expMs = tryGetJwtExpMs(token) ?? now + 23 * 60 * 60 * 1000;
  cache = { token, expiresAtMs: expMs };
  return token;
}


