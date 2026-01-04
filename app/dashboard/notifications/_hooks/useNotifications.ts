"use client"

import * as React from "react"

import type { NotificationDTO } from "../_types"
import {
  archiveNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../_server/notificationActions"

type UseNotificationsResult = {
  notifications: NotificationDTO[]
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  remove: (id: string) => Promise<void>
}

export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = React.useState<NotificationDTO[]>([])

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await listNotifications()
        if (cancelled) return
        setNotifications(res.notifications)
      } catch (e) {
        console.error("[Notifications] list error:", e)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  React.useEffect(() => {
    const es = new EventSource("/api/notifications/stream")

    const onNotification = (evt: MessageEvent<string>) => {
      try {
        const incoming = JSON.parse(evt.data) as NotificationDTO
        setNotifications((prev) => {
          if (prev.some((n) => n.id === incoming.id)) return prev
          const next = [incoming, ...prev]
          return next.slice(0, 200)
        })
      } catch (e) {
        console.error("[Notifications] SSE parse error:", e)
      }
    }

    es.addEventListener("notification", onNotification as EventListener)

    es.onerror = (e) => {
      // Browser will auto-retry; keep quiet unless debugging
      console.error("[Notifications] SSE error:", e)
    }

    return () => {
      es.removeEventListener("notification", onNotification as EventListener)
      es.close()
    }
  }, [])

  const markAsRead = React.useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    try {
      await markNotificationRead(id)
    } catch (e) {
      console.error("[Notifications] mark read error:", e)
    }
  }, [])

  const markAllAsRead = React.useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    try {
      await markAllNotificationsRead()
    } catch (e) {
      console.error("[Notifications] mark all read error:", e)
    }
  }, [])

  const remove = React.useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    try {
      await archiveNotification(id)
    } catch (e) {
      console.error("[Notifications] archive error:", e)
    }
  }, [])

  return { notifications, markAsRead, markAllAsRead, remove }
}


