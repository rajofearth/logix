import type { NextRequest } from "next/server";

import { jsonError, jsonOk } from "@/app/api/_utils/json";
import { createNotificationEvent } from "@/lib/notifications/notify";
import { parseRestockResponse } from "../../_utils/parseRestockResponse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Construct the full URL for the AI endpoint
    const baseUrl = new URL(req.url);
    const aiUrl = new URL("/api/warehouse/restock-ai-all", baseUrl.origin);
    
    // Call the AI endpoint to get restock analysis
    const aiResponse = await fetch(aiUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json().catch(() => ({ error: "AI request failed" }));
      console.error("[API] restock-ai-all/notify: AI request failed", errorData);
      return jsonError(errorData.error || "Failed to get AI analysis", aiResponse.status);
    }

    const aiData = await aiResponse.json();
    const responseText = aiData.response || "";

    if (!responseText || responseText.trim().length === 0) {
      return jsonOk({ message: "No restock recommendations", notificationsCreated: 0 });
    }

    // Parse the response into individual notifications
    const notifications = parseRestockResponse(responseText);

    if (notifications.length === 0) {
      return jsonOk({ message: "No notifications to create", notificationsCreated: 0 });
    }

    // Create notifications
    const createdNotifications = await Promise.allSettled(
      notifications.map((notif) =>
        createNotificationEvent({
          type: "warehouse",
          title: notif.title,
          message: notif.message,
          actionUrl: "/dashboard/warehouse",
        })
      )
    );

    const successCount = createdNotifications.filter((r) => r.status === "fulfilled").length;
    const failedCount = createdNotifications.filter((r) => r.status === "rejected").length;

    if (failedCount > 0) {
      console.error(
        `[API] restock-ai-all/notify: Failed to create ${failedCount} notifications`,
        createdNotifications.filter((r) => r.status === "rejected")
      );
    }

    return jsonOk({
      message: `Created ${successCount} notifications`,
      notificationsCreated: successCount,
      notificationsFailed: failedCount,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[API] restock-ai-all/notify error:", e);
    return jsonError(msg, 500);
  }
}
