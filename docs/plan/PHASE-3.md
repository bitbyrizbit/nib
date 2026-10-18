# PHASE 3: SOUND, THE NIBBLE BOX AND DELIGHT

Read `docs/BRIEF.md`, `docs/plan/00-OVERVIEW.md`. Phases 1 and 2 must be fully ticked first.

## What this phase delivers and why

This is the phase that turns a good site into a memorable one, and it ends with the site being **submittable**. It adds the shared audio engine with the required mute switch and click sounds (+3 points), the third project (**The Nibble Box**, the Tier 2 audio feature), the hidden Easter egg, NIB's short spoken lines, the falling-bits trail (+2 points), cosmetic growth from adopted objects, and the scroll-synced SVG journey route (the second Tier 2 feature).

## Prompt for this phase

```
Build Phase 3 from docs/plan/PHASE-3.md exactly. Reference code was written without being run: run npx tsc --noEmit and npm run lint and fix errors, telling me what you changed.
Audio rules: nothing plays before a user gesture, and the mute switch must silence every sound source including the Nibble Box and the Easter egg.
Commit after each numbered step with a plain lowercase message (no prefixes), then push. Do not start Phase 4.
Run the checklist at the end and say what you could not verify.
```

---

## Step 3.1: Audio engine, mute switch and click sounds

### Design

- One `AudioContext` and one master `GainNode`, created lazily **inside a user gesture**.
- Everything routes through master. `setMuted(true)` ramps master to 0 quickly and stops every live oscillator.
- Mute state persists in `localStorage` key `nib:muted`. Default is sound on, but nothing can play until the first gesture.
- Sounds are synthesised (no audio files, so no licences to credit beyond "Web Audio API").

### `src/lib/audio.ts`

```ts
"use client";
import { useSyncExternalStore } from "react";

const KEY = "nib:muted";
const VOLUME = 0.8;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;
const listeners = new Set<() => void>();
const live = new Set<AudioScheduledSourceNode>();

try { muted = localStorage.getItem(KEY) === "1"; } catch {}

export function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : VOLUME;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export const getTime = () => (ctx ? ctx.currentTime : 0);
export const isMuted = () => muted;

type ToneOpts = { type?: OscillatorType; gain?: number; to?: number };

function tone(freq: number, t0: number, dur: number, o: ToneOpts = {}) {
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = o.type ?? "square";
  osc.frequency.setValueAtTime(freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
  const peak = o.gain ?? 0.1;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
  live.add(osc);
  osc.onended = () => live.delete(osc);
}

export function pluckAt(freq: number, t: number) {
  if (muted || !ensure()) return;
  tone(freq, t, 1.1, { type: "sine", gain: 0.16 });
  tone(freq * 2, t, 0.45, { type: "sine", gain: 0.05 });
  tone(freq * 4.01, t, 0.1, { type: "triangle", gain: 0.03 });
}

export type Sfx = "click" | "yelp" | "adopt" | "pop";

export function play(name: Sfx) {
  if (muted) return;
  const c = ensure();
  if (!c) return;
  const t = c.currentTime;
  if (name === "click") tone(880, t, 0.05, { gain: 0.05, to: 440 });
  else if (name === "yelp") tone(620, t, 0.14, { gain: 0.07, to: 1240 });
  else if (name === "pop") tone(300, t, 0.1, { type: "triangle", gain: 0.1, to: 120 });
  else if (name === "adopt") { pluckAt(523.25, t); pluckAt(783.99, t + 0.12); }
}

const LULLABY = [659.25, 783.99, 880, 783.99, 659.25, 587.33, 523.25, 587.33, 659.25, 783.99, 659.25, 523.25];

export function playLullaby() {
  if (muted) return;
  const c = ensure();
  if (!c) return;
  const t = c.currentTime + 0.1;
  LULLABY.forEach((f, i) => pluckAt(f, t + i * 0.45));
}

export function stopAll() {
  live.forEach((s) => { try { s.stop(); } catch {} });
  live.clear();
}

export function setMuted(m: boolean) {
  muted = m;
  try { localStorage.setItem(KEY, m ? "1" : "0"); } catch {}
  if (ctx && master) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(m ? 0 : VOLUME, ctx.currentTime, 0.02);
  }
  if (m) stopAll();
  listeners.forEach((l) => l());
}

export function subscribeAudio(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; }
export function useMuted() { return useSyncExternalStore(subscribeAudio, () => muted, () => false); }
```

