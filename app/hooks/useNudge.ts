'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface NudgeOptions {
  text: string
  vision: string
  strategy: string
  success: string
  minLength?: number
  debounceMs?: number
}

interface NudgeResult {
  nudge: string | null
  loading: boolean
  dismissed: boolean
  dismiss: () => void
}

export function useNudge(field: string, options: NudgeOptions): NudgeResult {
  const { text, vision, strategy, success, minLength = 20, debounceMs = 1800 } = options
  const [nudge, setNudge] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Keep latest values accessible inside the timeout without re-creating effect
  const optionsRef = useRef(options)
  useEffect(() => { optionsRef.current = options }, [options])

  useEffect(() => {
    if (dismissed) return
    if (timerRef.current) clearTimeout(timerRef.current)

    if (text.length < minLength) {
      if (abortRef.current) abortRef.current.abort()
      setLoading(false)
      setNudge(null)
      return
    }

    // Hide current nudge while user is typing
    setNudge(null)
    setLoading(true)

    timerRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort()
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const { vision, strategy, success } = optionsRef.current
        const res = await fetch('/api/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field, text, vision, strategy, success }),
          signal: controller.signal,
        })
        if (!res.ok) { setLoading(false); return }
        const data = await res.json()
        setLoading(false)
        setNudge(data.nudge || null)
      } catch (e: unknown) {
        if (e instanceof Error && e.name !== 'AbortError') setLoading(false)
      }
    }, debounceMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, dismissed, field, minLength, debounceMs])

  const dismiss = useCallback(() => {
    setDismissed(true)
    setNudge(null)
  }, [])

  return { nudge, loading, dismissed, dismiss }
}
