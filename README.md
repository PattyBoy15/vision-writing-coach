# Vision Writing Coach
**Status:** Prototype v7 — functional, demo-ready, backend pending
**Started:** February 2026
**Owner:** Patrick Moore, Findex

---

## What It Is

A Vision Writing Coach. An AI-guided, real-time collaborative canvas that helps product leaders and business people find the words for their product vision — built with a small group in one session, shared as a minimal public one-pager.

**The product in one sentence:** A real-time collaborative canvas where a small group aligns on product vision and strategy together — guided by an AI that knows how the world's greatest products were built — and shares the output as a minimal public one-pager.

---

## Files in This Folder

| File | Description |
|---|---|
| `prototype_v7.html` | Working prototype — open in any browser |
| `README.md` | This file |

## Related Documents (in project folder)

| Document | Location |
|---|---|
| PRD v0.5 | `02_Product_Artefacts/PRDs/Vision_Writing_Coach_PRD_v0.5.md` |
| User Stories v0.2 | `02_Product_Artefacts/User_Stories/Vision_Writing_Coach_User_Stories_v0.2.md` |
| Research Spike v0.1 | `01_Research/Market_Research/Vision_Writing_Coach_Research_Spike_v0.1.md` |
| Nudge Logic Spec | `02_Product_Artefacts/Feature_Specs/Vision_Writing_Coach_Nudge_Logic.md` |

---

## How to Open the Prototype

Just open `prototype_v7.html` in Chrome or any browser. No server needed.

---

## What the Prototype Does

**Working:**
- AI coaching on Vision, Strategy, and Successful When fields
- Famous vision detection — playful callout for Airbnb, Spotify, Monzo, etc.
- Generic pattern detection — sharpening questions for vague visions
- Strong vision affirmation — affirms good thinking + follow-up question
- Cross-field contradiction detection (fires after 4 sec when multiple fields have content)
- Progressive reveal — Strategy and Successful When appear after Vision > 20 chars
- Character limits with live counters (amber at 75%, red at 90%)
- Dismissible nudges — won't return in the same session
- "Thinking" animation before nudge fires
- Welcoming line on load
- Geometric ambient background (subtle, editorial)
- Static presence avatars (3 contributors)
- Copy link button (simulated URL)

**Not yet built (needs backend):**
- Real canvas persistence (refresh loses content)
- Real-time collaboration (field locking, live sync)
- Actual unique canvas IDs
- Real shareable URLs
- View-only mode via `/v/` URL

---

## Next Build Session

**Goal:** Real persistence + collaboration via Supabase

**Steps:**
1. Create Supabase project at supabase.com (free tier)
2. Create `canvases` table: `id` (uuid), `name`, `vision`, `strategy`, `success`, `updated_at`
3. Add Supabase JS client to prototype
4. Wire save/load to Supabase on field change
5. Subscribe to real-time changes — field updates broadcast to all users on same canvas ID
6. Test with two browser tabs
7. Replace regex coaching with Claude API call for richer responses

**Stack:**
- Frontend: Vanilla HTML/JS (prototype) → React (v1)
- Database: Supabase (Postgres + real-time)
- AI: Claude API (`claude-sonnet-4-6`)
- Hosting: Vercel
- Canvas URL format: `visionwritingcoach.io/s/{uuid}`

---

## Design Direction

- Light mode, off-white background (#fafaf8)
- Serif typography (Georgia) for vision field — editorial, considered
- Sans-serif (system font) for UI chrome
- Geometric grid in top-right corner — ambient texture, not focal point
- Left border on Vision field — blockquote style, the hero element
- Purple nudge bubbles (inline, field-attached)
- Warm amber cross-field nudge
- Monzo's internal product page was the design reference for the output view

---

## Key Product Decisions (Summary)

| Decision | Choice |
|---|---|
| Account model | Anonymous-first — no accounts |
| Canvas sharing | One link, trust-based, always editable |
| Max collaborators | 8 (v1) |
| AI voice | Coach responding to everything — not silent when things are good |
| Chat panel | No — canvas is the conversation |
| Preview/edit modes | No toggle — editor is always the editor |
| Field structure | 4 fields, progressive reveal, hard character limits |

---

## Origin

This product was developed in a series of Claude web app sessions (Feb–Mar 2026) as a learning project to understand vibe coding and AI-assisted PM techniques. The full decision history is in the PRD.

---

*Vision Writing Coach — README*
*Patrick Moore, Findex — March 2026*