### `src/components/shell/MuteButton.tsx`

```tsx
"use client";
import { useEffect } from "react";
import { ensure, setMuted, useMuted } from "@/lib/audio";

export default function MuteButton() {
  const muted = useMuted();
  useEffect(() => {
    const unlock = () => { ensure(); };
    addEventListener("pointerdown", unlock, { once: true, passive: true });
    addEventListener("keydown", unlock, { once: true });
    return () => { removeEventListener("pointerdown", unlock); removeEventListener("keydown", unlock); };
  }, []);
  return (
    <button type="button" className="tb-btn" aria-pressed={!muted}
      aria-label={muted ? "Sound is off. Turn sound on" : "Sound is on. Turn sound off"}
      onClick={() => { ensure(); setMuted(!muted); }}>
      <span className="tb-led" aria-hidden="true" />
      sound
    </button>
  );
}
```

Add `<MuteButton />` into `Taskbar.tsx` between the spacer and the theme toggle. It must be visible at 360px width (if the taskbar overflows on small phones, shrink paddings and font size; do not hide it).

### `src/components/shell/SoundEffects.tsx`

```tsx
"use client";
import { useEffect } from "react";
import { classify } from "@/components/nib/classify";
import { play } from "@/lib/audio";

export default function SoundEffects() {
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const { kind } = classify(e.target);
      if (kind === "link") play("click");
      else if (kind === "disabled") play("pop");
      else if (kind === "none" && Math.random() < 0.25) play("yelp");
    };
    addEventListener("pointerdown", onDown, { passive: true });
    return () => removeEventListener("pointerdown", onDown);
  }, []);
  return null;
}
```

In `layout.tsx`, render after `{children}` in this order: `<NibLayer />`, `<NibVoice />` (step 3.4), `<SoundEffects />`. Also call `play("adopt")` inside the Lost & Found adopt handler (Phase 2) and dispatch the `nib:adopted` event on **reset** too (with detail `0`).

Commit: `add sound engine`, `add mute button`, `add click sounds`.

## Step 3.2: Project 3: The Nibble Box

### Concept

A 4-step music box. Each column is **one nibble (4 bits)**: four pads stacked, one per note of a pentatonic scale, and the column's hex digit (`0` to `F`) is shown above it. The whole pattern is 16 bits = **four hex digits**, for example `A5C3`. That pattern is the share code. It is the 4-bit motif made playable.

### Spec

- Notes (bottom bit to top bit): `C5 523.25`, `D5 587.33`, `E5 659.25`, `G5 783.99`.
- Controls (all real): `play/stop`, `clear`, `shake` (random pattern), `tempo` slider 60 to 180 bpm (keyboard operable, `<input type="range">`), `copy link`.
- Playhead highlights the current column. **Each step makes NIB bounce** (`nib.brain.hop.v = -90`).
- While muted: the play button is `disabled` with the label "unmute to play" (NIB pouts over it, which is correct).
- When muted mid-play, playback stops (listen to the audio store).
- Share link format: `/#box=A5C3`. On load, if `location.hash` starts with `#box=` followed by 4 hex digits, load that pattern and scroll the Nibble Box window into view.
- Pad buttons: `aria-pressed`, label like "step 2, note E, on". Minimum 44px touch targets.
- Scheduling uses a look-ahead timer (accurate), not `setInterval` per note.

### `src/components/projects/NibbleBox.tsx` (reference)

