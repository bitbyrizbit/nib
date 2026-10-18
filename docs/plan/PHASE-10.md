# PHASE 10: FIXES FROM REAL SCREENSHOTS AND A HERO UPGRADE

Branch: `fixes`. Read `docs/BRIEF.md` and `docs/plan/00-EXTRAS.md` first. Do steps 10.1 to 10.3 first (they are bugs), then 10.4, then 10.5. Step 10.6 is optional.

## Why

Screenshots of the live site show: (1) modal windows hide NIB, (2) the "take nib home" preview renders a cropped yellow triangle, (3) the speech bubble is dark text on a dark box at night, (4) the tail is a straight stick, (5) the right half of the hero is empty so the character is not introduced clearly. Fix in this order.

## Prompt

```
Do Phase 10 from docs/plan/PHASE-10.md in order. Reference code was written without being run: run npx tsc --noEmit and npm run lint, fix errors and tell me what you changed.
Do not change the locked cursor rules. Commit after each step with a plain lowercase message (no prefixes) and push. Report what you could not test.
```

---

## Step 10.1: Modals must not hide NIB (critical)

### Cause

`EggModal` and `DialDialog` use native `<dialog>` with `showModal()`. That puts them in the browser's top layer, above NIB's canvas (z-index 9999), so NIB (and the hidden native cursor) vanish. The fix: replace native modals with a normal fixed-position modal at z-index **below** NIB's layer (backdrop 9300, NIB canvas 9999, voice bubble 9998).

### `src/components/ui/Modal.tsx`

It renders through a portal into `document.body`. This is required, because the focus lock below sets `inert` on `<main>` and the taskbar, and a modal rendered inside `<main>` would become inert too.

```tsx
"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

type Props = { open: boolean; onClose: () => void; labelledBy: string; className?: string; children: ReactNode };

export default function Modal({ open, onClose, labelledBy, className = "", children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const root = ref.current;
    if (!root) return;
    const previous = document.activeElement as HTMLElement | null;
    const inert = [document.querySelector("main"), document.querySelector(".taskbar")].filter(Boolean) as Element[];
    inert.forEach((el) => el.setAttribute("inert", ""));
    const items = () =>
      Array.from(root.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])'));
    (items()[0] ?? root).focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); closeRef.current(); return; }
      if (e.key !== "Tab") return;
      const f = items();
      if (!f.length) { e.preventDefault(); return; }
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      inert.forEach((el) => el.removeAttribute("inert"));
      previous?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div className="modal-backdrop" onPointerDown={(e) => { if (e.target === e.currentTarget) closeRef.current(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={labelledBy} tabIndex={-1} className={`modal ${className}`}>
        {children}
      </div>
    </div>,
    document.body,
  );
}
```

### CSS (add to `globals.css`)

```css
.modal-backdrop { position: fixed; inset: 0; z-index: 9300; display: grid; place-items: center; padding: 16px; background: rgba(0, 0, 0, 0.6); }
.modal { position: relative; width: min(92vw, 520px); max-height: 90dvh; overflow: auto; background: var(--plastic); color: var(--text); border: 2px solid var(--line); box-shadow: inset -2px -2px 0 var(--plastic-lo), inset 2px 2px 0 var(--plastic-hi), 6px 6px 0 var(--shadow-c); padding: var(--s5); }
```

### Refactor the two dialogs

- **`EggModal.tsx`:** replace the `<dialog>` and its `showModal()`/`close()` logic with `<Modal open={open} onClose={handleClose} labelledBy="egg-title" className="egg">`. Move the side effects into an effect on `open`: when it becomes true call `playLullaby()` and generate the bit rain (skip rain under reduced motion); in `handleClose` call `stopAll()`, clear the rain and then `onClose()`. Keep the existing copy and the `close` button. Keep `.egg__rain` styles; make `.egg` `position: relative; overflow: hidden`.
- **`DialDialog.tsx`:** same pattern with `labelledBy="dial-title"`; on open start the sound and the timers, on close `stopAll()` and clear timers.
- Search for any other `<dialog` or `showModal` in `src` and convert them too (`Select-String -Path src -Pattern "showModal|<dialog" -Recurse`).

### Verify

