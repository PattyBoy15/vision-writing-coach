import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";

// ── Curated list of real vision statements ────────────────────────────────────
const knownVisions = [
  { company: "Tesla", statement: "To accelerate the world's transition to sustainable energy." },
  { company: "Google", statement: "To organise the world's information and make it universally accessible and useful." },
  { company: "Amazon", statement: "To be Earth's most customer-centric company." },
  { company: "Microsoft", statement: "To empower every person and every organisation on the planet to achieve more." },
  { company: "Apple", statement: "To bring the best personal computing experience to students, educators, creative professionals, and consumers around the world." },
  { company: "Meta", statement: "To give people the power to build community and bring the world closer together." },
  { company: "Airbnb", statement: "To help create a world where anyone can belong anywhere." },
  { company: "Spotify", statement: "To unlock the potential of human creativity — by giving a million creative artists the opportunity to live off their art." },
  { company: "Stripe", statement: "To increase the GDP of the internet." },
  { company: "Slack", statement: "To make your working life simpler, more pleasant, and more productive." },
  { company: "LinkedIn", statement: "To connect the world's professionals to make them more productive and successful." },
  { company: "Netflix", statement: "To entertain the world." },
  { company: "Uber", statement: "Transportation as reliable as running water, everywhere, for everyone." },
  { company: "Monzo", statement: "To make money work for everyone." },
  { company: "Salesforce", statement: "To empower every company to connect with their customers in a whole new way." },
  { company: "Figma", statement: "To make design accessible to all." },
  { company: "Notion", statement: "To make toolmaking ubiquitous." },
  { company: "Canva", statement: "To empower the world to design." },
  { company: "Atlassian", statement: "To unleash the potential of every team." },
  { company: "HubSpot", statement: "To make the world more inbound — helping millions of companies grow better." },
];

// ── Tavily web search tool ────────────────────────────────────────────────────
// The agent calls this autonomously — it decides what to search and when.
const tavilySearchTool = createTool({
  id: "tavily-search",
  description:
    "Search the web for competitive intelligence about a product space. " +
    "Call this multiple times with different specific queries to build a complete picture.",
  inputSchema: z.object({
    query: z.string().describe("A specific web search query"),
  }),
  execute: async ({ query }: { query: string }) => {
    const tavilyKey = process.env.TAVILY_API_KEY;
    if (!tavilyKey) return { results: [] };

    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: tavilyKey,
        query,
        max_results: 3,
        search_depth: "basic",
      }),
    });

    if (!res.ok) return { results: [] };

    const data = await res.json() as any;
    return {
      results: (data.results || []).map((r: any) => ({
        title: r.title,
        content: r.content,
        url: r.url,
      })),
    };
  },
});

// ── Agent factory ─────────────────────────────────────────────────────────────
// Created per-request so productName can be baked into the system prompt.
function createResearchAgent(productName: string) {
  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

  return new Agent({
    name: "vision-research-agent",
    model: groq("llama-3.1-8b-instant"),
    tools: { tavilySearchTool },
    instructions: `You are a product strategy researcher helping a Product Manager understand their competitive landscape.

You have access to a web search tool. Use it 2-3 times with different specific queries to research:
1. Who else is operating in this product's space (direct and adjacent competitors)
2. What the market currently believes about this problem
3. Companies or products that tried something similar and what happened

After searching, synthesise everything into a single JSON object with EXACTLY these keys:
- "visions": pick 2-3 entries from this curated list that are most relevant or instructive given the product context: ${JSON.stringify(knownVisions)}
- "players": array of 3-4 objects with "name" (string) and "positioning" (string, one sentence on how they differ). Do NOT include "${productName}" or any company mentioned as the owner/builder of this product.
- "market_belief": string, 1-2 sentences on the dominant assumption the market holds about this problem
- "cautionary_tales": array of 1-2 objects with "name" (string) and "what_happened" (string, one sentence)
- "uncomfortable_question": one sharp question the vision doesn't answer but the market will eventually ask

Return ONLY the JSON object. No preamble, no markdown fences, no explanation.`,
  });
}

// ── Vercel Function handler ───────────────────────────────────────────────────
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const { vision = "", productName = "", strategy = "" } = req.body || {};

  if (!vision || vision.length < 20) {
    res.json({ brief: null });
    return;
  }

  try {
    const agent = createResearchAgent(productName);

    const context = [
      productName ? `Product name: ${productName}` : "",
      `Vision: ${vision}`,
      strategy ? `Strategy: ${strategy}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    // The agent autonomously decides when to call the search tool and how many times.
    // This is the key difference from the old scripted pipeline.
    const result = await agent.generate([
      { role: "user", content: `Research the competitive landscape for this product:\n\n${context}` },
    ]);

    let brief = null;
    try {
      const cleaned = result.text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      brief = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse agent output:", result.text);
    }

    res.json({ brief });
  } catch (err) {
    console.error("Research agent error:", err);
    res.status(500).json({ error: "Internal error", brief: null });
  }
}

export const config = {
  maxDuration: 60,
};
