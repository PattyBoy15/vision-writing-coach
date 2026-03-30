'use client'

interface NudgeBoxProps {
  nudge: string | null
  loading: boolean
  dismissed: boolean
  onDismiss: () => void
  crossStyle?: boolean
}

function NudgeBox({ nudge, loading, dismissed, onDismiss, crossStyle }: NudgeBoxProps) {
  const cls = crossStyle ? 'cross-nudge' : 'nudge'
  return (
    <>
      {loading && !dismissed && (
        <div className="nudge-thinking visible">
          <div className="thinking-dots">
            <div className="dot" />
            <div className="dot" />
            <div className="dot" />
          </div>
        </div>
      )}
      {nudge && !dismissed && (
        <div className={`${cls} visible`}>
          <button className="nudge-dismiss" onClick={onDismiss}>✕</button>
          <p className="nudge-text">{nudge}</p>
        </div>
      )}
    </>
  )
}

interface VisionFieldProps {
  value: string
  onChange: (v: string) => void
  nudge: string | null
  nudgeLoading: boolean
  nudgeDismissed: boolean
  onDismissNudge: () => void
  onResearch: () => void
  onReview: () => void
  researchLoading: boolean
  reviewLoading: boolean
  showReviewBtn: boolean
}

export function VisionField({
  value, onChange, nudge, nudgeLoading, nudgeDismissed, onDismissNudge,
  onResearch, onReview, researchLoading, reviewLoading, showReviewBtn,
}: VisionFieldProps) {
  const max = 280
  const len = value.length
  const counterClass = `char-counter${len / max >= 0.9 ? ' full' : len / max >= 0.75 ? ' warn' : ''}`

  return (
    <div className="vision-wrap">
      <div className="vision-label">Vision</div>
      <div className="vision-block">
        <div className={`vision-border${value.length > 0 ? ' active' : ''}`} />
        <textarea
          className="vision-textarea"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Why does your product exist?"
          rows={4}
          maxLength={max}
        />
      </div>
      <div className={counterClass}>{len} / {max}</div>
      <NudgeBox nudge={nudge} loading={nudgeLoading} dismissed={nudgeDismissed} onDismiss={onDismissNudge} />
      <button
        className={`research-btn${value.length >= 20 ? ' visible' : ''}${researchLoading ? ' loading' : ''}`}
        onClick={onResearch}
        disabled={researchLoading}
      >
        {researchLoading ? 'Researching...' : 'Research this space →'}
      </button>
      <button
        className={`review-btn${showReviewBtn ? ' visible' : ''}${reviewLoading ? ' loading' : ''}`}
        onClick={onReview}
        disabled={reviewLoading}
      >
        {reviewLoading ? 'Reviewing...' : 'Coach this canvas →'}
      </button>
    </div>
  )
}

interface CanvasFieldProps {
  label: string
  hint: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  maxLength: number
  nudge: string | null
  nudgeLoading: boolean
  nudgeDismissed: boolean
  onDismissNudge: () => void
}

export function CanvasField({
  label, hint, placeholder, value, onChange, maxLength,
  nudge, nudgeLoading, nudgeDismissed, onDismissNudge,
}: CanvasFieldProps) {
  const len = value.length
  const counterClass = `char-counter${len / maxLength >= 0.9 ? ' full' : len / maxLength >= 0.75 ? ' warn' : ''}`

  return (
    <div className="field-wrap">
      <div className="field-label">{label}</div>
      <div className="field-placeholder">{hint}</div>
      <textarea
        className="field-textarea"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        maxLength={maxLength}
      />
      <div className={counterClass}>{len} / {maxLength}</div>
      <NudgeBox nudge={nudge} loading={nudgeLoading} dismissed={nudgeDismissed} onDismiss={onDismissNudge} />
    </div>
  )
}

interface CrossNudgeProps {
  nudge: string | null
  loading: boolean
  dismissed: boolean
  onDismiss: () => void
}

export function CrossNudge({ nudge, loading, dismissed, onDismiss }: CrossNudgeProps) {
  return (
    <NudgeBox nudge={nudge} loading={loading} dismissed={dismissed} onDismiss={onDismiss} crossStyle />
  )
}
