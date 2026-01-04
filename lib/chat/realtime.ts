import { getPgPool } from "@/lib/pg";

export type ChatRealtimePayload =
  | {
      type: "message_created";
      threadId: string;
      messageId: string;
      createdAt: string;
    }
  | {
      type: "typing";
      threadId: string;
      senderType: "admin" | "driver";
      createdAt: string;
    };

function safeChannelSuffix(id: string): string {
  // Allow only alphanumeric + underscore; replace others to keep channel safe
  return id.replace(/[^a-zA-Z0-9_]/g, "_");
}

export function chatChannel(threadId: string): string {
  return `chat_thread_${safeChannelSuffix(threadId)}`;
}

export async function notifyThread(
  threadId: string,
  payload: ChatRealtimePayload
): Promise<void> {
  const pool = getPgPool();
  const channel = chatChannel(threadId);
  // Payload is sent as text; keep it small
  const body = JSON.stringify(payload);
  await pool.query("select pg_notify($1, $2)", [channel, body]);
}


