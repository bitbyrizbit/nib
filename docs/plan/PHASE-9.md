# PHASE 9: ALIVENESS AND MEMORY (NIB feels like a real thing)

Branch: `alive`. Read `docs/plan/00-EXTRAS.md` first. Do this last; it touches the cursor engine, so work carefully and re-test the Phase 1 checklist at the end.

## Goal and why

NIB already reacts to the pointer. This phase makes it feel like it has a life of its own: it fidgets when you pause, gets dizzy if you scroll too fast, notices when you leave and come back, and **remembers returning visitors** (a Tier 3 item: "character remembers the visitor"). It also adds a second, secret Easter egg. Everything stays inside the locked rules: tip locked to the pointer in mouse mode, clicks never delayed, reduced motion respected.

---

## Step 9.1: Idle fidgets

When NIB is idle (3 to 8 seconds without input, not yet sleepy), it occasionally does one small thing: look around, wag its tail, or yawn. Never more than one every 4 to 9 seconds. None of this runs under reduced motion.

Add to `NibBrain`:

```ts
fidget: "none" | "look" | "wag" | "yawn" = "none";
private fidgetUntil = 0;
private nextFidget = 6;

// in update(), after the mood is computed and not reduced:
if (m === "idle" && idle > 3 && idle < 8 && this.now > this.nextFidget && this.fidget === "none") {
  const pick = (["look", "wag", "yawn"] as const)[Math.floor(Math.random() * 3)];
  this.fidget = pick;
  this.fidgetUntil = this.now + (pick === "yawn" ? 1.4 : pick === "look" ? 1.6 : 0.8);
  this.nextFidget = this.now + 4 + Math.random() * 5;
  if (pick === "wag") this.tail.forEach((p, i) => { p.px += i % 2 ? 5 : -5; });
}
if (this.fidget !== "none" && (this.now > this.fidgetUntil || m !== "idle")) this.fidget = "none";
if (this.fidget === "look") { this.eyeX.target = Math.sin(this.now * 4); this.eyeY.target = Math.cos(this.now * 3) * 0.4; }
if (this.fidget === "yawn") syT *= 1.1;
```

In `nibRenderer.ts` draw the mouth as a wide open `O` (arc, radius 1.3) when `b.fidget === "yawn"`. Commit: `add nib fidgets`

## Step 9.2: Scroll reactions (dizzy)

NIB tracks scroll speed. Fast sustained scrolling makes it dizzy (spiral pupils and a wobble); it says `whoa. too fast.` once per session.

1. Add the `dizzy` mood: extend the `Mood` union, add `dizzy: "1010"` to `MOOD_BITS` in `src/lib/bits.ts`, and make sure every `Record<Mood, ...>` still compiles (`npx tsc --noEmit` will tell you).
2. In `NibLayer`, compute smoothed scroll velocity in the existing `onScroll`:

```ts
let lastY = scrollY, lastT = performance.now();
const onScroll = () => {
  brain.poke();
  const now = performance.now();
  const v = ((scrollY - lastY) / Math.max(1, now - lastT)) * 1000;
  brain.scrollV += (v - brain.scrollV) * 0.3;
  lastY = scrollY; lastT = now;
};
```

3. In `NibBrain`: `scrollV = 0;` and `private dizzyFor = 0;`. In `update`, decay `this.scrollV *= Math.pow(0.001, dt)`; if `Math.abs(this.scrollV) > 2200` accumulate `this.dizzyFor += dt` else `this.dizzyFor = Math.max(0, this.dizzyFor - dt)`; when `dizzyFor > 0.6` set `dizzyUntil = this.now + 1.2`. In the mood block, after the click and disabled checks: `else if (this.now < this.dizzyUntil) m = "dizzy";`. Body target for dizzy: `a += Math.sin(this.now * 14) * 0.12`.
4. Renderer: for `dizzy`, replace pupils with a small spiral (a few arcs of growing radius rotating with `b.now * 8`); mouth a wavy line.
5. Voice: add `dizzy: "whoa. too fast."` to the `LINES` map in `NibVoice` (the once-per-session and 15-second rules already apply).

Commit: `add dizzy mood`

## Step 9.3: Leaving and coming back

When the tab becomes visible again after at least 10 seconds hidden, NIB celebrates (happy squash) and says `you're back!`. Add in `NibLayer` (inside the existing `onVis`, visible branch):

```ts
if (hiddenAt && performance.now() - hiddenAt > 10000) { brain.pointerDown(); brain.pointerUp(); window.dispatchEvent(new Event("nib:back")); }
```

