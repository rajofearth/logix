import { getSandboxConfig } from "./config";
import { getSandboxAccessToken } from "./token";
import type { SandboxResponse } from "./types";

type SandboxFetchOptions = {
  apiVersion?: string;
};

export async function sandboxPost<TReq extends object, TResData>(
  path: string,
  body: TReq,
  options?: SandboxFetchOptions,
): Promise<SandboxResponse<TResData>> {
  const cfg = getSandboxConfig();
  const token = await getSandboxAccessToken();
  const apiKeyPrefix = cfg.apiKey.startsWith("key_test_") ? "test" : cfg.apiKey.startsWith("key_live_") ? "live" : "unknown";
  const url = `${cfg.baseUrl}${path}`;
  const bodyStr = JSON.stringify(body);
  console.log(`[Sandbox] Request to ${url} (API key: ${apiKeyPrefix}, baseUrl: ${cfg.baseUrl})`);
  console.log(`[Sandbox] Request body:`, bodyStr);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-api-key": cfg.apiKey,
      "x-api-version": options?.apiVersion ?? cfg.apiVersion,
      // IMPORTANT: Sandbox token is NOT a bearer token
      authorization: token,
    },
    body: bodyStr,
  });

  const json = (await res.json()) as SandboxResponse<TResData>;
  
  // Check if response has error structure even if status is ok
  if ("error" in json || ("message" in json && !("data" in json))) {
    const errorMsg =
      json && typeof json === "object" && "message" in json && typeof json.message === "string"
        ? json.message
        : `Sandbox request failed (${res.status})`;
    console.error(`[Sandbox] API error response:`, JSON.stringify(json, null, 2));
    throw new Error(errorMsg);
  }
  
  if (!res.ok) {
    const msg =
      json && typeof json === "object" && "message" in json && typeof json.message === "string"
        ? json.message
        : `Sandbox request failed (${res.status})`;
    console.error(`[Sandbox] HTTP error (${res.status}):`, JSON.stringify(json, null, 2));
    throw new Error(msg);
  }
  
  return json;
}


