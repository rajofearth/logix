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
  const res = await fetch(`${cfg.baseUrl}${path}`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-api-key": cfg.apiKey,
      "x-api-version": options?.apiVersion ?? cfg.apiVersion,
      // IMPORTANT: Sandbox token is NOT a bearer token
      authorization: token,
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as SandboxResponse<TResData>;
  if (!res.ok) {
    const msg =
      json && typeof json === "object" && "message" in json && typeof json.message === "string"
        ? json.message
        : `Sandbox request failed (${res.status})`;
    throw new Error(msg);
  }
  return json;
}


