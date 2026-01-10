export type LmstudioChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatCompletionStreamChunk = {
  choices?: Array<{
    delta?: { content?: string };
    text?: string;
    finish_reason?: string | null;
  }>;
};

export type LmstudioStreamParams = {
  baseUrl: string;
  model: string;
  temperature?: number;
  messages: LmstudioChatMessage[];
  signal?: AbortSignal;
};

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

export async function* streamLmstudioChatCompletions(
  params: LmstudioStreamParams
): AsyncGenerator<string> {
  const url = `${normalizeBaseUrl(params.baseUrl)}/v1/chat/completions`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: params.model,
      stream: true,
      temperature: params.temperature ?? 0.2,
      messages: params.messages,
    }),
    signal: params.signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`LMStudio error: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`);
  }
  if (!res.body) {
    throw new Error("LMStudio response has no body");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Process complete lines (SSE is line-based).
    while (true) {
      const nl = buffer.indexOf("\n");
      if (nl === -1) break;
      const line = buffer.slice(0, nl).trimEnd();
      buffer = buffer.slice(nl + 1);

      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith(":")) continue; // comment / heartbeat
      if (!trimmed.startsWith("data:")) continue;

      const data = trimmed.slice("data:".length).trim();
      if (!data) continue;
      if (data === "[DONE]") return;

      let parsed: ChatCompletionStreamChunk;
      try {
        parsed = JSON.parse(data) as ChatCompletionStreamChunk;
      } catch {
        continue;
      }

      const choice = parsed.choices?.[0];
      const delta = choice?.delta?.content ?? choice?.text ?? "";
      if (delta) yield delta;
      if (choice?.finish_reason) return;
    }
  }
}

export type LmstudioChatParams = {
  baseUrl: string;
  model: string;
  temperature?: number;
  messages: LmstudioChatMessage[];
  signal?: AbortSignal;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: { content?: string };
    finish_reason?: string | null;
  }>;
};

export async function lmstudioChatCompletions(
  params: LmstudioChatParams
): Promise<string> {
  const url = `${normalizeBaseUrl(params.baseUrl)}/v1/chat/completions`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: params.model,
      stream: false,
      temperature: params.temperature ?? 0.2,
      messages: params.messages,
    }),
    signal: params.signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`LMStudio error: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`);
  }

  const data = (await res.json()) as ChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error("LMStudio response has no content");
  }

  return content;
}

export function sseEncode(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

