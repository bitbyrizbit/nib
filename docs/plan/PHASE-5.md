# PHASE 5: QA, SUBMISSION PACK AND CHAOS MODE

Read `docs/BRIEF.md`, `docs/plan/00-OVERVIEW.md`. Phase 3 must be ticked (Phase 4 is strongly recommended). Order inside this phase is strict: **5.1 QA, then 5.2 submission pack, then (only if time allows) 5.3 Chaos Mode**. The submission pack must exist before any risky extra work starts.

## What this phase delivers and why

The rubric gives 35% to polish and zero console errors and 15% to clean craft. A great idea with one visible bug loses to a simpler, flawless site. This phase finds and fixes those bugs, prepares everything the rules require you to submit, and optionally adds the +5 point Responsive Chaos Mode.

## Prompt for this phase

```
Do Phase 5 from docs/plan/PHASE-5.md in order: 5.1, then 5.2. Do 5.3 only if I say there are at least 3 hours left.
Report every bug you find with how you reproduced it, then fix it. Never claim something passes unless you actually ran it; list what you could not test.
Commit after each fix with a plain lowercase message (no prefixes), then push.
```

---

## 5.1: QA sweep (find and fix everything)

### A. Run the machine checks

```powershell
npx tsc --noEmit
npm run lint
npm run build
```

All must pass. Read the build output: no page should be unexpectedly huge. If the first-load JS is large, check that nothing heavy was imported on the client that should not be.

### B. Viewports to test (Chrome DevTools device toolbar, then a real phone)

| Size | Check |
|---|---|
| 360 x 640 | No horizontal scroll, taskbar fits with the sound button visible, story stage fits above the taskbar |
| 390 x 844 | Everything tappable, NIB wanders without hiding the text for long |
| 768 x 1024 | Layout switches cleanly, projects not cramped |
| 1280 x 720 | Laptop and projector size; hero fits and the wordmark is not cut off |
| 1920 x 1080 | Nothing stretched ugly; max widths hold |

### C. Behaviour checklist (all must pass)

1. Mouse: the tip is exactly under the pointer; moods work (curious, read, pout, grab, sleepy, asleep, happy).
2. Native cursor appears in the guestbook inputs, and NIB fades out there and returns after.
3. Touch (real phone): NIB wanders, walks to taps, no cursor hidden, page scrolls normally, Playground slider drags without scrolling the page.
4. Keyboard only: Tab reaches every control in a logical order with a visible focus ring; NIB moves beside the focused element; Esc closes the Start menu, the note and the egg dialog; the Nibble Box, adopt notes, guestbook form and slider are all operable.
5. Reduced motion (DevTools, Rendering, emulate): no wandering, bounce, trail, bits rain or scroll-linked animation; everything still works.
6. Sound: silent before the first gesture; mute silences the click sounds, Nibble Box, adopt chime and lullaby; mute state survives reload.
7. Day and night: both palettes readable; no unstyled flash on reload; NIB glow only at night.
8. Story: all five scenes read correctly in order; jump buttons work; the hidden full list is read by a screen reader.
9. Easter egg: four quick clicks open it by mouse, touch and keyboard; it does nothing if clicks are slow.
10. Backend (if Phase 4 done): counter, guestbook, rate limit and demo mode behave as in the Phase 4 checklist on the **live** URL.
11. Offline or slow network (DevTools, Slow 4G): the page still renders and the counter and guestbook fail gracefully with the friendly messages and no console errors.
12. Console: zero errors and zero warnings in Chrome and Firefox. Test Safari or an iPhone if you can.

### D. Accessibility pass

- Install the axe DevTools extension and run it on the page in day and night mode; fix every serious or critical issue.
- Contrast: body text and controls at least 4.5:1 in both themes (check the token values with a contrast checker, especially `--text-soft` and the pink and phosphor colours in night mode).
- Every button has an accessible name; every image or SVG is either labelled (`role="img"` plus `aria-label`) or `aria-hidden`; headings go in a sensible order (one `h1`).
- Quick screen reader test with NVDA (free) or VoiceOver: the page is understandable without seeing it.

### E. Performance pass

