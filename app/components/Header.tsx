'use client'

import { useState } from 'react'

interface HeaderProps {
  saveStatusClass: string
  saveStatus: string
  onCopyLink: () => void
}

export default function Header({ saveStatusClass, saveStatus, onCopyLink }: HeaderProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    onCopyLink()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="header">
      <span className="header-brand">Vision Writing Coach</span>
      <div className="header-right">
        <span className={saveStatusClass}>{saveStatus}</span>
        <div className="presence-bar">
          <div className="avatar you">PM</div>
          <div className="avatar" title="Collaborator">JK</div>
          <div className="avatar" title="Collaborator">MR</div>
        </div>
        <button
          className={`btn-copy${copied ? ' copied' : ''}`}
          onClick={handleCopy}
        >
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>
    </div>
  )
}
