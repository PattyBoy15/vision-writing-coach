# PM + AI Skills Log
**Patrick Moore — Findex Group**
*A living document tracking skills developed at the intersection of product management and AI-assisted development.*

---

## 1. Development Environment Setup

**Status:** ✅ Complete

Skills developed setting up a modern product development environment from scratch:

- Installed and configured VS Code as primary code editor
- Installed Node.js for JavaScript runtime
- Installed Git and Git Bash for version control
- Set up a GitHub account and created first repository
- Understood the difference between a local repo and a remote repo
- Configured Git identity (name and email) for commit attribution
- Resolved a real-world Git error (dubious ownership on OneDrive path)

---

## 2. Version Control with Git

**Status:** ✅ Foundational — in practice

Core Git workflow now in regular use:

```bash
git add .
git commit -m "descriptive message"
git push
```

- Understands what each command does (stage, snapshot, upload)
- Understands that commit messages form a permanent log of changes
- Can initialise a repo, connect it to GitHub, and push code
- Has resolved real errors (frozen terminal, ownership conflict, paste issues in Git Bash)

**Next to learn:** Branching — making changes in isolation before merging to master

---

## 3. Hosting & Deployment

**Status:** ✅ Complete

- Connected GitHub to Vercel for continuous deployment
- Understands that every push to `master` triggers an automatic redeploy
- Understands the modern equivalent of FTP → Git push to server
- Live product deployed at: [vision-writing-coach.vercel.app](https://vision-writing-coach.vercel.app)

---

## 4. Reading & Directing Code

**Status:** 🟡 Emerging

Working with a real codebase (Vision Writing Coach) has developed:

- Ability to read HTML structure and understand what each section does
- Familiarity with how JavaScript handles user interactions
- Understanding of how a single-file app is structured
- Awareness of what Supabase does (database + session persistence)
- Can make targeted edits to HTML/CSS (text, layout, styling)

**Next to learn:** Understanding how to add a new feature end-to-end (e.g. replacing regex coaching with Claude API calls)

---

## 5. Vibe Coding as a PM Skill

**Status:** ✅ Actively practising

- Built Vision Writing Coach (v1–v8) through iterative AI-assisted development
- Understands the difference between describing outcomes vs describing implementation
- Recognises when to push back on AI output vs accept it
- Understands the workflow: describe → generate → review → push

**Key insight developed:** The PM's job in vibe coding is to hold the product vision clearly enough that you can judge whether the output is right — not just whether it runs.

---

## 6. Writing for AI (Prompting)

**Status:** 🟡 Emerging — instinctive but not yet deliberate

- Has used Claude across a full product development session
- Can troubleshoot real problems by providing logs and context
- Beginning to understand that role-framing ("act as a CPO") changes the quality of output

**Next to develop:** Deliberate prompting technique — structured prompts with context, role, format, and constraints specified upfront

---

## 7. Product Thinking with AI Assistance

**Status:** ✅ Strong foundation

Demonstrated through Vision Writing Coach:

- Identified a real PM pain point (vague product visions)
- Designed a coaching interaction model (nudges, not corrections)
- Built cross-field coherence checking (vision vs strategy vs success)
- Thinking about hosting for real user feedback — treating it as a real product

**CPO-level question to keep asking:** *What am I building that only a human PM can build — and am I using AI to sharpen that, or replace it?*

---

## 8. Product Environment Literacy

**Status:** 🟡 Building

- Understands the modern dev stack (HTML/CSS/JS → GitHub → Vercel)
- Understands what a database does in the context of a real product (Supabase sessions)
- Beginning to understand frontend vs backend distinction
- Aware of what Claude Code CLI and Claude Cowork are and when to use them

---

## Next Skills to Build

| Skill | Why it matters |
|-------|---------------|
| Git branching | Make experimental changes safely without breaking live product |
| Claude API integration | Replace regex coaching in Vision Writing Coach with real AI feedback |
| Basic React | Unlocks more complex product UIs |
| User feedback loops | Set up a simple way to collect feedback on Vision Writing Coach from real PMs |
| Prompt engineering | Get more precise, useful outputs from Claude across all PM work |

---

*Last updated: March 2026*
*Built alongside Claude (Anthropic) as part of an AI-augmented PM practice.*