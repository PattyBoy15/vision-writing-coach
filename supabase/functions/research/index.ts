const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, apikey, x-client-info",
};

async function callGroq(groqKey: string, prompt: string, jsonMode = false): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${groqKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: jsonMode ? 400 : 800,
      temperature: 0.7,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    console.error("Groq error:", err);
    throw new Error("Groq API failed");
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

async function searchTavily(tavilyKey: string, query: string): Promise<string> {
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
  if (!res.ok) {
    console.error("Tavily error for query:", query);
    return "";
  }
  const data = await res.json();
  return (data.results || [])
    .map((r: { title: string; content: string; url: string }) => `${r.title}: ${r.content}`)
    .join("\n");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { vision, productName = "", strategy = "" } = await req.json();

    if (!vision || vision.length < 20) {
      return new Response(JSON.stringify({ brief: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const groqKey = Deno.env.get("GEMINI_API_KEY"); // stored under old name
    const tavilyKey = Deno.env.get("TAVILY_API_KEY");

    if (!groqKey || !tavilyKey) {
      console.error("Missing API keys");
      return new Response(JSON.stringify({ brief: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Step 1: Orchestrator — decide what to search for ──
    const context = [
      productName ? `Product name: ${productName}` : "",
      `Vision: ${vision}`,
      strategy ? `Strategy: ${strategy}` : "",
    ].filter(Boolean).join("\n");

    const orchestratorPrompt = `Given this product context:
${context}

Generate exactly 3 web search queries that would help a Product Manager understand the competitive landscape. Focus on:
1. Who else is operating in this specific space (companies, products)
2. What the market currently believes about this problem
3. Who has tried something similar and what happened (successes or failures)

Be specific to the product type and domain implied by the context above.

Return ONLY a JSON object with a single key "queries" containing an array of 3 search query strings. Example format:
{"queries": ["query one", "query two", "query three"]}`;

    const orchestratorRaw = await callGroq(groqKey, orchestratorPrompt, true);
    let queries: string[] = [];
    try {
      const parsed = JSON.parse(orchestratorRaw);
      queries = parsed.queries || [];
    } catch {
      console.error("Failed to parse orchestrator output:", orchestratorRaw);
      return new Response(JSON.stringify({ brief: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (queries.length === 0) {
      return new Response(JSON.stringify({ brief: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Step 2: Search — run each query through Tavily ──
    const searchResults = await Promise.all(
      queries.map((q) => searchTavily(tavilyKey, q))
    );
    const combinedResults = queries
      .map((q, i) => `Query: ${q}\nResults:\n${searchResults[i]}`)
      .join("\n\n---\n\n");

    // ── Step 3: Synthesis — turn search results into a structured brief ──
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

    const synthesisPrompt = `You are a product strategy researcher. Based on the search results below, write a landscape brief for a Product Manager with this product context:
${context}

Search results:
${combinedResults}

You also have this curated list of real vision statements from well-known companies:
${JSON.stringify(knownVisions, null, 2)}

Return ONLY a JSON object with exactly these keys:
- "players": array of 3-4 objects, each with "name" (string) and "positioning" (string, one sentence on how they differ). Do NOT include "${productName}" or any company mentioned as the owner or builder of this product in this list.
- "market_belief": string, 1-2 sentences describing the dominant assumption the market holds about this problem
- "cautionary_tales": array of 1-2 objects, each with "name" (string) and "what_happened" (string, one sentence)
- "uncomfortable_question": string, one sharp question that the vision doesn't answer but the market will eventually ask
- "visions": pick 2-3 entries from the curated list above that are most relevant or instructive given the product context. Return them as objects with "company" and "statement". Only use entries from the curated list — do not add others.

Base your response on the search results. Be specific and direct.`;

    const synthesisRaw = await callGroq(groqKey, synthesisPrompt, true);
    let brief = null;
    try {
      brief = JSON.parse(synthesisRaw);
    } catch {
      console.error("Failed to parse synthesis output:", synthesisRaw);
    }

    return new Response(JSON.stringify({ brief }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Research function error:", err);
    return new Response(JSON.stringify({ error: "Internal error", brief: null }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
