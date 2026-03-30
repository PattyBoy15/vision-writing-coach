'use client'

import { useState, useCallback, useRef } from 'react'
import Header from './components/Header'
import { VisionField, CanvasField, CrossNudge } from './components/CanvasField'
import ResearchPanel, { type Brief, type Review } from './components/ResearchPanel'
import UnderTheHood, { type HoodEntry } from './components/UnderTheHood'
import { useSession } from './hooks/useSession'
import { useNudge } from './hooks/useNudge'

export default function Page() {
  const {
    vision, setVision,
    strategy, setStrategy,
    success, setSuccess,
    productName, setProductName,
    saveStatusClass, saveStatus,
    copyLink, scheduleSave,
  } = useSession()

  // Panel state
  const [panelOpen, setPanelOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'research' | 'review'>('research')
  const [reviewHasBeenUsed, setReviewHasBeenUsed] = useState(false)
  const [brief, setBrief] = useState<Brief | null>(null)
  const [briefLoading, setBriefLoading] = useState(false)
  const [review, setReview] = useState<Review | null>(null)
  const [reviewLoading, setReviewLoading] = useState(false)

  // Under the Hood
  const [hoodVisible, setHoodVisible] = useState(false)
  const [hoodActive, setHoodActive] = useState(false)
  const [hoodEntries, setHoodEntries] = useState<HoodEntry[]>([])
  const hoodTimers = useRef<ReturnType<typeof setTimeout>[]>([])
  const hoodIdRef = useRef(0)

  // Progressive reveal
  const [lowerFieldsVisible, setLowerFieldsVisible] = useState(false)
  const [lowerHintVisible, setLowerHintVisible] = useState(false)
  const revealedRef = useRef(false)
  const hintShownRef = useRef(false)

  // Nudges
  const visionNudge = useNudge('vision', { text: vision, vision, strategy, success, minLength: 20 })
  const strategyNudge = useNudge('strategy', { text: strategy, vision, strategy, success, minLength: 20 })
  const successNudge = useNudge('success', { text: success, vision, strategy, success, minLength: 15 })
  const crossNudge = useNudge('cross', { text: '', vision, strategy, success, minLength: 1, debounceMs: 4000 })

  // ── Hood helpers ──────────────────────────────────────────────────────────

  const hoodClear = useCallback(() => {
    hoodTimers.current.forEach(clearTimeout)
    hoodTimers.current = []
    setHoodEntries([])
    setHoodActive(false)
  }, [])

  const hoodLog = useCallback((text: string, type: HoodEntry['type'] = 'info', delay = 0) => {
    const t = setTimeout(() => {
      hoodIdRef.current += 1
      setHoodEntries(prev => [...prev, { id: hoodIdRef.current, text, type }])
    }, delay)
    hoodTimers.current.push(t)
  }, [])

  const hoodShow = useCallback(() => {
    setHoodVisible(true)
    setHoodActive(true)
  }, [])

  const hoodDone = useCallback(() => setHoodActive(false), [])

  const hoodNudge = useCallback((field: string) => {
    hoodShow()
    hoodClear()
    const fieldName: Record<string, string> = {
      vision: 'Vision', strategy: 'Strategy',
      success: 'Successful When', cross: 'Cross-field coherence',
    }
    hoodLog(`▶ Coaching Agent — ${fieldName[field] || field} field`, 'trigger')
    hoodLog('Runtime: Next.js API Route (Node.js)', 'info', 100)
    hoodLog('Model: llama-3.1-8b-instant via Groq', 'info', 180)
    hoodLog('Pattern: single LLM call with field-specific prompt', 'info', 260)
    if (field === 'cross') {
      hoodLog('Checking coherence across vision → strategy → success...', 'agent', 400)
    } else {
      hoodLog('Analysing for: hollow language, specificity, borrowed visions...', 'agent', 400)
    }
  }, [hoodShow, hoodClear, hoodLog])

  const hoodResearch = useCallback(() => {
    hoodShow()
    hoodClear()
    hoodLog('▶ Vision Research Agent started', 'trigger')
    hoodLog('Framework: Mastra  ·  Runtime: Vercel / Next.js (Node.js)', 'info', 120)
    hoodLog('Model: llama-3.1-8b-instant via Groq', 'info', 220)
    hoodLog('Pattern: single agent with Tavily search tool (autonomous loop)', 'info', 320)
    hoodLog('Agent deciding what to search based on vision + strategy context...', 'agent', 600)
    hoodLog('🔍 Tavily Search Tool — call 1 of 3', 'tool', 2800)
    hoodLog('🔍 Tavily Search Tool — call 2 of 3', 'tool', 6000)
    hoodLog('🔍 Tavily Search Tool — call 3 of 3', 'tool', 9500)
    hoodLog('Agent synthesising search results into landscape brief...', 'agent', 12000)
  }, [hoodShow, hoodClear, hoodLog])

  const hoodReview = useCallback(() => {
    hoodShow()
    hoodClear()
    hoodLog('▶ Multi-Agent Canvas Review started', 'trigger')
    hoodLog('Framework: Mastra  ·  Runtime: Vercel / Next.js (Node.js)', 'info', 120)
    hoodLog('Model: llama-3.1-8b-instant via Groq  ·  4 agents total', 'info', 220)
    hoodLog('Pattern: 3 specialists in parallel → orchestrator synthesises', 'info', 320)
    hoodLog('Firing Promise.all() — 3 agents running simultaneously...', 'agent', 600)
    hoodLog('↳ Vision Critic Agent — assessing specificity, POV, ambition, beneficiary', 'agent', 900)
    hoodLog('↳ Coherence Agent — checking vision → strategy → success chain', 'agent', 1100)
    hoodLog('↳ Market Context Agent — framing market assumption (training knowledge, no search)', 'agent', 1300)
    hoodLog('Waiting for all 3 specialists to resolve...', 'info', 2500)
    hoodLog('✓ All specialists complete — handing outputs to Orchestrator Agent', 'done', 9000)
    hoodLog('Orchestrator synthesising: finding the through-line across all 3 reports...', 'agent', 9300)
  }, [hoodShow, hoodClear, hoodLog])

  // ── Vision change handler ────────────────────────────────────────────────

  function handleVisionChange(val: string) {
    setVision(val)
    scheduleSave()
    if (val.length >= 20 && !revealedRef.current) {
      revealedRef.current = true
      setLowerFieldsVisible(true)
      setLowerHintVisible(false)
    } else if (val.length >= 5 && val.length < 20 && !revealedRef.current && !hintShownRef.current) {
      hintShownRef.current = true
      setLowerHintVisible(true)
    }
    // Nudge hood feedback — fire when nudge loading starts
    if (val.length >= 20 && !visionNudge.dismissed) {
      hoodNudge('vision')
    }
  }

  // ── Research ─────────────────────────────────────────────────────────────

  const startResearch = useCallback(async () => {
    if (vision.length < 20) return
    setBriefLoading(true)
    setPanelOpen(true)
    setActiveTab('research')
    hoodResearch()
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vision, productName, strategy }),
      })
      const data = await res.json()
      setBrief(data.brief || null)
    } catch {
      setBrief(null)
    }
    setBriefLoading(false)
    hoodLog('✓ Landscape Brief ready', 'done')
    hoodDone()
  }, [vision, productName, strategy, hoodResearch, hoodLog, hoodDone])

  // ── Review ───────────────────────────────────────────────────────────────

  const startReview = useCallback(async () => {
    if (vision.length < 20 || strategy.length < 20 || success.length < 10) return
    setReviewLoading(true)
    if (!reviewHasBeenUsed) setReviewHasBeenUsed(true)
    setPanelOpen(true)
    setActiveTab('review')
    hoodReview()
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vision, productName, strategy, success }),
      })
      const data = await res.json()
      setReview(data.review || null)
    } catch {
      setReview(null)
    }
    setReviewLoading(false)
    hoodLog('✓ Canvas Review ready', 'done')
    hoodDone()
  }, [vision, strategy, success, productName, reviewHasBeenUsed, hoodReview, hoodLog, hoodDone])

  const showReviewBtn = vision.length >= 20 && strategy.length >= 20 && success.length >= 10

  return (
    <>
      {/* SVG geometric background */}
      <svg className="geo-bg" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="0" x2="300" y2="300" stroke="#5a4e3c" strokeWidth="0.8"/>
        <line x1="50" y1="0" x2="300" y2="250" stroke="#5a4e3c" strokeWidth="0.8"/>
        <line x1="100" y1="0" x2="300" y2="200" stroke="#5a4e3c" strokeWidth="0.8"/>
        <line x1="150" y1="0" x2="300" y2="150" stroke="#5a4e3c" strokeWidth="0.8"/>
        <line x1="200" y1="0" x2="300" y2="100" stroke="#5a4e3c" strokeWidth="0.8"/>
        <line x1="250" y1="0" x2="300" y2="50" stroke="#5a4e3c" strokeWidth="0.8"/>
        <line x1="0" y1="50" x2="250" y2="300" stroke="#5a4e3c" strokeWidth="0.8"/>
        <line x1="0" y1="100" x2="200" y2="300" stroke="#5a4e3c" strokeWidth="0.8"/>
        <line x1="0" y1="150" x2="150" y2="300" stroke="#5a4e3c" strokeWidth="0.8"/>
        <line x1="0" y1="200" x2="100" y2="300" stroke="#5a4e3c" strokeWidth="0.8"/>
        <line x1="0" y1="250" x2="50" y2="300" stroke="#5a4e3c" strokeWidth="0.8"/>
      </svg>

      <Header
        saveStatusClass={saveStatusClass}
        saveStatus={saveStatus}
        onCopyLink={copyLink}
      />

      <div id="edit-mode">
        <div className="main">
          <p className="welcome">
            The same thinking that built iPhone, Airbnb, Monzo started with a question like this.
          </p>

          {/* Product Name */}
          <div className="product-name-wrap">
            <input
              type="text"
              className="product-name-input"
              placeholder="Product name"
              maxLength={60}
              value={productName}
              onChange={e => { setProductName(e.target.value); scheduleSave() }}
            />
          </div>

          <hr className="divider" />

          {/* Vision */}
          <VisionField
            value={vision}
            onChange={handleVisionChange}
            nudge={visionNudge.nudge}
            nudgeLoading={visionNudge.loading}
            nudgeDismissed={visionNudge.dismissed}
            onDismissNudge={visionNudge.dismiss}
            onResearch={startResearch}
            onReview={startReview}
            researchLoading={briefLoading}
            reviewLoading={reviewLoading}
            showReviewBtn={showReviewBtn}
          />

          {/* Progressive reveal hint */}
          <div className={`lower-hint${lowerHintVisible ? ' visible' : ''}`}>
            Your strategy and success criteria will appear as your vision takes shape...
          </div>

          {/* Lower fields */}
          <div className={`lower-fields${lowerFieldsVisible ? ' visible' : ''}`}>
            <CanvasField
              label="Strategy"
              hint="What will you do — and not do — to achieve it?"
              placeholder="We will focus on..."
              value={strategy}
              onChange={val => { setStrategy(val); scheduleSave() }}
              maxLength={400}
              nudge={strategyNudge.nudge}
              nudgeLoading={strategyNudge.loading}
              nudgeDismissed={strategyNudge.dismissed}
              onDismissNudge={strategyNudge.dismiss}
            />

            <CanvasField
              label="Successful when"
              hint="How will you know it's working?"
              placeholder="We know it's working when..."
              value={success}
              onChange={val => { setSuccess(val); scheduleSave() }}
              maxLength={200}
              nudge={successNudge.nudge}
              nudgeLoading={successNudge.loading}
              nudgeDismissed={successNudge.dismissed}
              onDismissNudge={successNudge.dismiss}
            />

            <CrossNudge
              nudge={crossNudge.nudge}
              loading={crossNudge.loading}
              dismissed={crossNudge.dismissed}
              onDismiss={crossNudge.dismiss}
            />
          </div>

          <UnderTheHood
            visible={hoodVisible}
            active={hoodActive}
            entries={hoodEntries}
          />
        </div>
      </div>

      <ResearchPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        activeTab={activeTab}
        onSwitchTab={setActiveTab}
        showTabs={reviewHasBeenUsed}
        brief={brief}
        briefLoading={briefLoading}
        review={review}
        reviewLoading={reviewLoading}
      />
    </>
  )
}
