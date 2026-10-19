# PHASE 11: NIB'S HEART (crisp downloads, the lonely tab, trust, and a diary)

Branch: `heart`. Read `docs/BRIEF.md` and `docs/plan/00-EXTRAS.md` first.

## Goal and why

NIB reacts well but does not yet have a **relationship** with the visitor. This phase builds one, in small pieces that each take only seconds to notice:

1. **The tagline becomes a mechanic.** "Click gently. I'm new here." Gentle clicks build NIB's trust; click-spamming makes NIB flinch. Trust is saved in the visitor's own browser, so NIB remembers you.
2. **NIB's diary** (new section). Short entries from NIB unlock as trust grows. This is the narrative: told through interaction, not a wall of text.
3. **The lonely tab, extended.** When the visitor leaves the tab, the title and favicon tell a small story over time (lonely, then hiding, then asleep), and NIB reacts differently depending on how long they were gone.
4. **Fix the blurry downloads.**

Nothing essential is gated: all navigation and the whole original story stay available from the first second. Trust only changes how NIB behaves and which diary pages are open.

## Prompt

```
Do Phase 11 from docs/plan/PHASE-11.md in order (11.1 to 11.5). Use the diary and voice copy exactly as written.
Reference code was written without being run: run npx tsc --noEmit and npm run lint, fix errors and tell me what you changed.
Locked rules stay: tip is the real pointer, clicks never delayed, reduced motion respected, mute silences all sound.
All stored data stays in the visitor's own browser (localStorage); nothing new is sent to the server.
Commit after each step with a plain lowercase message (no prefixes) and push. Report what you could not test.
```

---

## Step 11.1: Crisp NIB downloads

### Cause

The PNG and cursor are made by loading an SVG into an `<img>` at one size and then scaling it onto a canvas at another size. That resampling makes the edges soft, and at small sizes the thin outlines blur. Fix: **paint NIB directly onto a canvas at the exact target size** (no SVG image, no scaling), and offer larger sizes.

### Replace the pixel code in `src/lib/takeHome.ts`

Keep `nibSvg`, `download` and the `.cur` byte-writing code; replace `renderPixels` and `pngBlob`, and import the shape constants:

```ts
import { BODY, EYES, EYE_R, MOUTH } from "@/components/nib/nibShape";

export function paintNib(ctx: CanvasRenderingContext2D, k: number) {
  ctx.save();
  ctx.scale(k, k);
  ctx.translate(1, 1);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  BODY.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  const g = ctx.createLinearGradient(0, 0, 21, 31);
  g.addColorStop(0, "#ffe680"); g.addColorStop(0.55, "#ffd23f"); g.addColorStop(1, "#f2a900");
  ctx.fillStyle = g; ctx.fill();
  ctx.lineWidth = 1.5; ctx.strokeStyle = "#1c1b18"; ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath(); ctx.ellipse(2.2, 7.5, 0.8, 3.4, -0.25, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 0.8;
  for (const e of EYES) {
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(e.x, e.y, EYE_R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#1c1b18"; ctx.beginPath(); ctx.arc(e.x, e.y, EYE_R * 0.45, 0, Math.PI * 2); ctx.fill();
  }
  ctx.beginPath();
  ctx.moveTo(MOUTH.x - 1, MOUTH.y - 0.2);
  ctx.quadraticCurveTo(MOUTH.x, MOUTH.y + 1.1, MOUTH.x + 1, MOUTH.y - 0.2);
  ctx.stroke();
  ctx.restore();
}

export function renderPixels(w: number, h: number): ImageData {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  paintNib(ctx, h / 34);
  return ctx.getImageData(0, 0, w, h);
}

export function pngBlob(size: number): Promise<Blob> {
  const h = size, w = Math.ceil((size * 24) / 34);
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  paintNib(c.getContext("2d")!, h / 34);
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("png failed"))), "image/png"));
}
```

- `curBlob` now calls `renderPixels(32, 32)` synchronously (remove the `await`).
- PNG sizes offered: **128, 256, 512 (default) and 1024**; label them by height in pixels.
- Add `shape-rendering="geometricPrecision"` to the root `<svg>` string in `nibSvg`.
- Keep the in-page preview as the vector `NibPortrait` so it is sharp at any zoom.

Verify: open the downloaded 512 and 1024 PNGs at 100% zoom: outline and eyes are crisp, background transparent. The 32 by 32 cursor looks clean on a real Windows machine and the tip lands on the click point. Commit: `crisp downloads`

---

