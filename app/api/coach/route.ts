function buildPrompt(
  field: string,
  text: string,
  vision: string,
  strategy: string,
  success: string
): string {
  if (field === 'vision') {
    return `You are a product vision writing coach helping a Product Manager sharpen their product vision. Analyse this vision statement and respond with a single coaching nudge — one or two sentences only.

Your priority order for nudges — work through these in order and use the first that applies:

1. If it uses hollow filler words (seamless, frictionless, innovative, world-class, leading, best, revolutionary, cutting-edge) — tell them to strip those words and ask what the sentence says without them.

2. If it's too generic and could apply to any product in any industry ("help people", "improve productivity", "make things easier", "empower everyone") — push for who specifically is struggling and what is broken for them today.

3. If the wording is near-identical or clearly lifted from one of these specific visions — almost verbatim from Airbnb ("belong anywhere"), Spotify ("unlock human creativity"), Google ("organise the world's information"), Amazon ("most customer-centric"), Microsoft ("empower every person to achieve more"), Meta ("bring the world closer together"), Monzo ("make money work for everyone") — then name it and ask how their version is different. ONLY apply this rule for these exact listed visions. Do not reference any other companies. Do not make connections to financial services firms, banks, or any company not on this list. A company name appearing in the vision (e.g. the product being built) is not evidence of copying.

4. If it has a clear who and a clear what's-broken but lacks a point of view on why this product is the right answer — ask what they believe that others in this space don't.

5. If it's genuinely specific, honest, and has a clear point of view — affirm what's working and push one level further: what does life look like for the person this vision is for when it's true?

Important: Rule 3 should be used rarely. Thematic similarity, industry overlap, or a company name in the text are not grounds for applying it. Only near-verbatim wording from the exact listed visions qualifies.

Vision: "${text}"

Return only the nudge text. No preamble, no sign-off. Use "you" not "the PM". Be direct. A little wit is welcome.`
  }

  if (field === 'strategy') {
    return `You are a product strategy coach. Analyse this strategy statement and return a single coaching nudge — one or two sentences only.

- If it reads like a to-do list or roadmap ("we will build X, launch Y, develop Z") — say so and ask what choice they're actually making.
- If it lists tactics only (social media, marketing, partnerships, content) — ask what the underlying strategic bet is.
- If it doesn't say what they won't do — ask what they're deliberately leaving out.
- If it has real strategic clarity — affirm it and push for the single most important sentence.

Strategy: "${text}"${vision ? `\nContext — their vision: "${vision}"` : ''}

Return only the nudge text. No preamble. Use "you". Be direct.`
  }

  if (field === 'success') {
    return `You are a product outcomes coach. Analyse this success criteria and return a single coaching nudge — one or two sentences only.

- If it describes what the team ships rather than what users experience ("we launch X", "we release Y") — redirect to user outcomes.
- If it mentions funding or investors — note that's a business outcome and ask what users do differently.
- If it's a deadline not an outcome — say so and ask what success actually looks like.
- If it's outcome-framed — affirm it and ask how they'd know it's working before hitting scale.

Success criteria: "${text}"${vision ? `\nContext — their vision: "${vision}"` : ''}

Return only the nudge text. No preamble. Use "you". Be direct.`
  }

  if (field === 'cross') {
    if (!vision || !strategy) return ''
    return `You are a product strategy coach doing a quick coherence check across three fields.

Vision: "${vision}"
Strategy: "${strategy}"
Successful when: "${success}"

Do these three cohere? Does the strategy actually lead to what the vision promises? Does the success measure reflect the vision?

If they cohere well, return exactly: COHERENT
If there is a genuine gap, return a single honest nudge of one or two sentences pointing to the specific gap. Be direct. No hedging. No bullet points.`
  }

  return ''
}

export async function POST(req: Request) {
  try {
    const { field, text, vision = '', strategy = '', success = '' } = await req.json()

    if (!field) {
      return Response.json({ nudge: null })
    }

    const prompt = buildPrompt(field, text || '', vision, strategy, success)
    if (!prompt) {
      return Response.json({ nudge: null })
    }

    const groqKey = process.env.GROQ_API_KEY
    if (!groqKey) {
      console.error('GROQ_API_KEY not set')
      return Response.json({ nudge: null })
    }

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.7,
      }),
    })

    if (!groqRes.ok) {
      const err = await groqRes.json()
      console.error('Groq API error:', err)
      return Response.json({ nudge: null })
    }

    const groqData = await groqRes.json()
    let nudge: string | null = groqData.choices?.[0]?.message?.content?.trim() || null

    if (field === 'cross' && nudge === 'COHERENT') {
      nudge = null
    }

    return Response.json({ nudge })
  } catch (err) {
    console.error('Coach route error:', err)
    return Response.json({ error: 'Internal error', nudge: null }, { status: 500 })
  }
}
