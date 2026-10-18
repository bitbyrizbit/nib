# NIB BUILD PLAN: OVERVIEW (read this first, every session)

This plan sits next to `docs/BRIEF.md`. The brief is the source of truth for rules, rubric and locked creative decisions. This plan turns it into five buildable phases. If the two ever disagree, the brief wins and you tell the owner.

## 0. Prompt to paste at the start of every session

```
You are building NIB for the haX.baby "Baby's First Website" hackathon (Track 2).
Before doing anything read docs/BRIEF.md and docs/plan/00-OVERVIEW.md in full, then the phase file I name.
Rules: do not invent features, assets, rules or dates. Do not change LOCKED decisions in the brief.
Build only the current phase. Do not start the next phase until every item in this phase's checklist passes.
After each numbered step: run it, check the browser console, then make one small commit with a plain message (see section 3).
If something is unclear, ask me one short question instead of guessing.
Never claim something was tested unless you actually ran it. Say what you could not verify.
```

## 1. Time reality (read carefully)

- The submission deadline is **19 Oct 2026, 17:17 IST** (code freeze). The portal opened 18 Oct 17:17 IST.
- Today is 18 Oct. Work out the real hours left before you start: `hours left = deadline minus now`. This plan was written without knowing the current clock time.
- Focused-work budgets: Phase 1 about 5h, Phase 2 about 5h, Phase 3 about 5h, Phase 4 about 4h, Phase 5 about 4h. Total about 23h plus sleep and breaks.
- **The site is submittable after Phase 3** (Tier 1 complete, Tier 2 audio toy, 3 projects, Easter egg, mute). Phase 4 (backend) adds points and depth. Phase 5 is QA, submission pack and the optional Chaos Mode.
- **Cut lines:**
  - Under 8 hours left: do Phase 1, Phase 2, Phase 3 (skip trail and growth cosmetics), then Phase 5 sections 5.1 and 5.2 only.
  - 8 to 14 hours left: Phases 1 to 3, then Phase 4 counter plus guestbook, then 5.1 and 5.2.
  - 14 or more hours left: everything except Chaos Mode, then Chaos Mode only if at least 3 hours remain after 5.2.
- **Always deploy after Phase 1** and keep a live URL working from then on.
- Never leave the last 2 hours for anything except QA and submitting.

## 2. Decisions made in this plan (these resolve the OPEN items in brief section 14)

| Area | Decision | Why |
|---|---|---|
| Framework | Next.js (latest stable, App Router) + TypeScript | The owner knows it; API routes give a real backend on the same deploy, no cold-start separate server |
| Styling | Plain CSS with custom properties (`tokens.css`, `globals.css`). **No Tailwind, no UI kit, no animation library** | Keeps the look unique and the bundle small |
| NIB rendering | One fixed full-screen `<canvas>` with a hand-written spring and verlet-tail engine | Full control, zero dependencies, tip locked to the pointer |
| Audio | Raw Web Audio API, one shared `AudioContext` and one master gain | Mute silences everything; no asset licensing issues |
| Backend | Upstash Redis (REST) via Next.js route handlers | Atomic counters, simple, no schema migrations, free tier |
| Abuse protection | `@upstash/ratelimit`, honeypot, minimum fill time, URL and profanity filter (`obscenity`), same-origin check | Real guestbook without a moderation team |
| Hosting | Vercel | Zero-config for Next.js; preview and production URLs |
| Fonts | Bagel Fat One (display), Pixelify Sans (UI and body), VT323 (terminal and counters), all OFL via `next/font/google` | Distinct from the host's look; open licences |

If the owner objects to any row, stop and ask before building.

## 3. Git rules (owner's requirement)

- Commit messages are **plain, short and lowercase**. No prefixes or jargon such as `feat:`, `docs:`, `init:`, `fix:`, `chore:`.
- Good: `add nib cursor`, `add story section`, `fix phone overflow`, `add guestbook`.
- Bad: `feat: implement cursor physics engine`, `docs: update readme`.
- Maximum about 5 words. One idea per commit. Commit after every numbered step and at least every 45 minutes.
- Always `git push` after committing so the public history stays current.
- Every commit must leave the app building (`npm run build` passes at the end of each phase, and `npm run dev` runs without console errors after every step).