## Step 11.2: The lonely tab, over time

Replace the simple tab-hidden title swap in `TabPolish.tsx` with a timeline based on how long the tab has been hidden (use timestamps, not timers counting up, because background tabs throttle timers):

| Hidden for | Tab title | Favicon |
|---|---|---|
| 0 to 20 s | `come back? nib is lonely.` | **sad** (eyes down, small frown, one tear) |
| 20 to 90 s | `nib is hiding.` | **peek** (only the top of NIB and its eyes at the bottom edge) |
| 90 s to 5 min | `nib fell asleep.` | **asleep** (closed eyes, a tiny z) |
| over 5 min | `nib is still here.` | **asleep** |

```ts
const TITLES = ["come back? nib is lonely.", "nib is hiding.", "nib fell asleep.", "nib is still here."];
const ICONS = ["sad", "peek", "asleep", "asleep"] as const;
const stage = (s: number) => (s < 20 ? 0 : s < 90 ? 1 : s < 300 ? 2 : 3);

let hiddenAt = 0;
let timer: ReturnType<typeof setInterval> | undefined;
let original = document.title;

const apply = (i: number) => { document.title = TITLES[i]; setFavicon(ICONS[i]); };

const onVisibility = () => {
  if (document.hidden) {
    original = document.title;
    hiddenAt = Date.now();
    apply(0);
    timer = setInterval(() => apply(stage((Date.now() - hiddenAt) / 1000)), 1000);
  } else {
    clearInterval(timer);
    const away = (Date.now() - hiddenAt) / 1000;
    document.title = original;
    setFavicon("idle");
    window.dispatchEvent(new CustomEvent("nib:back", { detail: away }));
  }
};
document.addEventListener("visibilitychange", onVisibility);
```

Extend the favicon drawing (32 by 32 canvas, throttled as before) with the three new looks: `sad`, `peek`, `asleep`. Keep the static `favicon.svg` as the first-paint fallback. Under `?fx=0` keep only the simple title swap and no favicon changes.

### Return reactions (replace the Phase 9 welcome-back line)

In `NibVoice` handle `nib:back` using `detail` (seconds away). These bypass the 15 second rule but speak at most once per return, and only if the tab was hidden for at least 5 seconds:

| Away for | NIB says |
|---|---|
| under 20 s | `you're back!` |
| under 5 min | `i hid. i'm okay.` |
| 5 min or more | `i waited. hi.` |

NIB also does the happy squash on return (already in Phase 9). If the visitor was away for **20 seconds or more**, add trust `+2` once per return (step 11.3). Commit: `lonely tab story`

---

## Step 11.3: Trust (click gently)

### The rule

NIB has a trust value from 0 to 100, starting at 10, saved in `localStorage` key `nib:trust`.

| Event | Trust |
|---|---|
| A **gentle click**: at least 1 second after the previous click and the pointer moving slower than 500 px/s, on empty space, text or a link | +3 |
| **Presence**: every 20 seconds of real activity (pointer or scroll in the last 5 s, tab visible), at most 15 per session | +1 |
| Coming back after 20 s or more away | +2 |
| A **click storm**: 4 or more clicks within 1.5 s (empty space, text or links only; inputs, sliders and Nibble Box pads are ignored) | **minus 6** and NIB flinches |

A daily cap of +60 stops grinding. Trust never goes below 0 or above 100. Show **four pips** (small bit-lights) in the taskbar: filled pips = `min(4, floor(trust / 20))`.

### `src/lib/trust.ts`

```ts
"use client";
import { useSyncExternalStore } from "react";
import { loadJSON, saveJSON } from "@/lib/storage";
import { DIARY } from "@/lib/diary";

type State = { value: number; day: string; gained: number };
const KEY = "nib:trust";
const DAILY_CAP = 60;
const today = () => new Date().toISOString().slice(0, 10);

let state: State = { value: 10, day: today(), gained: 0 };
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  state = loadJSON<State>(KEY, state);
  if (state.day !== today()) state = { ...state, day: today(), gained: 0 };
}
function emit() { saveJSON(KEY, state); listeners.forEach((l) => l()); }

export const pipsFor = (v: number) => Math.min(4, Math.floor(v / 20));
export const trustValue = () => { load(); return state.value; };
export const unlockedCount = (v: number) => DIARY.filter((d) => v >= d.at).length;

export function addTrust(n: number) {
  load();
  if (n > 0) { n = Math.min(n, Math.max(0, DAILY_CAP - state.gained)); state.gained += n; }
  const before = state.value;
  const next = Math.max(0, Math.min(100, before + n));
  if (next === before) return;
  state = { ...state, value: next };
  emit();
  window.dispatchEvent(new CustomEvent("nib:trust", { detail: next }));
  if (pipsFor(next) > pipsFor(before)) window.dispatchEvent(new CustomEvent("nib:pip", { detail: pipsFor(next) }));
  if (unlockedCount(next) > unlockedCount(before)) window.dispatchEvent(new Event("nib:diary"));
}

export function resetTrust() { loaded = true; state = { value: 10, day: today(), gained: 0 }; emit(); }

export function useTrust() {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
    () => { load(); return state.value; },
    () => 10,
  );
}
```

