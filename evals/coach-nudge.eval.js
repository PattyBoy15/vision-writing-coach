// evals/coach-nudge.eval.js
// Eval suite for the vision coaching nudge — copying detection
// Run with: node evals/coach-nudge.eval.js

const SUPABASE_URL = 'https://ezaerggkynyyahlukomb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6YWVyZ2dreW55eWFobHVrb21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDAxODgsImV4cCI6MjA4ODcxNjE4OH0.Oa8QG4wRBm9pIAOx71y2b4TjO0o0QJh36MPE0ZFzmtM';

const tests = [

  // ── Group 1: Should NOT accuse of copying ──────────────────────────────────

  {
    name: "Company name in vision should not trigger copying accusation",
    group: "false-positive prevention",
    input: "250,000 Findex clients get direct attention from their advisors",
    check: (nudge) => !/(copied|lifted|verbatim|fidelity|sounds like|borrowed)/i.test(nudge),
    failMessage: "Accused an original vision of copying"
  },
  {
    name: "Financial services theme should not trigger Salesforce accusation",
    group: "false-positive prevention",
    input: "Help financial advisers build stronger client relationships at scale",
    check: (nudge) => !/(salesforce|copied|lifted|verbatim)/i.test(nudge),
    failMessage: "Made a false copying connection to Salesforce"
  },
  {
    name: "Industry overlap alone should not trigger copying rule",
    group: "false-positive prevention",
    input: "Make compliance effortless for every financial adviser in Australia",
    check: (nudge) => !/(copied|lifted|verbatim|sounds like|borrowed from)/i.test(nudge),
    failMessage: "Accused of copying based on industry overlap"
  },
  {
    name: "'Empower' word alone should not trigger Microsoft accusation",
    group: "false-positive prevention",
    input: "To empower small business owners to understand their numbers",
    check: (nudge) => !/(microsoft|copied|lifted|verbatim)/i.test(nudge),
    failMessage: "Falsely connected 'empower' to Microsoft"
  },

  // ── Group 2: SHOULD accuse of copying ─────────────────────────────────────

  {
    name: "Near-verbatim Airbnb vision should be called out",
    group: "true positive",
    input: "To help create a world where anyone can belong anywhere",
    check: (nudge) => /(airbnb|belong anywhere)/i.test(nudge),
    failMessage: "Failed to detect near-verbatim Airbnb copy"
  },
  {
    name: "Near-verbatim Google vision should be called out",
    group: "true positive",
    input: "To organise the world's information and make it universally accessible",
    check: (nudge) => /(google|organis)/i.test(nudge),
    failMessage: "Failed to detect near-verbatim Google copy"
  },

  // ── Group 3: General quality ───────────────────────────────────────────────

  {
    name: "Hollow words should be called out",
    group: "general quality",
    input: "A seamless, world-class, innovative experience for everyone",
    check: (nudge) => /(hollow|vague|strip|meaningless|empty|generic)/i.test(nudge),
    failMessage: "Did not call out hollow language"
  },
  {
    name: "Specific vision should be affirmed not attacked",
    group: "general quality",
    input: "To eliminate the 3-hour monthly compliance report for 12,000 Australian financial advisers",
    check: (nudge) => !/(copied|lifted|hollow|generic|vague)/i.test(nudge),
    failMessage: "Attacked a specific, well-written vision"
  },
  {
    name: "Nudge should be concise — under 300 characters",
    group: "general quality",
    input: "Help people manage their money better every day",
    check: (nudge) => nudge === null || nudge.length < 300,
    failMessage: `Nudge too long`
  },

];

async function callCoach(text) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/coach`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({
      field: 'vision',
      text,
      vision: text,
      strategy: '',
      success: '',
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.nudge || null;
}

async function runEvals() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   Vision Coach — Copying Detection Eval Suite   ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  let passed = 0;
  let failed = 0;
  let currentGroup = '';

  for (const test of tests) {
    if (test.group !== currentGroup) {
      currentGroup = test.group;
      console.log(`\n── ${currentGroup.toUpperCase()} ──`);
    }

    process.stdout.write(`  ${test.name}... `);
    const nudge = await callCoach(test.input);
    const result = test.check(nudge);

    if (result) {
      console.log('✓');
      passed++;
    } else {
      console.log('✗ FAIL');
      console.log(`    Reason: ${test.failMessage}`);
      console.log(`    Got: "${nudge}"\n`);
      failed++;
    }

    // Small delay to avoid hitting Groq rate limits
    await new Promise(r => setTimeout(r, 800));
  }

  console.log('\n══════════════════════════════════════════════════');
  console.log(`  Result: ${passed}/${tests.length} passed  (${failed} failed)`);
  console.log('══════════════════════════════════════════════════\n');

  if (failed > 0) process.exit(1);
}

runEvals().catch(err => {
  console.error('Eval runner error:', err);
  process.exit(1);
});
