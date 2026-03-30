'use client'

interface Player { name: string; positioning: string }
interface Tale { name: string; what_happened: string }
interface Vision { company: string; statement: string }

export interface Brief {
  players?: Player[]
  market_belief?: string
  cautionary_tales?: Tale[]
  uncomfortable_question?: string
  visions?: Vision[]
}

export interface Review {
  headline?: string
  vision_critique?: string
  coherence_note?: string
  market_framing?: string
  top_recommendation?: string
}

interface ResearchPanelProps {
  open: boolean
  onClose: () => void
  activeTab: 'research' | 'review'
  onSwitchTab: (tab: 'research' | 'review') => void
  showTabs: boolean
  brief: Brief | null
  briefLoading: boolean
  review: Review | null
  reviewLoading: boolean
}

function ThinkingDots({ label, subLabel }: { label: string; subLabel?: string }) {
  return (
    <div className="research-thinking">
      <div className="thinking-dots">
        <div className="dot" /><div className="dot" /><div className="dot" />
      </div>
      <div className="research-thinking-label">{label}</div>
      {subLabel && <div className="review-thinking-steps">{subLabel}</div>}
    </div>
  )
}

function BriefContent({ brief }: { brief: Brief | null }) {
  if (!brief) return <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 13, color: '#bbb', padding: '20px 0' }}>Couldn&#39;t generate a brief — try again.</p>

  return (
    <>
      {brief.visions && brief.visions.length > 0 && (
        <div className="research-section">
          <div className="research-section-label">How others articulate it</div>
          <div className="research-section-body">
            {brief.visions.map((v, i) => (
              <div key={i} className="research-vision">
                <span className="research-player-name">{v.company}</span>
                <div className="research-vision-statement">{v.statement}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="research-section">
        <div className="research-section-label">Who&#39;s in this space</div>
        <div className="research-section-body">
          {(brief.players || []).map((p, i) => (
            <div key={i} className="research-player">
              <span className="research-player-name">{p.name}</span> — {p.positioning}
            </div>
          ))}
        </div>
      </div>
      <div className="research-section">
        <div className="research-section-label">What the market believes</div>
        <div className="research-section-body">{brief.market_belief}</div>
      </div>
      <div className="research-section">
        <div className="research-section-label">Who tried this and struggled</div>
        <div className="research-section-body">
          {(brief.cautionary_tales || []).map((t, i) => (
            <div key={i} className="research-player">
              <span className="research-player-name">{t.name}</span> — {t.what_happened}
            </div>
          ))}
        </div>
      </div>
      <div className="research-section">
        <div className="research-section-label">The uncomfortable question</div>
        <div className="research-question">{brief.uncomfortable_question}</div>
      </div>
    </>
  )
}

function ReviewContent({ review }: { review: Review | null }) {
  if (!review) return <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 13, color: '#bbb', padding: '20px 0' }}>Couldn&#39;t generate a review — try again.</p>

  return (
    <>
      <div className="review-headline">{review.headline}</div>
      <div className="review-section">
        <div className="review-section-label">Vision</div>
        <div className="review-section-body">{review.vision_critique}</div>
      </div>
      <div className="review-section">
        <div className="review-section-label">Coherence</div>
        <div className="review-section-body">{review.coherence_note}</div>
      </div>
      <div className="review-section">
        <div className="review-section-label">Market context</div>
        <div className="review-section-body">{review.market_framing}</div>
      </div>
      <div className="review-recommendation">
        <div className="review-recommendation-label">Do this next</div>
        <div className="review-recommendation-body">{review.top_recommendation}</div>
      </div>
    </>
  )
}

export default function ResearchPanel({
  open, onClose, activeTab, onSwitchTab, showTabs,
  brief, briefLoading, review, reviewLoading,
}: ResearchPanelProps) {
  const title = activeTab === 'research' ? 'Landscape Brief' : 'Canvas Review'

  return (
    <div className={`research-panel${open ? ' open' : ''}`}>
      <div className="research-panel-header">
        <span className="research-panel-title">{title}</span>
        <button className="research-panel-close" onClick={onClose}>✕</button>
      </div>

      {showTabs && (
        <div className="panel-tabs">
          <button
            className={`panel-tab${activeTab === 'research' ? ' active' : ''}`}
            onClick={() => onSwitchTab('research')}
          >Research</button>
          <button
            className={`panel-tab${activeTab === 'review' ? ' active' : ''}`}
            onClick={() => onSwitchTab('review')}
          >Review</button>
        </div>
      )}

      <div className={`panel-tab-content${activeTab === 'research' ? ' active' : ''}`}>
        {briefLoading
          ? <ThinkingDots label="Researching your space..." />
          : <BriefContent brief={brief} />
        }
      </div>

      <div className={`panel-tab-content${activeTab === 'review' ? ' active' : ''}`}>
        {reviewLoading
          ? <ThinkingDots
              label="Three specialist agents are reviewing your canvas..."
              subLabel="Critiquing your vision · Checking coherence · Framing market context"
            />
          : <ReviewContent review={review} />
        }
      </div>
    </div>
  )
}