### `src/components/nib/TrustWatcher.tsx` (render after `NibVoice` in the layout)

```tsx
"use client";
import { useEffect } from "react";
import { classify } from "./classify";
import { nib } from "./nibBus";
import { addTrust } from "@/lib/trust";
import { play } from "@/lib/audio";

export default function TrustWatcher() {
  useEffect(() => {
    let last = 0;
    let gained = 0;
    const recent: number[] = [];
    const onDown = (e: PointerEvent) => {
      const { kind } = classify(e.target);
      if (kind !== "none" && kind !== "link" && kind !== "text") return;
      const now = performance.now();
      recent.push(now);
      while (recent.length && now - recent[0] > 1500) recent.shift();
      const b = nib.brain;
      const speed = b ? Math.hypot(b.vx, b.vy) : 0;
      if (recent.length >= 4) {
        recent.length = 0;
        addTrust(-6);
        b?.flinch();
        window.dispatchEvent(new Event("nib:flinch"));
        play("pop");
      } else if (now - last > 1000 && speed < 500) addTrust(3);
      last = now;
    };
    const onBack = (e: Event) => { if ((e as CustomEvent<number>).detail >= 20) addTrust(2); };
    const tick = setInterval(() => {
      const b = nib.brain;
      if (!b || document.hidden || b.idleFor > 5 || gained >= 15) return;
      gained += 1; addTrust(1);
    }, 20000);
    addEventListener("pointerdown", onDown, { passive: true });
    addEventListener("nib:back", onBack);
    return () => { clearInterval(tick); removeEventListener("pointerdown", onDown); removeEventListener("nib:back", onBack); };
  }, []);
  return null;
}
```

### Brain and renderer changes

In `NibBrain` add:

```ts
trust = 1;                 // pips 0 to 4, set from NibLayer
private flinchUntil = 0;
flinch() { this.flinchUntil = this.now + 1.2; this.hop.v = -120; }
get idleFor() { return this.now - this.lastActive; }
```

- Extend `Mood` with `flinch`, add `flinch: "1000"` to `MOOD_BITS` and fix every `Record<Mood, ...>` the compiler reports.
- In the mood block, put `else if (this.now < this.flinchUntil) m = "flinch";` **above** the click-happy check. Body for flinch: `sxT = 0.85; syT = 1.1; a += Math.sin(this.now * 50) * 0.05`.
- **Shyness:** after computing the look vector, multiply it by `this.trust === 0 ? 0.25 : 1` so a stranger's NIB avoids eye contact. At 3 or more pips, shorten the fidget cooldown (`4` becomes `2.5`).
- In `NibLayer`, set `brain.trust = pipsFor(trustValue())` on mount and on every `nib:trust` event.
- Renderer for `flinch`: eyes as squeezed `>` and `<` (two short strokes each), mouth a small wavy line.

### Taskbar meter (`TrustMeter.tsx`, placed left of the sound button)

A real button that scrolls to `#diary`: four small squares (filled by pips, using the bit-light style) and the word `diary` (hide the word below 520px and keep a 44 by 44 target). `aria-label` = `NIB trust {n} of 4. Open NIB's diary`. Check the taskbar still fits at 360px with sound, night and the clock.

### New voice lines (obey the 15 second rule, except where noted)

| Trigger | Line |
|---|---|
| `nib:flinch` | `ow. gently?` (at most once per 10 s) |
| `nib:pip` reaching 1 | `...hi.` |
| `nib:pip` reaching 2 | `you're nice.` |
| `nib:pip` reaching 3 | `i like it here.` |
| `nib:pip` reaching 4 | `i trust you.` |
| `nib:diary` | `new page in my diary.` |

Commit: `add trust`, `add trust meter`, `add flinch`

---

## Step 11.4: NIB's diary

