# NIB EXTRAS: OVERVIEW AND DECISIONS (phases 6 to 9)

Read after `docs/BRIEF.md` and `docs/plan/00-OVERVIEW.md`. The first five phases are done and live. These four phases make the entry more premium, more alive and more memorable. **Nothing here may break what already works.**

## 0. Prompt to paste at the start of every extras session

```
You are improving the live NIB site (Next.js, deployed at meet-nib.vercel.app). Read docs/BRIEF.md, docs/plan/00-OVERVIEW.md and docs/plan/00-EXTRAS.md, then the phase file I name.
Work on a new git branch named after the phase. Merge into main only when the phase checklist passes on a real phone and the console is clean.
Do not change the cursor engine rules: NIB's tip is the real pointer (zero smoothing), clicks are never delayed, reduced motion is respected, mute silences all sound.
No new heavy libraries. Commit with plain lowercase messages (no feat: or docs: prefixes) and push.
Never claim something passes unless you ran it. Tell me what you could not verify.
```

## 1. Honest answers to your questions

### Is dark mode needed?

**Yes, a day/night or mood toggle is a Tier 1 baseline item** in the rules ("changes character expression and color palette"). Removing it would lose points. But the current night mode (green phosphor on navy) was a quick palette swap, and you say it looks bad, so we **redesign it from scratch** in Phase 8. The new idea: night is not "invert the colours". It is **a dark room lit by NIB**. NIB glows like a nightlight, the page lights up around it, and hidden drawings appear only where its light touches. That also covers the Tier 2 "flashlight or nightlight cursor" item.

New night palette: warm amber monochrome-monitor look (amber text, hot pink accent, brown-black background) instead of green on navy. Amber is warmer, more cozy-baby and more distinctive.

### Should we add 3D (Three.js)?

**No full 3D model.** Reasons: it is a Tier 3 item that the rules say scores *worse* than a clean Tier 1 if it is rough; it adds a heavy library, hurts mobile performance and Lighthouse, and creates new ways to get console errors, all with about 24 hours left. NIB is a 2D arrow by design, and the arrow *is* the character.

What we do instead is **make it feel dimensional without WebGL** (Phase 7): shading and a cast shadow on NIB, a soft light when it hops, windows that tilt slightly toward the pointer in perspective, layered depth, and the night lighting in Phase 8. This reads as premium and costs almost nothing.

### How do we get "Awwards-like"?

Honestly: you cannot guarantee it, and effects alone do not do it. What separates award-style sites is, in order: one strong idea executed everywhere, a memorable first 10 seconds, typography and spacing with intent, motion that has a consistent personality, tiny details nobody asked for, and rock-solid performance. We already have the idea (the cursor is the character). The extras add the missing parts: a **birth moment** for the first seconds, **depth and lighting**, **an OS-like desktop feel**, **finish details** (grain, favicon that shows NIB's mood, tab title), and **aliveness** (NIB fidgets, gets dizzy, remembers you).

I could not see the live visuals, so please send me screenshots (day and night, desktop and phone) after Phase 7 and Phase 8 and I will give specific design corrections.

## 2. Order, time and cut lines

| Order | Phase | Why this order | Time |
|---|---|---|---|
| 1 | `PHASE-8.md` Nightlight | Fixes the visible weakness (night mode) and adds a Tier 2 feature | about 2h |
| 2 | `PHASE-7.md` Premium pass | The first impression judges get | about 4h |
| 3 | `PHASE-6.md` Take NIB home, dial-up, arpeggio | Delight and surprises (20% of the score) | about 2.5h |
| 4 | `PHASE-9.md` Aliveness and memory | Adds a Tier 3 item and makes NIB feel real | about 3h |

- Total about 11.5h. **Feature freeze 3 hours before the deadline (19 Oct 2026, 17:17 IST).** After the freeze only bug fixes.
- If under 8 hours remain: do Phase 8, then Phase 7 sections 7.1 to 7.3 only, then stop and run the final checklist.
- If under 5 hours remain: do nothing new; run the QA from Phase 5 again and submit.
- Each phase ends in a working, deployable state. Deploy after each merge.

## 3. Rules for all extras

1. **Performance budget:** stays smooth (about 60fps) on a mid-range phone; no layout shift; `npm run build` clean; no long tasks introduced by an effect. If an effect janks, remove the effect, not the feature.
2. **Reduced motion:** every motion effect in these phases is disabled under `prefers-reduced-motion: reduce`.
3. **Touch:** hover-only effects (tilt, desktop icons hover) are skipped on touch; nothing essential depends on hover.
4. **Kill switch:** add `?fx=0` to the URL to disable Phase 7 to 9 visual effects (sets `data-fx="off"` on `<html>` before first paint, in the same theme script). All effect CSS is scoped under `html:not([data-fx="off"])` and effect JS checks the flag. Use it if a judge's browser misbehaves.
5. **Sound:** every new sound respects the mute switch and starts only from a user gesture.
6. **Accessibility:** decorative layers are `aria-hidden` and `pointer-events: none`; contrast stays at least 4.5:1 for text in both themes; every new control is a real keyboard-accessible button or link.
7. **No fake data**, no copied assets, credit anything new in `CREDITS.md`.
8. Update `docs/BRIEF.md` section 12 "Visual direction": night is now **amber nightlight**, not green phosphor (this is a direction, not a locked token).

## 4. Explicitly not doing

- Three.js or any WebGL.
- Draggable, free-positioned windows (fragile layout, accessibility risk, low payoff).
- NIB leaving the pointer to "scurry" somewhere in mouse mode (breaks the locked tip rule).
- Any autoplaying sound.
