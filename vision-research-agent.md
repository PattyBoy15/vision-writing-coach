# Feature Brief: Vision Research Agent
**Product:** Vision Writing Coach
**Status:** Proposed
**Author:** Patrick Moore
**Last updated:** March 2026

---

## Problem

When a PM writes a product vision, they're doing it in a vacuum. They don't know if their positioning is already claimed by a competitor, whether the market is mature or nascent, or whether their vision sounds like every other product in the space. Finding this out manually takes 20–30 minutes of research and usually doesn't happen at all during early vision writing.

---

## Opportunity

At the moment a PM has articulated their vision, they are most receptive to sharpening it. That's the ideal moment to surface competitive and market context — not after a strategy review, not in a separate research session, but inline, immediately, while the thinking is live.

---

## Proposed Feature: Vision Research Agent

A button-triggered AI agent that analyses the PM's vision statement and returns a structured competitive and market intelligence brief, surfaced inline within the Vision Writing Coach interface.

---

## User Story

*As a Product Manager writing my product vision, I want to understand how my positioning compares to the market, so that I can identify whether my vision is differentiated or undifferentiated before I build strategy around it.*

---

## Experience Design

### Trigger
A **"Research my space →"** button appears below the Vision field once the PM has written more than 40 characters. It remains inactive (greyed out) until that threshold is met.

### Loading state
On click, the button is replaced by a subtle animation with the label *"Researching your space..."* — consistent with the existing thinking dots pattern in the UI.

### Output panel
After 10–20 seconds, a new panel appears below the vision field with three sections:

**🏢 Who's in your space**
2–3 sentences identifying the closest competing products and how they position themselves.

**📐 How your vision compares**
A direct assessment of whether the PM's vision is differentiated, overlapping, or potentially undifferentiated vs the competition. Honest, not diplomatic.

**📏 Market context**
A brief signal on market maturity — is this a crowded space, an emerging category, or a gap? Includes rough market size indicator if available.

### Dismissal
The panel can be dismissed with the same ✕ pattern used by coaching nudges. Once dismissed it can be re-triggered by clicking the button again.

---

## How it works (technical)

The agent is powered by two Claude API capabilities working together:

1. **Web search tool** — Claude searches for competitors, market data, and similar product visions based on the PM's vision text
2. **Synthesis** — Claude analyses the results and returns a structured brief in the three-section format above

The vision text is sent to the Claude API as the prompt context. The agent is instructed to:
- Search for direct and adjacent competitors
- Identify their core positioning language
- Compare it against the PM's vision
- Surface market size signals
- Flag any famous product visions that closely match

### Example API prompt structure
```
You are a product strategy researcher. The PM has written this vision:

"[VISION TEXT]"

Search the web for:
1. Products competing in this space and how they position themselves
2. The approximate market size or maturity of this category
3. Any well-known product visions that are similar to this one

Return a structured brief with three sections:
- Who's in your space (2-3 sentences)
- How this vision compares (direct, honest assessment)
- Market context (maturity + size signal)

Be specific. Don't hedge. If the vision is undifferentiated, say so.
```

---

## Success criteria

- A PM who uses the research agent adjusts or sharpens their vision statement as a result
- The brief is returned in under 20 seconds
- Output is specific enough to be actionable — not generic market summaries
- Feature is used by >60% of sessions where the vision exceeds 40 characters

---

## What this is not

- A replacement for deep competitive research
- A validation that the vision is good — only that it is or isn't differentiated
- A live market data feed — results reflect web search at time of query

---

## Dependencies

- Claude API access (with web search tool enabled)
- API key managed server-side (not exposed in frontend)
- Supabase edge function or lightweight backend to proxy API calls securely

---

## Risks

| Risk | Mitigation |
|------|------------|
| API response too slow (>30s) | Set a timeout, show a friendly fallback message |
| Results too generic | Prompt engineering — specific instructions to avoid hedging |
| API key exposed in frontend | Must be proxied through a backend function, never client-side |
| Competitive data outdated | Add a timestamp to the output panel ("Researched just now") |

---

## Roadmap position

This is the natural next feature after replacing the regex coaching engine with the Claude API. Both features share the same API infrastructure and can be built together.

**Suggested build order:**
1. Replace regex coaching with Claude API (foundational)
2. Add Vision Research Agent (builds on same infrastructure)
3. Cross-field synthesis agent (uses all three fields together)

---

*This feature transforms Vision Writing Coach from a writing aid into a strategic thinking tool.*