NIB (and its glow and voice bubble) is **visible and moving above** both the Easter egg window and the dial-up window; the backdrop click, `Esc` and the close button all close them; Tab stays inside the modal; focus returns to the button that opened it; sound stops on close; at night the same. Commit: `fix modal layers`

## Step 10.2: Fix the "take nib home" preview

The preview shows a cropped yellow triangle. The `<svg>` it uses has no `viewBox`, so only the top-left of a scaled shape is visible. Create a dedicated component and use it in the window instead of `NibSvg`:

```tsx
import { BODY } from "@/components/nib/nibShape";

export default function NibPortrait({ size = 120 }: { size?: number }) {
  const pts = BODY.map(([x, y]) => `${x + 1},${y + 1}`).join(" ");
  return (
    <svg viewBox="0 0 24 34" width={size} height={Math.round((size * 34) / 24)} role="img" aria-label="NIB, a baby cursor">
      <polygon points={pts} fill="#ffd23f" stroke="#1c1b18" strokeWidth="1.5" strokeLinejoin="round" />
      <g stroke="#1c1b18" strokeWidth="0.8">
        <circle cx="5.4" cy="13" r="2.2" fill="#fff" />
        <circle cx="10.2" cy="14.3" r="2.2" fill="#fff" />
      </g>
      <circle cx="5.4" cy="13" r="1" fill="#1c1b18" />
      <circle cx="10.2" cy="14.3" r="1" fill="#1c1b18" />
      <path d="M6.8 17.6 Q7.8 18.7 8.8 17.6" fill="none" stroke="#1c1b18" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}
```

Also check where else `NibSvg` is used (story scenes, the route) and confirm each one has a `viewBox` or sits inside an `<svg viewBox>`. Then download the SVG and PNG and open them to confirm they show the full arrow with eyes. Commit: `fix nib preview`

## Step 10.3: Speech bubble readable in both themes

In `globals.css` set the bubble to the theme tokens:

```css
.voice { background: var(--plastic-hi); color: var(--text); border: 2px solid var(--line); }
```

Verify: day (dark text on cream) and night (amber text on brown) both read clearly. Commit: `fix bubble colors`

## Step 10.4: A real tail (short, tapered, curled)

Replace `updateTail` and tune the tail constants in `nibBrain.ts` so the tail rests in a gentle curl and swings when NIB moves (instead of hanging straight). Keep using whichever scale value the file already uses (`S` or `this.scale`).

```ts
const TAIL_N = 7;
const TAIL_L = 5.5;

private updateTail(dt: number, still: boolean) {
  const a = this.angle.x, sx = S * this.sx.x, sy = S * this.sy.x;
  const rx = this.tipX + Math.cos(a) * REAR.x * sx - Math.sin(a) * REAR.y * sy;
  const ry = this.tipY + this.hop.x + Math.sin(a) * REAR.x * sx + Math.cos(a) * REAR.y * sy;

  const rest: { x: number; y: number }[] = [{ x: rx, y: ry }];
  let cx = rx, cy = ry;
  for (let i = 1; i < TAIL_N; i++) {
    const ang = a + 1.25 - i * 0.34;
    cx += Math.cos(ang) * TAIL_L;
    cy += Math.sin(ang) * TAIL_L;
    rest.push({ x: cx, y: cy });
  }
  if (this.tail.length === 0) rest.forEach((p) => this.tail.push({ x: p.x, y: p.y, px: p.x, py: p.y }));
  this.tail[0].x = rx; this.tail[0].y = ry;

  if (still) {
    for (let i = 1; i < TAIL_N; i++) { const p = this.tail[i]; p.x = rest[i].x; p.y = rest[i].y; p.px = p.x; p.py = p.y; }
    return;
  }
  const g = (this.mood === "asleep" ? 900 : 120) * dt * dt;
  const pull = this.mood === "asleep" ? 0.03 : 0.12;
  for (let i = 1; i < TAIL_N; i++) {
    const p = this.tail[i];
    const vx = (p.x - p.px) * 0.9, vy = (p.y - p.py) * 0.9;
    p.px = p.x; p.py = p.y;
    p.x += vx + (rest[i].x - p.x) * pull;
    p.y += vy + (rest[i].y - p.y) * pull + g;
  }
  for (let it = 0; it < 2; it++) {
    for (let i = 1; i < TAIL_N; i++) {
      const a0 = this.tail[i - 1], b0 = this.tail[i];
      const dx = b0.x - a0.x, dy = b0.y - a0.y, d = Math.hypot(dx, dy) || 1;
      const k = (d - TAIL_L) / d;
      b0.x -= dx * k; b0.y -= dy * k;
    }
  }
}
```

