'use client'

import { useEffect, useRef } from 'react'

export interface HoodEntry {
  id: number
  text: string
  type: 'trigger' | 'info' | 'tool' | 'agent' | 'done'
}

interface UnderTheHoodProps {
  visible: boolean
  active: boolean
  entries: HoodEntry[]
}

export default function UnderTheHood({ visible, active, entries }: UnderTheHoodProps) {
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [entries])

  if (!visible) return null

  return (
    <div className="hood visible">
      <div className="hood-header">
        <span className="hood-title">Under the hood</span>
        <div className={`hood-dot${active ? ' active' : ''}`} />
      </div>
      <div className="hood-log" ref={logRef}>
        {entries.map(entry => (
          <div key={entry.id} className={`hood-entry ${entry.type}`}>
            {entry.text}
          </div>
        ))}
      </div>
    </div>
  )
}