- Run Lighthouse (Chrome DevTools, mobile mode). Do not chase 90+ at the cost of features, but fix any obvious red items: oversized JS, layout shift (CLS), blocking requests.
- The NIB canvas must stop when the tab is hidden (already in Phase 1); confirm CPU drops in a background tab.
- The canvas is capped at devicePixelRatio 2; confirm no jank on a mid-range phone.

### F. Known pitfalls to check specifically

- **iOS Safari audio:** needs a user tap first (we unlock on pointerdown), and the hardware silent switch can mute Web Audio. Mention this in the README so a judge on an iPhone is not confused.
- `100vh` jumps on mobile browsers: use `dvh` everywhere (check the story stage and any full-height block).
- `<dialog>` support: fine in current browsers; make sure the egg works on the real phone.
- Hydration warnings: the taskbar clock renders `--:--` first, then updates in an effect (this is intentional). Fix any other mismatch warning.
- `position: sticky` stops working if an ancestor has `overflow` set. If the story stage does not stick, replace `overflow-x: hidden` on `body` with `overflow-x: clip`.
- `localStorage` can throw in private mode: all uses must be inside `try/catch` (they are in the reference code; verify any you added).
- No leftover `console.log`, test buttons or `TODO` text.

Commit each fix on its own: `fix phone overflow`, `fix focus ring`, and so on.

---

## 5.2: Submission pack (do this before anything optional)

### A. README.md (final)

Rewrite `README.md` so a judge understands the project in 60 seconds:

```
# nib

> Click gently. I'm new here.

NIB is a baby cursor: a newborn pointer discovering the internet, one click at a time.
Built in 48 hours for the haX.baby "Baby's First Website" hackathon, Track 2 (Your Own Baby).

Live site: https://YOUR-LIVE-URL

## Try this (60 seconds)
1. Move your mouse. That arrow is NIB, and its tip is your real pointer.
2. Hover a link, a paragraph, then something locked. NIB reacts differently each time.
3. Click anywhere. Watch the lean, squash and bounce.
4. Scroll the story. NIB grows from four bits into a cursor.
5. Open the Pointer Playground, the Lost & Found and the Nibble Box.
6. Sign the guestbook.
7. Find the hidden thing on the hero. (Hint: NIB is four bits old.)
On a phone, NIB wanders and walks to wherever you tap.
iPhone note: turn off silent mode to hear sound, and tap once to start audio.

## Character sheet
(copy the five fields from the site)

## What is real
- NIB is a hand-written canvas engine: spring physics, a verlet tail, and a mood state machine. No animation library.
- The Nibble Box is a Web Audio synth with a look-ahead scheduler; a pattern is 4 hex digits and shareable by link.
- The visitor counter and guestbook use a real database (Upstash Redis) with rate limiting and spam filtering.

## Run locally
npm install
npm run dev
(copy .env.example to .env.local and fill it in to enable the backend; without it the site runs in a clearly labelled demo mode)

## Credits
See CREDITS.md
```

### B. CREDITS.md (final)