```tsx
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Window from "@/components/shell/Window";
import { ensure, getTime, pluckAt, subscribeAudio, isMuted, useMuted } from "@/lib/audio";
import { nib } from "@/components/nib/nibBus";

const NOTES = [523.25, 587.33, 659.25, 783.99];
const NAMES = ["C", "D", "E", "G"];
const LOOKAHEAD = 0.12;
const TICK = 25;

const toHex = (cols: number[]) => cols.map((n) => n.toString(16).toUpperCase()).join("");
const fromHex = (s: string) => s.split("").map((c) => parseInt(c, 16));

export default function NibbleBox() {
  const [cols, setCols] = useState<number[]>([9, 2, 5, 2]);
  const [bpm, setBpm] = useState(100);
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);
  const [msg, setMsg] = useState("");
  const muted = useMuted();

  const colsRef = useRef(cols);
  const bpmRef = useRef(bpm);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextTime = useRef(0);
  const nextStep = useRef(0);
  colsRef.current = cols;
  bpmRef.current = bpm;

  const stop = useCallback(() => {
    if (timer.current) { clearInterval(timer.current); timer.current = null; }
    setPlaying(false);
    setStep(-1);
  }, []);

  const start = useCallback(() => {
    const c = ensure();
    if (!c || isMuted()) return;
    nextStep.current = 0;
    nextTime.current = c.currentTime + 0.08;
    setPlaying(true);
    timer.current = setInterval(() => {
      while (nextTime.current < getTime() + LOOKAHEAD) {
        const i = nextStep.current;
        const t = nextTime.current;
        const value = colsRef.current[i];
        NOTES.forEach((f, bit) => { if (value & (1 << bit)) pluckAt(f, t); });
        const delayMs = Math.max(0, (t - getTime()) * 1000);
        setTimeout(() => {
          setStep(i);
          if (nib.brain) nib.brain.hop.v = -90;
        }, delayMs);
        nextTime.current += 60 / bpmRef.current / 2;
        nextStep.current = (i + 1) % 4;
      }
    }, TICK);
  }, []);

  useEffect(() => subscribeAudio(() => { if (isMuted()) stop(); }), [stop]);
  useEffect(() => stop, [stop]);
  useEffect(() => {
    const onHide = () => { if (document.hidden) stop(); };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [stop]);

  useEffect(() => {
    const m = location.hash.match(/^#box=([0-9a-fA-F]{4})$/);
    if (m) {
      setCols(fromHex(m[1]));
      document.getElementById("nibble-box")?.scrollIntoView({ block: "center" });
    }
  }, []);

  const toggle = (c: number, bit: number) =>
    setCols((prev) => prev.map((v, i) => (i === c ? v ^ (1 << bit) : v)));

  const copy = async () => {
    const url = `${location.origin}${location.pathname}#box=${toHex(cols)}`;
    try { await navigator.clipboard.writeText(url); setMsg("link copied"); }
    catch { setMsg(url); }
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <Window title="nibble_box.exe" id="nibble-box">
      <p>Four steps. Four bits each. Tap the pads to build a tune, then press play.</p>
      <div className="box" role="group" aria-label="Nibble Box pattern">
        {cols.map((value, c) => (
          <div key={c} className="box__col" data-active={step === c}>
            <div className="box__hex" aria-hidden="true">0x{value.toString(16).toUpperCase()}</div>
            {[3, 2, 1, 0].map((bit) => (
              <button key={bit} type="button" className="box__pad" aria-pressed={!!(value & (1 << bit))}
                aria-label={`Step ${c + 1}, note ${NAMES[bit]}, ${value & (1 << bit) ? "on" : "off"}`}
                onClick={() => toggle(c, bit)} />
            ))}
          </div>
        ))}
      </div>
      <p className="box__code" aria-live="polite">pattern 0x{toHex(cols)}</p>
      <div className="box__controls">
        <button type="button" className="tb-btn" disabled={muted} onClick={playing ? stop : start}>
          {muted ? "unmute to play" : playing ? "stop" : "play"}
        </button>
        <button type="button" className="tb-btn" onClick={() => setCols([0, 0, 0, 0])}>clear</button>
        <button type="button" className="tb-btn" onClick={() => setCols(Array.from({ length: 4 }, () => Math.floor(Math.random() * 16)))}>shake</button>
        <button type="button" className="tb-btn" onClick={copy}>copy link</button>
        <label className="box__tempo">tempo {bpm}
          <input type="range" min={60} max={180} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} />
        </label>
      </div>
      {msg && <p role="status" className="hint">{msg}</p>}
      <span className="stamp">made by nib · 16 bits</span>
    </Window>
  );
}
```

Styling rules (add to `globals.css`): `.box { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--s3); }`, `.box__col { display: grid; gap: var(--s2); padding: var(--s2); border: 2px solid var(--line); }`, `.box__col[data-active="true"] { background: var(--nib); }`, `.box__pad { min-height: 52px; border: 2px solid var(--line); background: var(--plastic); }`, `.box__pad[aria-pressed="true"] { background: var(--signal); }`, `.box__hex` in the mono font. `.stamp` is small mono text bottom-right. Add the Nibble Box to the Projects layout (third window) and add `{ id: "nibble-box", label: "nibble box" }` to `NAV`.

Commit: `add nibble box`, `add box sharing`.

## Step 3.3: The hidden Easter egg

### Behaviour

The "Hello, my name is NIB" sticker on the hero becomes a real button. Four clicks (or four Enter presses) with no more than 2 seconds between clicks open a hidden window: NIB's first-ever message from the day it was born, bits raining down, and the lullaby playing (silent when muted). The sticker is a `<button>` so keyboard users can find it. Do not advertise it anywhere on the page.

### Copy (use exactly)

```
hello? is anyone there?
...
i think i am a thing now.
- nib, 0101