## 4. Final file tree (target at the end of Phase 5)

```
nib/
  AGENTS.md  README.md  CREDITS.md  LICENSE  .gitignore  .env.example
  package.json  next.config.ts  tsconfig.json
  docs/  BRIEF.md  plan/ (these files)
  public/  favicon.svg  og.png  robots.txt
  src/
    app/
      layout.tsx  page.tsx  globals.css  tokens.css
      api/guestbook/route.ts
      api/guestbook/[id]/route.ts
      api/visit/route.ts
      api/egg/route.ts
      api/stats/route.ts
    components/
      shell/ Window.tsx  Taskbar.tsx  ThemeToggle.tsx  MuteButton.tsx
      nib/ NibLayer.tsx  nibBrain.ts  nibRenderer.ts  nibShape.ts  spring.ts  nibBus.ts  classify.ts  NibSvg.tsx  NibVoice.tsx
      sections/ Hero.tsx  Story.tsx  Projects.tsx  About.tsx  Footer.tsx
      projects/ LostFound.tsx  Playground.tsx  NibbleBox.tsx  Guestbook.tsx
      ui/ BitLights.tsx  Odometer.tsx  EggModal.tsx
    lib/ audio.ts  bits.ts  theme.ts  storage.ts  nav.ts
    lib/server/ store.ts  validate.ts  limits.ts
```

## 5. Environment variables (Phase 4)

`.env.example` (committed) and `.env.local` (never committed):

```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
GUESTBOOK_SALT=put-a-long-random-string-here
ADMIN_KEY=put-another-long-random-string-here
```

The same four go into Vercel Project Settings, then Environment Variables, for Production and Preview. If the Upstash integration from the Vercel Marketplace injects `KV_REST_API_URL` and `KV_REST_API_TOKEN` instead, the code in Phase 4 accepts both names.

## 6. Global rules for every phase

1. All NIB logic is client-side only (`"use client"`). Never run canvas, audio or `window` code during server rendering.
2. **The tip of NIB is the real pointer position, with zero smoothing.** Only body, eyes and tail use springs.
3. The click action fires immediately. Animation never delays or blocks a click.
4. Respect `prefers-reduced-motion`: no lean, bounce, wandering, trail or parallax; keep state changes instant.
5. Native cursor stays over inputs, textareas and selects (class `nib-native` logic in Phase 1).
6. Mobile first: use `dvh` not `vh` for full-height things, no horizontal scroll at 360px width, touch targets at least 44x44px.
7. Audio starts only after a user gesture. The mute switch silences every source (Phase 3).
8. No fake numbers. Counters and the guestbook are real, or labelled "demo mode, not saved".
9. All art is original (SVG, CSS, canvas). No third-party images. Every font and library is credited in `CREDITS.md` and the footer.
10. The code in these docs is reference code written without running it. Run `npx tsc --noEmit` and `npm run lint` after pasting, fix any type errors, and tell the owner what you changed.

## 7. Phase map

| Phase | File | What exists when it is done | Submittable? |
|---|---|---|---|
| 1 | `PHASE-1.md` | Project set up, design tokens, desktop shell, hero, living NIB cursor with physics, theme toggle, live on Vercel | No |
| 2 | `PHASE-2.md` | Scroll story, character sheet, Lost & Found, Pointer Playground, footer | Almost (2 projects) |
| 3 | `PHASE-3.md` | Audio engine and mute, click sounds, Nibble Box, Easter egg, voice lines, trail, cosmetics | **Yes** |
| 4 | `PHASE-4.md` | Real backend: visit counter, guestbook, secret-finder count, abuse protection | Yes, stronger |
| 5 | `PHASE-5.md` | QA, accessibility, performance, submission pack, optional Chaos Mode | Final |

## 8. Definition of done for the whole project

All of section 18 in `docs/BRIEF.md` passes, plus: `npm run build` clean, no console errors on a real phone, the live URL works in an incognito window, and the repo shows commits across 17 to 19 October.