with `let hiddenAt = 0;` set to `performance.now()` in the hidden branch. In `NibVoice` listen for `nib:back` and say `you're back!` (forced, but still at most once per minute). Commit: `add welcome back`

## Step 9.4: NIB remembers returning visitors (Tier 3)

Stored **only in the visitor's own browser** (`localStorage`), nothing is sent to the server.

`src/lib/visitor.ts`:

```ts
import { loadJSON, saveJSON } from "@/lib/storage";

export type Visitor = { visits: number; first: number; name: string };

export function touchVisitor(): Visitor {
  const v = loadJSON<Visitor>("nib:visitor", { visits: 0, first: Date.now(), name: "" });
  let counted = false;
  try { counted = !!sessionStorage.getItem("nib:session"); sessionStorage.setItem("nib:session", "1"); } catch {}
  if (!counted) { v.visits += 1; saveJSON("nib:visitor", v); }
  return v;
}

export function rememberName(name: string) {
  const clean = name.trim().slice(0, 24);
  if (!clean) return;
  const v = loadJSON<Visitor>("nib:visitor", { visits: 1, first: Date.now(), name: "" });
  v.name = clean;
  saveJSON("nib:visitor", v);
}
```

- In `NibVoice`, replace the opening line `hi. be gentle.` with: first visit `hi. be gentle.`; later visits with a remembered name `hi again, NAME.`; later visits without a name `hi again. you came back.`. Render the name as plain text only (it is the visitor's own typed word; never as HTML).
- In `Guestbook.tsx`, after a successful post, call `rememberName(name)` when a name was typed.
- Add one line to the README: "NIB remembers returning visitors using the browser's local storage. Nothing is sent anywhere."
- Add a small `forget me` button in the footer that clears `nib:visitor`, `nib:adopted`, `nib:egg`, `nib:eggPosted` and `nib:lastVisit` after confirming (a real working control; show `forgotten.` in a status line).

Commit: `add visitor memory`, `add forget button`

## Step 9.5: Second Easter egg (Konami code, desktop only)

Typing the classic sequence (arrow up, up, down, down, left, right, left, right, B, A) makes NIB go **turbo** for 6 seconds: it grows 40 percent, leaves a heavier bit trail, plays the `shake` arpeggio (respecting mute) and says `level up.`. A bonus for curious visitors; it does nothing if the user is typing in an input.

```ts
// in NibLayer, inside the keydown handler
const SEQ = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
// outside: let pos = 0;
if (!(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
  pos = e.key.toLowerCase() === SEQ[pos].toLowerCase() ? pos + 1 : e.key === SEQ[0] ? 1 : 0;
  if (pos === SEQ.length) { pos = 0; brain.turboUntil = brain.now + 6; window.dispatchEvent(new Event("nib:turbo")); }
}
```

In `NibBrain` add `turboUntil = 0;` and `get scale() { return S * (this.turboUntil > this.now ? 1.4 : 1); }`, and use `this.scale` instead of `S` in `updateTail` and in the renderer's `ctx.scale(...)`. While turbo, spawn trail particles at a lower speed threshold (for example `speed > 150`). `NibVoice` listens for `nib:turbo` (forced line `level up.`) and the audio side calls `play("shake")` from a small listener in `SoundEffects`. Skip the size change under reduced motion (voice and sound only). Commit: `add second egg`

---

## Final regression (run everything again before the freeze)

Re-run the Phase 1 verification list (every item), the Phase 3 list, the Phase 5.1C list and the checks for Phases 6 to 8 that you shipped. In addition:

1. Idle for a few seconds: NIB occasionally fidgets; never twice in a row quickly; stops fidgeting when you move.
2. Scroll very fast for about a second: NIB gets dizzy and says its line once; scrolling slowly never triggers it.
3. Switch tabs for 15 seconds and return: NIB celebrates once.
4. Sign the guestbook with a name, reload in a new session: NIB greets you by name. `forget me` removes it.
5. Konami works on desktop, does nothing while typing in the guestbook, and is silent when muted.
6. Reduced motion: no fidgets, dizzy wobble, turbo growth or trail.
7. `?fx=0`: all extras disabled and the site still works.
8. Lighthouse mobile: record the numbers; no regressions compared with before the extras. Console clean; `npm run build` passes; real phone check.
9. Update `README.md` (new features, privacy line) and `CREDITS.md`. Merge, deploy, and re-submit or update the submission if the portal allows edits.

Remember the freeze: no new features in the last 3 hours before 19 Oct 2026, 17:17 IST.