In `nibRenderer.ts` replace the single tail stroke with a tapered one (outlines first, then fills, so segments do not overdraw each other):

```ts
const n = b.tail.length;
if (n > 1) {
  ctx.strokeStyle = line;
  for (let i = 1; i < n; i++) {
    ctx.beginPath(); ctx.moveTo(b.tail[i - 1].x, b.tail[i - 1].y); ctx.lineTo(b.tail[i].x, b.tail[i].y);
    ctx.lineWidth = 3 + 5 * (1 - i / n); ctx.stroke();
  }
  ctx.strokeStyle = fill;
  for (let i = 1; i < n; i++) {
    ctx.beginPath(); ctx.moveTo(b.tail[i - 1].x, b.tail[i - 1].y); ctx.lineTo(b.tail[i].x, b.tail[i].y);
    ctx.lineWidth = 1.2 + 3.2 * (1 - i / n); ctx.stroke();
  }
}
```

Verify: at rest the tail is a small curl; moving fast makes it swing and settle; asleep it droops; no straight pole; the cursor tip and click behaviour are unchanged. Re-run the Phase 1 NIB checks. Commit: `new nib tail`

## Step 10.5: Hero portrait (introduce the character at a glance)

### Why

The hero's right half is empty and the live NIB is small, so a judge cannot see what the character is in the first seconds. Add a large framed "ID photo" of NIB. Its eyes follow the pointer, it bobs, and clicking it squishes and yelps. It is a separate illustration of the same character; the caption frames it so it is clearly intentional: `nib_id.bmp · NIB, age 4 bits`.

### `src/components/sections/HeroNib.tsx`

```tsx
"use client";
import { useEffect, useRef } from "react";
import { BODY } from "@/components/nib/nibShape";
import { play } from "@/lib/audio";

export default function HeroNib() {
  const svg = useRef<SVGSVGElement>(null);
  const pupils = useRef<SVGGElement>(null);
  const body = useRef<SVGGElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.fx === "off") return;
    const move = (e: PointerEvent) => {
      const s = svg.current, p = pupils.current;
      if (!s || !p) return;
      const r = s.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width * 0.3);
      const dy = e.clientY - (r.top + r.height * 0.4);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 300);
      p.setAttribute("transform", `translate(${((dx / d) * 0.9 * k).toFixed(2)} ${((dy / d) * 0.9 * k).toFixed(2)})`);
    };
    addEventListener("pointermove", move, { passive: true });
    return () => removeEventListener("pointermove", move);
  }, []);

  const squish = () => {
    play("yelp");
    const g = body.current;
    if (!g) return;
    g.classList.remove("hero-nib__squish");
    void g.getBoundingClientRect();
    g.classList.add("hero-nib__squish");
  };

  const pts = BODY.map(([x, y]) => `${x + 1},${y + 1}`).join(" ");
  return (
    <figure className="hero__photo">
      <button type="button" className="hero-nib" onClick={squish} aria-label="Say hi to NIB">
        <svg ref={svg} viewBox="-4 -2 32 42" aria-hidden="true">
          <defs>
            <linearGradient id="hn-fill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffe680" /><stop offset="0.55" stopColor="#ffd23f" /><stop offset="1" stopColor="#f2a900" />
            </linearGradient>
          </defs>
          <ellipse cx="12" cy="36.5" rx="9" ry="1.6" fill="rgba(0,0,0,0.18)" />
          <g ref={body} className="hero-nib__body">
            <polygon points={pts} fill="url(#hn-fill)" stroke="#1c1b18" strokeWidth="1.5" strokeLinejoin="round" />
            <ellipse cx="3.2" cy="9" rx="0.8" ry="3.4" fill="rgba(255,255,255,0.55)" transform="rotate(-14 3.2 9)" />
            <circle cx="3.6" cy="16.4" r="1.1" fill="rgba(232,65,47,0.55)" />
            <circle cx="11.6" cy="17.6" r="1.1" fill="rgba(232,65,47,0.55)" />
            <g stroke="#1c1b18" strokeWidth="0.8">
              <circle cx="5.4" cy="13" r="2.5" fill="#fff" />
              <circle cx="10.2" cy="14.3" r="2.5" fill="#fff" />
            </g>
            <g ref={pupils}>
              <circle cx="5.4" cy="13" r="1.3" fill="#1c1b18" /><circle cx="10.2" cy="14.3" r="1.3" fill="#1c1b18" />
              <circle cx="5" cy="12.5" r="0.45" fill="#fff" /><circle cx="9.8" cy="13.8" r="0.45" fill="#fff" />
            </g>
            <path d="M6.6 17.8 Q7.8 19.2 9 17.8" fill="none" stroke="#1c1b18" strokeWidth="0.8" strokeLinecap="round" />
          </g>
        </svg>
      </button>
      <figcaption className="hint">nib_id.bmp · NIB, age 4 bits</figcaption>
    </figure>
  );
}
```

