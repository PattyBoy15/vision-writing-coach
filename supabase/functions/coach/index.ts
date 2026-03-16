const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, apikey, x-client-info",
};

function buildPrompt(
  field: string,
  text: string,
  vision: string,
  strategy: string,
  success: string
): string {
  if (field === "vision") {
    return `You are a product vision writing coach helping a Product Manager sharpen their product vision. Analyse this vision statement and respond with a single coaching nudge — one or two sentences only.

Your job: challenge vague, generic, or borrowed language. Push toward specificity and honesty.

- If it copies a famous vision (Airbnb "belong anywhere", Spotify "music for everyone", Google "organise the world's information", Amazon "most customer-centric", Apple "think different", Meta "connect the world", Monzo "make money work for everyone") — call it out by name and ask for their version.
- If it uses hollow words (seamless, frictionless, innovative, world-class, leading, best) — tell them to strip those and ask what's left.
- If it's too generic ("help people", "improve productivity", "make things easier") — push for who specifically, and what's broken today.
- If it has real specificity and a clear point of view — affirm that and push further: who's the person whose life looks different? Would this vision embarrass them if it wasn't true in 5 years?

Vision: "${text}"

Return only the nudge text. No preamble, no sign-off. Use "you" not "the PM". Be direct. A little wit is welcome.`;
  }

  if (field === "strategy") {
    return `You are a product strategy coach. Analyse this strategy statement and return a single coaching nudge — one or two sentences only.

- If it reads like a to-do list or roadmap ("we will build X, launch Y, develop Z") — say so and ask what choice they're actually making.
- If it lists tactics only (social media, marketing, partnerships, content) — ask what the underlying strategic bet is.
- If it doesn't say what they won't do — ask what they're deliberately leaving out.
- If it has real strategic clarity — affirm it and push for the single most important sentence.

Strategy: "${text}"${vision ? `\nContext — their vision: "${vision}"` : ""}

Return only the nudge text. No preamble. Use "you". Be direct.`;
  }

  if (field === "success") {
    return `You are a product outcomes coach. Analyse this success criteria and return a single coaching nudge — one or two sentences only.

- If it describes what the team ships rather than what users experience ("we launch X", "we release Y") — redirect to user outcomes.
- If it mentions funding or investors — note that's a business outcome and ask what users do differently.
- If it's a deadline not an outcome — say so and ask what success actually looks like.
- If it's outcome-framed — affirm it and ask how they'd know it's working before hitting scale.

Success criteria: "${text}"${vision ? `\nContext — their vision: "${vision}"` : ""}

Return only the nudge text. No preamble. Use "you". Be direct.`;
  }

  if (field === "cross") {
    if (!vision || !strategy) return "";
    return `You are a product strategy coach doing a quick coherence check across three fields.

Vision: "${vision}"
Strategy: "${strategy}"
Successful when: "${success}"

Do these three cohere? Does the strategy actually lead to what the vision promises? Does the success measure reflect the vision?

If they cohere well, return exactly: COHERENT
If there is a genuine gap, return a single honest nudge of one or two sentences pointing to the specific gap. Be direct. No hedging. No bullet points.`;
  }

  return "";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { field, text, vision = "", strategy = "", success = "" } = await req.json();

    if (!field) {
      return new Response(JSON.stringify({ nudge: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = buildPrompt(field, text || "", vision, strategy, success);

    if (!prompt) {
      return new Response(JSON.stringify({ nudge: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call Gemini API (free tier: 1,500 requests/day, no credit card required)
    // Get a free key at: https://aistudio.google.com
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 150, temperature: 0.7 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.json();
      console.error("Gemini API error:", err);
      // Return null nudge gracefully — app still works, regex coaching takes over
      return new Response(JSON.stringify({ nudge: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiData = await geminiRes.json();
    let nudge = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;

    // Suppress the COHERENT signal — it's just an internal marker
    if (field === "cross" && nudge === "COHERENT") {
      nudge = null;
    }

    return new Response(JSON.stringify({ nudge }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Coach function error:", err);
    return new Response(JSON.stringify({ error: "Internal error", nudge: null }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
