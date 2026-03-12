# Vision Writing Coach

A lightweight web tool that helps Product Managers write sharp, meaningful product visions — and challenges them when the writing is vague, generic, or borrowed.

🔗 **Live product:** [vision-writing-coach.vercel.app](https://vision-writing-coach.vercel.app)

---

## What it does

Vision Writing Coach guides PMs through three core elements of a product vision:

- **Vision** — Why does your product exist?
- **Strategy** — What will you do (and not do) to achieve it?
- **Successful when** — How will you know it's working?

As you write, the coach analyses your input in real time and nudges you when it detects vague language, borrowed visions (Airbnb, Spotify, Google etc.), or strategy that reads more like a to-do list than a real bet.

---

## How it works

- Single HTML file — no build step, no dependencies
- Supabase backend for session persistence and shareable URLs
- Regex-based coaching engine with pattern matching for weak language and famous visions
- Cross-field analysis checks that vision, strategy and success criteria are coherent

---

## Running locally

No install needed. Just open `index.html` in your browser.

```
open index.html
```

Or drag the file into any browser window.

---

## Deploying changes

This project is connected to Vercel. Any push to the `master` branch deploys automatically.

```bash
git add .
git commit -m "describe your change"
git push
```

---

## Project structure

```
vision-writing-coach/
├── index.html       # Everything — UI, coaching logic, Supabase sync
└── README.md        # This file
```

---

## Roadmap ideas

- [ ] Replace regex coaching with Claude API for richer, more contextual feedback
- [ ] Real-time collaboration via Supabase Realtime
- [ ] View-only mode for shared links
- [ ] Persist product name to Supabase
- [ ] User accounts and saved visions

---

## Built with

- Vanilla HTML / CSS / JavaScript
- [Supabase](https://supabase.com) — database and session sync
- [Vercel](https://vercel.com) — hosting and deployment
- [Google Fonts](https://fonts.google.com) — Playfair Display + Inter

---

*Built as a vibe-coded prototype by Patrick Moore. Part of an exploration into AI-assisted product thinking tools.*