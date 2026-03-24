import { Agent } from "@mastra/core/agent";
import { createGroq } from "@ai-sdk/groq";

// ── Multi-Agent Canvas Review ─────────────────────────────────────────────────
//
// Three specialist agents run in parallel (Promise.all), each with a narrow role.
// An orchestrator agent then synthesises their outputs into a unified coaching report.
//
// This is the key difference from the research agent (api/research.ts):
// - Research: one agent + one tool (autonomous search loop)
// - Review: three specialists + one orchestrator (parallel execution + synthesis)
//
// The inversion of control: your code doesn't decide what each agent thinks.
// Each agent has baked-in expertise and is given only what it needs to know.

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

// ── Specialist Agent 1: Vision Critic ────────────────────────────────────────
// Receives: vision statement + product name
// Knows nothing about strategy or success criteria

const visionCriticAgent = new Agent({
  name: "vision-critic-agent",
  model: groq("llama-3.1-8b-instant"),
  instructions: `You are a ruthless but fair product vision critic. Your sole job is to assess the quality of a single vision statement.

A great vision statement has four qualities:
1. SPECIFICITY — it names a real problem or a real group of people, not "everyone" or "productivity"
2. POINT OF VIEW — it implies a belief about what's broken or what the world should look like
3. AMBITION — it describes a meaningfully different future, not an incremental improvement
4. BENEFICIARY — it is clear who is better off when this is true

Your output must be exactly 2-3 sentences. Lead with the single strongest thing about this vision (even a weak vision has something). Then name the single most specific weakness — not a generic critique, but something particular to THIS statement. End with a one-sentence push: what would make this vision undeniably sharper?

Do not use bullet points. Do not use headers. Write in plain prose as a coach talking directly to the person. Use "your" not "the".`,
});

// ── Specialist Agent 2: Coherence Checker ────────────────────────────────────
// Receives: vision + strategy + success criteria
// Checks if the three fields form a logical chain

const coherenceAgent = new Agent({
  name: "coherence-agent",
  model: groq("llama-3.1-8b-instant"),
  instructions: `You are a product strategy coherence checker. You are given three fields: a vision, a strategy, and success criteria. Your job is to identify whether they form a logical chain.

The chain works like this: Strategy should be the mechanism that causes the Vision to become true. Success criteria should measure whether the Vision is being achieved — not whether the team is busy.

Common failures you look for:
- Strategy is a list of activities (we will build X, launch Y) rather than a choice (we will focus on X by not doing Y)
- Success criteria measures team output (we shipped) rather than user outcome (users do differently)
- Success criteria measures a proxy that doesn't reflect the vision's stated promise
- Strategy targets a different user or problem than the vision names

Your output must be exactly 1-2 sentences. Name the STRONGEST coherence gap — the place where the chain breaks most clearly. If all three are genuinely aligned, say so briefly and push for greater specificity in the weakest field. Be specific: quote or closely reference the actual words from the fields. Use "your" not "the".`,
});

// ── Specialist Agent 3: Market Context ───────────────────────────────────────
// Receives: vision + product name
// Reasons from training knowledge — no web search

const marketContextAgent = new Agent({
  name: "market-context-agent",
  model: groq("llama-3.1-8b-instant"),
  instructions: `You are a market strategist with deep knowledge of product history and competitive dynamics. You do not search the web — you reason from what you know.

Given a vision statement and product name, answer in 1-2 sentences total:
What is the dominant assumption that most incumbents in this space are built on — the belief this product is implicitly betting against? What do most players in this space get wrong that this vision appears to be addressing?

Be concrete and specific. Name the actual assumption, not a vague observation like "incumbents are slow". If you recognise the space (fintech, productivity, health, logistics, etc.), draw on real patterns from that space.

Do not hedge. Do not say "it seems" or "perhaps". Output must be 1-2 sentences only.`,
});

// ── Orchestrator Agent ────────────────────────────────────────────────────────
// Receives: outputs from all 3 specialists
// Synthesises — does NOT just concatenate

const orchestratorAgent = new Agent({
  name: "orchestrator-agent",
  model: groq("llama-3.1-8b-instant"),
  instructions: `You are a lead product coach synthesising reports from three specialist analysts. You have received a vision critique, a coherence note, and a market framing.

Your job is to synthesise — not concatenate — these into a single unified coaching report. Synthesis means: find the through-line. What is the one thing that, if fixed, would make the vision stronger AND more coherent AND better positioned against the market?

You must return ONLY a valid JSON object with exactly these keys:
{
  "review": {
    "headline": "One sharp sentence (max 15 words) summing up the overall state of the canvas",
    "vision_critique": "2-3 sentences from the vision specialist, lightly edited for tone consistency",
    "coherence_note": "1-2 sentences from the coherence specialist, lightly edited",
    "market_framing": "1-2 sentences from the market specialist, lightly edited",
    "top_recommendation": "One specific, actionable sentence — the single most important thing to do next. Must reference something specific from the canvas (a word, a gap, a missing element). Generic advice like 'clarify your vision' is not acceptable."
  }
}

Return ONLY the JSON object. No preamble. No markdown fences. No explanation.`,
});

// ── Vercel Function handler ───────────────────────────────────────────────────
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const { vision = "", productName = "", strategy = "", success = "" } = req.body || {};

  if (!vision || vision.length < 20 || !strategy || strategy.length < 20 || !success || success.length < 10) {
    res.json({ review: null });
    return;
  }

  try {
    // ── Phase 1: Run 3 specialists in parallel ────────────────────────────────
    // Promise.all fires all three simultaneously — this is the multi-agent pattern.
    // Each agent receives ONLY the fields relevant to its specialty.

    const [visionResult, coherenceResult, marketResult] = await Promise.all([
      visionCriticAgent.generateLegacy([
        {
          role: "user",
          content: `Assess this vision statement:\n\nProduct: ${productName || "(unnamed)"}\nVision: ${vision}`,
        },
      ]),
      coherenceAgent.generateLegacy([
        {
          role: "user",
          content: `Check coherence across these three fields:\n\nVision: ${vision}\nStrategy: ${strategy}\nSuccessful when: ${success}`,
        },
      ]),
      marketContextAgent.generateLegacy([
        {
          role: "user",
          content: `Frame the market context for this product:\n\nProduct: ${productName || "(unnamed)"}\nVision: ${vision}`,
        },
      ]),
    ]);

    const visionCritique = visionResult.text.trim();
    const coherenceNote = coherenceResult.text.trim();
    const marketFraming = marketResult.text.trim();

    // ── Phase 2: Orchestrator synthesises ────────────────────────────────────
    // Only starts after all 3 specialists complete.

    const orchestratorResult = await orchestratorAgent.generateLegacy([
      {
        role: "user",
        content: `Synthesise these three specialist reports into a unified coaching review:

VISION CRITIQUE:
${visionCritique}

COHERENCE NOTE:
${coherenceNote}

MARKET FRAMING:
${marketFraming}

Canvas context for reference:
Product: ${productName || "(unnamed)"}
Vision: ${vision}
Strategy: ${strategy}
Successful when: ${success}`,
      },
    ]);

    // ── Parse JSON output ─────────────────────────────────────────────────────
    let review = null;
    try {
      const cleaned = orchestratorResult.text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      const parsed = JSON.parse(cleaned);
      review = parsed.review || null;
    } catch {
      console.error("Failed to parse orchestrator output:", orchestratorResult.text);
    }

    res.json({ review });
  } catch (err) {
    console.error("Review agent error:", err);
    res.status(500).json({ error: "Internal error", review: null });
  }
}

export const config = {
  maxDuration: 60,
};
