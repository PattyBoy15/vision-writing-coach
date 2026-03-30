'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function generateCode() {
  return Math.random().toString(36).substring(2, 9)
}

export interface SessionFields {
  vision: string
  strategy: string
  success: string
  productName: string
}

export interface UseSessionReturn extends SessionFields {
  setVision: (v: string) => void
  setStrategy: (v: string) => void
  setSuccess: (v: string) => void
  setProductName: (v: string) => void
  sessionCode: string
  saveStatus: string
  saveStatusClass: string
  copyLink: () => void
  scheduleSave: () => void
}

export function useSession(): UseSessionReturn {
  const [vision, setVision] = useState('')
  const [strategy, setStrategy] = useState('')
  const [success, setSuccess] = useState('')
  const [productName, setProductName] = useState('')
  const [sessionCode, setSessionCode] = useState('')
  const [saveStatus, setSaveStatus] = useState('')
  const [saveStatusClass, setSaveStatusClass] = useState('save-status')

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fieldsRef = useRef({ vision, strategy, success, productName })

  // Keep fieldsRef in sync so scheduleSave always has latest values
  useEffect(() => {
    fieldsRef.current = { vision, strategy, success, productName }
  }, [vision, strategy, success, productName])

  const showSaveStatus = useCallback((msg: string, cls: string) => {
    setSaveStatus(msg)
    setSaveStatusClass(`save-status visible ${cls}`)
    if (statusTimer.current) clearTimeout(statusTimer.current)
    statusTimer.current = setTimeout(() => {
      setSaveStatusClass('save-status')
    }, 2000)
  }, [])

  const saveSession = useCallback(async (code: string) => {
    const { vision, strategy, success, productName } = fieldsRef.current
    // Local storage
    localStorage.setItem('vwc_vision', vision)
    localStorage.setItem('vwc_strategy', strategy)
    localStorage.setItem('vwc_success', success)
    localStorage.setItem('vwc_product', productName)
    showSaveStatus('Saved', 'saved')
    // Supabase (silent fail)
    try {
      await supabase.from('sessions').update({
        product_name: productName,
        vision,
        strategy,
        successful_when: success,
        last_updated: new Date().toISOString(),
      }).eq('session_code', code)
    } catch {}
  }, [showSaveStatus])

  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      const code = localStorage.getItem('vwc_session_code') || ''
      if (code) saveSession(code)
    }, 1500)
  }, [saveSession])

  const copyLink = useCallback(() => {
    const code = localStorage.getItem('vwc_session_code') || sessionCode
    const base = window.location.href.split('?')[0]
    navigator.clipboard.writeText(`${base}?s=${code}`).catch(() => {})
  }, [sessionCode])

  // Init session on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlCode = urlParams.get('s')
    const code = urlCode || localStorage.getItem('vwc_session_code') || generateCode()
    localStorage.setItem('vwc_session_code', code)
    setSessionCode(code)
    window.history.replaceState({}, '', `?s=${code}`)

    // Load from local storage first (instant)
    const localVision = localStorage.getItem('vwc_vision') || ''
    const localStrategy = localStorage.getItem('vwc_strategy') || ''
    const localSuccess = localStorage.getItem('vwc_success') || ''
    const localProduct = localStorage.getItem('vwc_product') || ''
    if (localVision) setVision(localVision)
    if (localStrategy) setStrategy(localStrategy)
    if (localSuccess) setSuccess(localSuccess)
    if (localProduct) setProductName(localProduct)

    // Then try Supabase
    ;(async () => {
      try {
        const { data } = await supabase
          .from('sessions')
          .select('*')
          .eq('session_code', code)
          .single()
        if (data?.vision) {
          setProductName(data.product_name || '')
          setVision(data.vision || '')
          setStrategy(data.strategy || '')
          setSuccess(data.successful_when || '')
        } else {
          await supabase.from('sessions').upsert({ session_code: code })
        }
      } catch {}
    })()
  }, [])

  return {
    vision, setVision,
    strategy, setStrategy,
    success, setSuccess,
    productName, setProductName,
    sessionCode,
    saveStatus,
    saveStatusClass,
    copyLink,
    scheduleSave,
  }
}
