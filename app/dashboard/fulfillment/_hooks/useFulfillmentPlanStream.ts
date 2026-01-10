"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type FulfillmentPlanStreamDto = {
  id: string
  masterJobId: string
  status: string
  objective: string
  selectedPlanKey: string | null
  updatedAt: string
  segments: Array<{
    id: string
    sortOrder: number
    mode: string
    status: string
    jobId: string | null
    shipmentId: string | null
    trainShipmentId: string | null
    updatedAt: string
  }>
}

export function useFulfillmentPlanStream(planId: string | null): {
  plan: FulfillmentPlanStreamDto | null
  isConnected: boolean
  isLoading: boolean
  error: string | null
  terminalStatus: string | null
} {
  const [plan, setPlan] = useState<FulfillmentPlanStreamDto | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [terminalStatus, setTerminalStatus] = useState<string | null>(null)

  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectAttemptsRef = useRef(0)

  const connect = useCallback((id: string) => {
    if (eventSourceRef.current) eventSourceRef.current.close()

    setIsLoading(true)
    setError(null)
    setTerminalStatus(null)

    const es = new EventSource(`/api/fulfillment/plans/${id}/stream`)
    eventSourceRef.current = es

    es.addEventListener("connected", () => {
      setIsConnected(true)
      setIsLoading(false)
      reconnectAttemptsRef.current = 0
    })

    es.addEventListener("plan_update", (event) => {
      try {
        const dto = JSON.parse((event as MessageEvent).data) as FulfillmentPlanStreamDto
        setPlan(dto)
      } catch {
        // ignore
      }
    })

    es.addEventListener("completed", (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent).data) as { status?: string }
        setTerminalStatus(payload.status ?? null)
      } catch {
        setTerminalStatus(null)
      }
      setIsConnected(false)
      es.close()
    })

    es.addEventListener("error", () => {
      setIsConnected(false)
      setIsLoading(false)

      const attempts = reconnectAttemptsRef.current
      const delay = Math.min(1000 * Math.pow(2, attempts), 30000)
      reconnectAttemptsRef.current += 1

      if (attempts < 10) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connect(id)
        }, delay)
      } else {
        setError("Connection lost. Please refresh the page.")
      }
    })

    es.onerror = () => {
      // handled by listener above
    }
  }, [])

  useEffect(() => {
    if (!planId) {
      setPlan(null)
      setIsConnected(false)
      setIsLoading(false)
      setError(null)
      setTerminalStatus(null)

      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      return
    }

    connect(planId)

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
    }
  }, [planId, connect])

  return { plan, isConnected, isLoading, error, terminalStatus }
}

