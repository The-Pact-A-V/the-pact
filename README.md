# The Pact — v2

A private iOS PWA that Apeksha and Ved use together to hold each other to a 50-day pact.
*"95% together or it doesn't count."*

This is the v2 rewrite of `apeksharaina/the-pact` — same app, fresh stack.

## Stack

- **Vite** + **React 19** + **TypeScript 6**
- **Tailwind v4** with locked design tokens (cream, lavender, sage, peach, butter, pink, coral, gold)
- **React Router v7**
- **Firebase Realtime Database** (data) + **Firebase Storage** (board photos/voice)
- **Framer Motion** (the jar, milestone ceremonies, page transitions)
- **Zustand** (client state) + **React Hook Form** + **Zod**
- **vite-plugin-pwa** (manifest + service worker)

Hosted on **Vercel** under Ved's account.

## Run locally

```bash
cp .env.example .env.local   # then fill in your own Firebase config
npm install
npm run dev
```

Open http://localhost:5173.

## Project structure

```
src/
├── types/        TypeScript interfaces (Pact, Activity, DailyLog, Buzz, Board, Milestone)
├── store/        Zustand stores (auth, pact)
├── lib/          firebase.ts, constants.ts, utils.ts
├── components/   BottomNav, JarSVG, Avatar, StubScreen
└── routes/       33 route files (one per screen in the design)
```

## Design source of truth

- `DESIGN_BRIEF.md` and `IMPLEMENTATION.md` (in the original v1 repo) — product + engineering doc
- `/design/` mockups (35 HTML files) — visual reference

## Status

Skeleton phase. Every screen is reachable; most are placeholder. The data layer comes next.