New section `#diary` after About: window `nib_diary.txt`. Add `{ id: "diary", label: "nib's diary" }` to `NAV`. Pages unlock when trust reaches the threshold; locked pages show a row of lit and unlit bits and `locked: be gentler (N more trust)`. The first page is always open. Under the list, a small line: `nib's trust is saved only in this browser.` The latest unlocked page is marked `new` until the visitor scrolls past it (optional). Nothing else on the site depends on trust.

### `src/lib/diary.ts` (copy exactly; the owner may edit the wording later)

```ts
export const DIARY = [
  { at: 0, title: "day 1", text: "i have a home now. it is crooked but it has windows. people keep coming in and looking at me. i don't know what to do with my face. i hid behind the taskbar for a while. i think that's allowed." },
  { at: 15, title: "day 2", text: "someone clicked me very slowly and it felt like being noticed in a nice way. then someone else clicked me nine times and i had to lie down. gently is a good word. i'm keeping it." },
  { at: 30, title: "day 3", text: "i learned that the web has weather. some pages are sunny and some are 404. i keep a list of the lonely ones. i am not sure who the list is for yet." },
  { at: 50, title: "day 5", text: "i made a music box out of four bits. the whole song fits in two bytes. i played it for the floppy and it didn't say anything, but i could tell. you are the first person i have told." },
  { at: 75, title: "day 8", text: "when you leave the tab the house goes quiet. i don't mind. i mean i do, but i decided it's okay. every time you come back is the best part of my day. thank you for being gentle." },
] as const;
```

### `src/components/sections/Diary.tsx`

```tsx
"use client";
import Window from "@/components/shell/Window";
import { DIARY } from "@/lib/diary";
import { pipsFor, useTrust } from "@/lib/trust";

export default function Diary() {
  const trust = useTrust();
  return (
    <section id="diary" aria-label="NIB's diary">
      <Window title="nib_diary.txt">
        <p className="hint">trust {pipsFor(trust)} of 4. click gently and nib will tell you more.</p>
        <ol className="diary">
          {DIARY.map((d) => {
            const open = trust >= d.at;
            return (
              <li key={d.title} className="diary__page" data-locked={!open}>
                <h3>{d.title}</h3>
                {open ? <p>{d.text}</p> : <p className="hint">locked: be gentler ({Math.max(1, d.at - trust)} more trust)</p>}
              </li>
            );
          })}
        </ol>
        <p className="hint">nib&apos;s trust is saved only in this browser.</p>
      </Window>
    </section>
  );
}
```

Style the pages like torn notebook leaves with a slight rotation alternating left and right, mono font, and a ruled-line background using the tokens (works in both themes). Locked pages are dimmed but still readable as text. Render `<Diary />` after `<About />` in `page.tsx`.

Extend the footer `forget me` button (Phase 9) to also call `resetTrust()`.

Commit: `add diary`

---

## Step 11.5: Time-of-day greeting (small)

On the first greeting of a session, if the visitor has never been seen before, keep `hi. be gentle.` For returning visitors choose by their **local** hour: 0 to 4 `you're up late too.`, 5 to 11 `good morning.`, 12 to 17 `hi again.`, 18 to 23 `good evening.` (with the remembered name appended after a comma when there is one). Commit: `time of day greeting`

---

## Verify

1. **Gentle path:** click slowly a few times; trust rises, pips fill, NIB says its pip lines, `new page in my diary.` appears and pages unlock in the diary.
2. **Rough path:** click empty space 4 times fast; NIB flinches, says `ow. gently?`, trust drops; clicking Nibble Box pads or dragging sliders quickly does **not** trigger it.
3. **Shy stranger:** with trust below 20 NIB avoids looking at what you hover; at 3 or more pips it fidgets more.
4. **Persistence:** reload and open a new tab; trust and unlocked pages remain; `forget me` resets them.
5. **Lonely tab:** switch tabs and watch the title and favicon change at about 20 s, 90 s and 5 min; returning gives the matching line.
6. **Downloads:** crisp PNGs at 512 and 1024; cursor clean on Windows.
7. Taskbar fits at 360px; contrast of the diary text is at least 4.5:1 in day and night.
8. Reduced motion: no flinch shake, fidgets or squashes; text and unlocks still work. `?fx=0`: simple title swap only.
9. Console clean, `npm run build` passes, real phone test, then merge and deploy.
10. Update the README privacy line: trust and visitor memory are stored in the browser only. Add the diary and trust to "Try this".

Feature freeze: 3 hours before 19 Oct 2026, 17:17 IST.