List, with licence and link for each: Bagel Fat One, Pixelify Sans and VT323 (SIL Open Font License via Google Fonts); Next.js, React, `@upstash/redis`, `@upstash/ratelimit`, `obscenity` (check each package's licence in `node_modules/<pkg>/package.json` and write the real one); all character art and drawings original (SVG, CSS, canvas); all audio synthesised in the browser with the Web Audio API (no samples); AI assistance: built with help from AI coding tools (Claude), with all code reviewed by the owner. Make the footer credits match this file exactly.

### C. Metadata and share image

- `public/favicon.svg`: the NIB arrow in yellow with ink outline (original SVG).
- `public/og.png` (1200 x 630): NIB plus the wordmark on the wallpaper colour, drawn by you (screenshot of the hero is fine). Reference it in `layout.tsx` metadata (`openGraph.images`, `twitter` card summary_large_image). Replace the placeholder `metadataBase` with the real live URL.

### D. The story write-up (one of the required submissions)

A draft for the owner to edit into their own voice (keep it honest and specific):

```
NIB is a baby cursor. Most characters live on a page; NIB lives in the interface itself. The tip of the arrow is your real pointer, so when you click, you are holding NIB. I wanted a character whose body, personality and portfolio were all the same thing, and the hackathon's "Baby's First Website" idea gave it a reason to exist: this is NIB's first website.

NIB is four bits old (half a byte, a nibble), and that number shows up everywhere: four lights show its mood, the Nibble Box is a four-step, four-bit music toy whose whole pattern is four hex digits you can share as a link, and the origin story grows NIB from four blinking bits into a full cursor.

What I am proudest of: the cursor engine, written from scratch with springs, a tail simulation and a mood state machine so NIB leans toward links, squints at text, pouts at locked things and falls asleep when you stop moving; the Lost & Found, where NIB adopts abandoned pieces of the old web; and the real backend, a guestbook and visitor counter with rate limiting and spam filtering, labelled honestly as demo mode when it is not connected.

I used AI coding tools while building, and I reviewed and own all of the code. All art is original (SVG, CSS, canvas), all sound is synthesised in the browser, and every font and library is credited in the footer.
```

Check every sentence against what is actually built before submitting; delete anything that is not true.

### E. History, deploy and submit

1. **History check.** Run `git log --format="%ad  %s" --date=iso`. Commits must fall between 17 and 19 October 2026. Never rewrite history (no force push, no rebase of published commits).
2. **Final deploy.** `vercel --prod`. Open the live URL in an **incognito window** on a laptop and on a real phone; run the 5.1C list one last time.
3. **Repo.** Confirm the GitHub repo is **public**, the README renders, `.env.local` is not in the repo.
4. **Submit with margin.** Submit at least 2 hours before **19 Oct 2026, 17:17 IST**, using the five items in section 10 of the brief (live URL, repo, story write-up, character sheet, credits). If the portal allows editing, you can improve afterwards; if it does not, you have already submitted something complete.
5. **Backup.** Record a 60 second screen capture of the main moments and save screenshots, in case a judge cannot run something.
6. **Feature freeze** 3 hours before the deadline: only bug fixes after that, no new dependencies.

Commit: `update readme`, `add share image`, `update credits`.

---

## 5.3: Responsive Chaos Mode (+5 points; only with at least 3 hours left after 5.2)

### Principle

Three expressions of **one world**, not three websites. Same components, same content, same NIB. Only layout and styling change at breakpoints. Text stays readable, navigation predictable, every visible control real. If it is not stable on a real phone after 2 hours, **throw it away** and ship without it.

### Safety rules

- Work on a branch: `git switch -c chaos`. Merge only when everything below passes: `git switch main` then `git merge chaos -m "add chaos mode"`.
- Pure CSS media queries do the reshaping. All Chaos CSS is scoped under `html:not([data-chaos="off"])`.
- Kill switch: visiting `/?chaos=0` sets `data-chaos="off"` and restores the normal layout. Add this in `layout.tsx` inside the theme script:

```js
if (/[?&]chaos=0\b/.test(location.search)) document.documentElement.dataset.chaos = 'off';
```

### The three forms

| Width | Form | What changes |
|---|---|---|
| 1100px and up | **The home computer** | The existing desktop: windows, taskbar, wallpaper |
| 700 to 1099px | **The pocket console** | A chunky beige console bezel around the page; projects become **cartridges** (two-column grid, windows with a notched top edge using `clip-path`); a control strip along the bottom |
| under 700px | **The pocket gadget** | A narrow handheld frame; green LCD palette (dark olive background, bright green text) layered over the tokens; the taskbar becomes a row of big 56px buttons; one-column everything |

### The control strip (real controls, not decoration)

Rendered only in console and gadget forms (CSS hides it on desktop). Buttons: `prev` and `next` (scroll to the previous or next section in `NAV`), plus the existing sound and night buttons moved into the same strip.

```tsx
"use client";
import { NAV } from "@/lib/nav";

export default function ChaosControls() {
  const go = (dir: 1 | -1) => {
    const tops = NAV.map((n) => ({ id: n.id, top: document.getElementById(n.id)?.getBoundingClientRect().top ?? Infinity }));
    let cur = 0;
    tops.forEach((t, i) => { if (t.top <= 80) cur = i; });
    const target = Math.min(NAV.length - 1, Math.max(0, cur + dir));
    document.getElementById(NAV[target].id)?.scrollIntoView({ block: "start" });
  };
  return (
    <div className="chaos-controls" role="group" aria-label="Section controls">
      <button type="button" className="tb-btn" onClick={() => go(-1)}>◀ prev</button>
      <button type="button" className="tb-btn" onClick={() => go(1)}>next ▶</button>
    </div>
  );
}
```

Replace the arrow glyphs with plain text if the pixel font does not render them. `.chaos-controls { display: none; }` by default, shown only inside the two small-screen media queries.

### CSS skeleton (add to `globals.css`)

```css
@media (min-width: 700px) and (max-width: 1099px) {
  html:not([data-chaos="off"]) body { background: #8c8570; padding: 16px 16px calc(var(--taskbar-h) + 72px); }
  html:not([data-chaos="off"]) .main { background: var(--wallpaper); border: 6px solid #1c1b18; border-radius: 18px; box-shadow: inset 0 0 0 4px var(--plastic-hi), 0 8px 0 #1c1b18; padding: var(--s5); }
  html:not([data-chaos="off"]) .projects { grid-template-columns: 1fr 1fr; }
  html:not([data-chaos="off"]) .projects .window__bar { clip-path: polygon(0 0, 92% 0, 100% 100%, 0 100%); }
  html:not([data-chaos="off"]) .chaos-controls { display: flex; gap: var(--s3); position: fixed; left: 0; right: 0; bottom: var(--taskbar-h); justify-content: center; padding: var(--s2); background: var(--plastic); border-top: 2px solid var(--line); z-index: 49; }
}

@media (max-width: 699px) {
  html:not([data-chaos="off"]) body { background: #2a2d1f; padding: 10px 10px calc(var(--taskbar-h) + 72px); }
  html:not([data-chaos="off"]) { --wallpaper: #b9c98a; --plastic: #c7d79a; --plastic-hi: #e3efc0; --plastic-lo: #8a9a5c; --line: #1f2a12; --text: #1f2a12; --text-soft: #3b4a22; --title-bg: #1f2a12; --title-fg: #c7d79a; }
  html:not([data-chaos="off"]) .main { border: 8px solid #1c1b18; border-radius: 22px 22px 40px 40px; padding: var(--s4); }
  html:not([data-chaos="off"]) .tb-btn { min-height: 56px; }
  html:not([data-chaos="off"]) .chaos-controls { display: flex; gap: var(--s3); position: fixed; left: 0; right: 0; bottom: var(--taskbar-h); justify-content: center; padding: var(--s2); background: var(--plastic); border-top: 2px solid var(--line); z-index: 49; }
}
```

Night mode on the gadget: keep the dark tokens (`[data-theme="night"]` must still win), so add the gadget colour overrides only for `[data-theme="day"]` or make sure the night selector comes later and with equal specificity. Test both. Add `className="projects"` to the projects grid and render `<ChaosControls />` next to `<Taskbar />` in `page.tsx`.

### Chaos acceptance

- [ ] Each of the three forms is reached by resizing the window; no horizontal scroll in any of them
- [ ] Prev and next buttons really move between sections; sound and night buttons still work
- [ ] Text contrast 4.5:1 or better in the LCD palette; every tap target at least 44px
- [ ] NIB still works in each form (mouse on desktop and console widths, touch on the gadget)
- [ ] `/?chaos=0` restores the normal layout
- [ ] Verified on a real phone and a real tablet or a tablet-sized window
- [ ] Merged only if everything above passes; otherwise the branch is dropped and the submitted site is unchanged

Commit: `add chaos frames`, `add chaos controls`, then merge as described.

---

## Final project checklist (everything, one last time)

- [ ] All of section 18 in `docs/BRIEF.md` passes
- [ ] `npm run build` clean; zero console errors on laptop and real phone
- [ ] Live URL works in incognito; repo is public with commits from 17 to 19 October
- [ ] README, CREDITS.md, footer credits, character sheet and story write-up are done and accurate
- [ ] Submitted before 19 Oct 2026, 17:17 IST, with a safety margin