Half a byte. Whole lot of world.
```

### `src/components/sections/EggSticker.tsx`

```tsx
"use client";
import { useRef, useState } from "react";
import EggModal from "@/components/ui/EggModal";

export default function EggSticker() {
  const count = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [n, setN] = useState(0);
  const [open, setOpen] = useState(false);

  const onClick = () => {
    count.current += 1;
    setN(count.current);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { count.current = 0; setN(0); }, 2000);
    if (count.current >= 4) {
      count.current = 0; setN(0);
      setOpen(true);
      try { localStorage.setItem("nib:egg", "1"); } catch {}
      window.dispatchEvent(new CustomEvent("nib:egg"));
    }
  };

  return (
    <>
      <button type="button" className="sticker" data-sticker style={{ transform: `rotate(${-3 + n * 2}deg)` }} onClick={onClick}>
        Hello, my name is NIB
      </button>
      <EggModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
```

Replace the sticker `<div>` in `Hero.tsx` with `<EggSticker />`.

### `src/components/ui/EggModal.tsx`

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { playLullaby, stopAll } from "@/lib/audio";

export default function EggModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [bits, setBits] = useState<{ ch: string; left: number; delay: number }[]>([]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      playLullaby();
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setBits(Array.from({ length: 28 }, () => ({ ch: Math.random() < 0.5 ? "0" : "1", left: Math.random() * 100, delay: Math.random() * 2.5 })));
      }
    }
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog ref={ref} className="egg" aria-labelledby="egg-title" onClose={() => { stopAll(); setBits([]); onClose(); }}>
      <div className="egg__rain" aria-hidden="true">
        {bits.map((b, i) => <span key={i} style={{ left: `${b.left}%`, animationDelay: `${b.delay}s` }}>{b.ch}</span>)}
      </div>
      <h2 id="egg-title">bit flipped</h2>
      <p>hello? is anyone there?</p>
      <p>...</p>
      <p>i think i am a thing now.</p>
      <p>- nib, 0101</p>
      <p className="hint">Half a byte. Whole lot of world.</p>
      <button type="button" className="tb-btn" autoFocus onClick={() => ref.current?.close()}>close</button>
    </dialog>
  );
}
```

Styling rules: `.egg` is a window-styled dialog (same bevel and hard shadow), `.egg::backdrop { background: rgba(0,0,0,0.6); }`, `.egg__rain span { position: absolute; top: -1em; font-family: var(--font-mono); color: var(--phosphor); animation: fall 3s linear forwards; }` with `@keyframes fall { to { transform: translateY(110%); } }`. Closing with `Esc` must work (native dialog does this). Closing stops the lullaby.

Commit: `add easter egg`.

## Step 3.4: NIB's voice

Short sincere lines in a small bubble next to NIB. Rules: never on every hover, **at most one line every 15 seconds**, each mood line is said at most once per session, it carries no essential information, and the bubble is `aria-hidden`.

### Lines (use exactly)

| Trigger | Line |
|---|---|
| 2.5 s after load | hi. be gentle. |
| first time it gets curious | oh! a link |
| first time it reads | reading is hard. i'm trying. |
| first time it pouts | that one's not for me. |
| first time it falls asleep | zzz |
| waking from sleep | i'm up! i'm up. |
| adopting an object (count above 0) | i made a friend. |
| Easter egg found (bypasses the 15 s limit) | you found it. |

### `src/components/nib/NibVoice.tsx`

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { nib, nibBus } from "./nibBus";
import type { Mood } from "./nibBrain";

const LINES: Partial<Record<Mood, string>> = {
  curious: "oh! a link", read: "reading is hard. i'm trying.", pout: "that one's not for me.", asleep: "zzz",
};

export default function NibVoice() {
  const el = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    let lastSaid = -99;
    let hide: ReturnType<typeof setTimeout> | undefined;
    let raf = 0;
    const seen = new Set<Mood>();
    const say = (t: string, force = false) => {
      const now = performance.now() / 1000;
      if (!force && now - lastSaid < 15) return;
      lastSaid = now;
      setText(t);
      clearTimeout(hide);
      hide = setTimeout(() => setText(""), 2400);
    };
    const unsub = nibBus.subscribe(() => {
      const m = nibBus.get();
      const line = LINES[m];
      if (line && !seen.has(m)) { seen.add(m); say(line); }
    });
    if (nib.brain) nib.brain.onWake = () => say("i'm up! i'm up.");
    const onAdopt = (e: Event) => { if ((e as CustomEvent<number>).detail > 0) say("i made a friend."); };
    const onEgg = () => say("you found it.", true);
    addEventListener("nib:adopted", onAdopt);
    addEventListener("nib:egg", onEgg);
    const hi = setTimeout(() => say("hi. be gentle."), 2500);
    const follow = () => {
      raf = requestAnimationFrame(follow);
      const b = nib.brain, e = el.current;
      if (!b || !e) return;
      e.style.transform = `translate(${Math.min(b.tipX + 34, innerWidth - 220)}px, ${Math.max(b.tipY - 40, 8)}px)`;
      e.style.opacity = text ? String(b.alpha) : "0";
    };
    follow();
    return () => {
      unsub(); clearTimeout(hi); clearTimeout(hide); cancelAnimationFrame(raf);
      removeEventListener("nib:adopted", onAdopt); removeEventListener("nib:egg", onEgg);
      if (nib.brain) nib.brain.onWake = null;
    };
  }, [text]);

  return <div ref={el} className="voice" aria-hidden="true">{text}</div>;
}
```

Style: `.voice { position: fixed; top: 0; left: 0; z-index: 9998; pointer-events: none; max-width: 200px; padding: 4px 10px; background: var(--plastic-hi); color: #1c1b18; border: 2px solid var(--line); font-family: var(--font-mono); font-size: 20px; opacity: 0; }`. Make sure `NibVoice` renders **after** `NibLayer` in the layout so `nib.brain` exists when its effect runs. If the effect re-runs because of `text`, the `seen` set resets: move `seen` into a `useRef<Set<Mood>>(new Set())` outside the effect so lines are still once per session (fix this while pasting).

Commit: `add nib voice`.

## Step 3.5: Bit trail and cosmetics

### Trail (+2 points, "sparkle cursor trail")

Falling `0` and `1` glyphs behind NIB when the pointer moves fast. Mouse mode only, off for reduced motion, capped at 60 particles. Add to `NibBrain`:

```ts
export type Particle = { x: number; y: number; vy: number; life: number; ch: string };

// inside class NibBrain
particles: Particle[] = [];
bow = false;
trailPink = false;
private lastSpawn = 0;

// inside update(), right after the velocity lines and before the mood block
const speed = Math.hypot(this.vx, this.vy);
if (!this.reduced && this.mode === "mouse" && this.alpha > 0.5 && speed > 600 && this.now - this.lastSpawn > 0.04 && this.particles.length < 60) {
  this.lastSpawn = this.now;
  this.particles.push({ x: this.tipX + (Math.random() - 0.5) * 12, y: this.tipY + (Math.random() - 0.5) * 12, vy: 30 + Math.random() * 50, life: 0.9, ch: Math.random() < 0.5 ? "0" : "1" });
}
for (const p of this.particles) { p.y += p.vy * dt; p.life -= dt; }
this.particles = this.particles.filter((p) => p.life > 0);
```

Draw in `drawNib`, at the very start, before the early return on alpha (so fading particles finish):

```ts
if (b.particles.length) {
  ctx.save();
  ctx.font = "18px VT323, monospace";
  for (const p of b.particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = b.trailPink ? "#ff4fa3" : b.night ? "#7dffb0" : "#1c1b18";
    ctx.fillText(p.ch, p.x, p.y);
  }
  ctx.restore();
}
```

### Cosmetics from adopted objects (visitors help NIB grow)

Cosmetic only, never blocks navigation. 3 adopted: NIB's tail wears a small red bow. 6 adopted: the trail turns pink. Draw the bow after the tail in `drawNib` when `b.bow` is true: two small triangles and a knot at the last tail point, in `#e8412f` with the line colour outline. In `NibLayer`, read `nib:adopted` with `loadJSON<string[]>("nib:adopted", [])` on mount and on the `nib:adopted` window event (including resets) and set `brain.bow = n >= 3; brain.trailPink = n >= 6`.

Commit: `add bit trail`, `add nib bow`.

## Step 3.6: Scroll-synced journey route (second Tier 2 feature)

A thin SVG route above the story stage that draws itself as you scroll, with a tiny NIB travelling along it and five stop markers (one per scene). Extend `useSceneProgress` so it also returns the overall progress `p` (store it in the same state object).

### `src/components/sections/StoryRoute.tsx`

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import NibSvg from "@/components/nib/NibSvg";

const D = "M20 50 C 120 10, 200 90, 300 50 S 480 10, 580 50 S 760 90, 860 50 S 960 30, 980 50";

export default function StoryRoute({ p, scenes }: { p: number; scenes: number }) {
  const path = useRef<SVGPathElement>(null);
  const [pt, setPt] = useState({ x: 20, y: 50 });
  const [marks, setMarks] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const el = path.current;
    if (!el) return;
    const len = el.getTotalLength();
    setMarks(Array.from({ length: scenes }, (_, i) => { const q = el.getPointAtLength((len * (i + 0.5)) / scenes); return { x: q.x, y: q.y }; }));
  }, [scenes]);

  useEffect(() => {
    const el = path.current;
    if (!el) return;
    const q = el.getPointAtLength(el.getTotalLength() * p);
    setPt({ x: q.x, y: q.y });
  }, [p]);

  return (
    <svg viewBox="0 0 1000 100" className="route" role="img" aria-label={`Journey progress, scene ${Math.min(scenes, Math.floor(p * scenes) + 1)} of ${scenes}`}>
      <path d={D} fill="none" stroke="var(--line)" strokeWidth="2" strokeDasharray="4 6" opacity="0.4" />
      <path ref={path} d={D} fill="none" stroke="var(--signal)" strokeWidth="4" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} />
      {marks.map((m, i) => <circle key={i} cx={m.x} cy={m.y} r="6" fill={p * scenes > i ? "var(--nib)" : "var(--plastic)"} stroke="var(--line)" strokeWidth="2" />)}
      <NibSvg size={30} x={pt.x - 2} y={pt.y - 2} />
    </svg>
  );
}
```

Place `<StoryRoute p={p} scenes={SCENES.length} />` at the top of the sticky stage (it spans the full width; keep it under 80px tall). Verify at 360px width that it stays readable.

Commit: `add story route`.

## Step 3.7: Verify and deploy (the site is now submittable)

1. First pointer click anywhere unlocks audio; no sound before the first click.
2. Clicking a link or button gives a tiny blip; clicking empty space sometimes gives a yelp; clicking a disabled control gives a soft pop.
3. **Mute:** turn sound off during Nibble Box playback; playback stops instantly. Reload: the mute state persists. While muted, nothing makes any sound (check the Easter egg and adopt too).
4. Nibble Box: play, edit pads while playing, tempo slider, clear, shake, copy link, then open the copied `/#box=XXXX` link in a new tab and see the same pattern.
5. Easter egg: four quick clicks on the sticker (and four Enter presses by keyboard) open the dialog; `Esc` closes it; lullaby stops on close.
6. NIB's lines never appear more than once every 15 seconds.
7. Fast mouse movement leaves falling bits; reduced motion leaves none.
8. Adopt 3 objects: bow appears. Adopt 6: pink trail. Reset: both disappear.
9. Story route fills as you scroll and the markers fill in order.
10. On a **real phone**: audio works after a tap (iOS needs the first tap), taskbar fits with the sound button visible, Nibble Box pads are easy to tap.
11. Console clean. `npm run build` passes. Push, confirm the Vercel deploy, retest the live URL.

Update `README.md` (story, features, how to run) and `CREDITS.md` (add "Audio: synthesised in-browser with the Web Audio API, no samples"). Commit: `update readme and credits`.

## Phase 3 checklist

- [ ] Sound only after a gesture; mute switch visible at all widths and silences everything
- [ ] Click sounds work (and respect mute)
- [ ] Nibble Box works end to end with shareable `#box=` links; NIB bounces on the beat
- [ ] Easter egg works by mouse, touch and keyboard, closes cleanly, respects mute
- [ ] NIB voice lines obey the 15 second rule
- [ ] Trail, bow and pink trail work and are off under reduced motion
- [ ] Story route animates with scroll
- [ ] 3 working projects now exist; site is deployed and passes the live phone test
- [ ] Zero console errors; commits plain, lowercase, pushed