### Layout and CSS

In `Hero.tsx` wrap the existing text content in a `<div className="hero__text">` and add `<HeroNib />` as a sibling. Change `.hero` to a two-column grid from 900px up:

```css
.hero { display: grid; gap: var(--s5); }
@media (min-width: 900px) { .hero { grid-template-columns: 1.25fr 0.9fr; align-items: center; } }
.hero__photo { margin: 0; display: grid; justify-items: center; gap: var(--s2); padding: var(--s5); border: 2px solid var(--line); background: var(--wallpaper); box-shadow: inset 0 0 0 4px var(--plastic-hi), 6px 6px 0 var(--shadow-c); }
.hero-nib { background: none; border: 0; padding: 0; line-height: 0; }
.hero-nib svg { width: min(240px, 52vw); height: auto; overflow: visible; animation: nib-bob 3.2s ease-in-out infinite; }
.hero-nib__body { transform-box: fill-box; transform-origin: 0 0; }
.hero-nib__squish { animation: nib-squish 0.5s ease-out; }
@keyframes nib-bob { 50% { transform: translateY(-6px); } }
@keyframes nib-squish { 25% { transform: scale(1.18, 0.78); } 55% { transform: scale(0.92, 1.12); } }
html[data-fx="off"] .hero-nib svg { animation: none; }
```

On phones the portrait sits below the text at a smaller size. At night the same colours work through the tokens. Under reduced motion the global rule removes the bob and squish, and the eyes stay centred (the effect returns early).

Verify: the right half of the hero is filled; eyes track the pointer; clicking squishes and yelps (silent when muted); keyboard Tab reaches it and Enter works; the layout does not overflow at 360px; NIB's cursor can still pass over it as a link. Commit: `add hero portrait`

## Step 10.6 (optional, only if time): bigger, cuter eyes on the cursor NIB

In `nibShape.ts` set `EYE_R = 2.7` and `EYES = [{ x: 4.2, y: 11.5 }, { x: 9.6, y: 13 }]`; in `nibRenderer.ts` make the pupil radius `1.5` (`1.8` when curious) and add a white glint (`r = 0.5`) at the pupil's upper-left. Keep both eyes inside the head at every squash value, and keep the Take-home SVG, `NibPortrait`, the story `NibSvg` and the favicon consistent with the cursor (search for `4.4` and `13.3`, the old positions). Commit: `bigger nib eyes`

---

## Final checks for this phase

1. Both modals show NIB moving above them; Esc, backdrop and close all work; focus lock works.
2. Take-home preview and downloaded SVG and PNG show the whole arrow with eyes.
3. Bubble readable in day and night.
4. Tail is a small tapered curl; swings and settles; droops asleep.
5. Hero fills both columns on desktop and stacks cleanly on a phone; click and eye-follow work.
6. Re-run the Phase 1 checklist (tip under pointer, click timing, reduced motion, touch mode, keyboard), console clean, `npm run build` passes, real phone check, then merge, deploy and send me new screenshots.

Remember the feature freeze: 3 hours before 19 Oct 2026, 17:17 IST.
