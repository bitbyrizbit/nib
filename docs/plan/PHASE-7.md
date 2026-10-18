# PHASE 7: THE PREMIUM PASS (art direction, depth, first 10 seconds)

Branch: `premium`. Read `docs/plan/00-EXTRAS.md` first. Do Phase 8 before this one.

## Goal and why

Make the site feel designed, dimensional and alive in the first 10 seconds without WebGL: NIB is **born** on load, has real shading and a cast shadow, windows have depth and an active/inactive state like a real OS, the desktop has icons, and small finish details (grain, favicon, tab title) make it feel crafted. Most rubric weight (polish and early-web soul) is decided by this kind of detail.

I have not seen the live visuals, so after steps 7.1 to 7.3 send screenshots and I will give tuning notes. Do not add anything beyond this list.

## Step 7.0: Effects kill switch (do first)

In the theme script in `layout.tsx`, add:

```js
if (/[?&]fx=0\b/.test(location.search)) document.documentElement.dataset.fx = 'off';
```

All CSS in this phase is scoped under `html:not([data-fx="off"])`. In JS, check `document.documentElement.dataset.fx !== "off"` before starting any effect. Commit: `add effects switch`

## Step 7.1: NIB's birth (the first 10 seconds)

Concept: on page load, four blinking bits sit at the centre of the screen (the origin story, shown immediately). When the visitor first moves the mouse (or after 1.2 seconds on touch devices), the bits merge and **NIB hatches** with a squash, then flies to the pointer in under a second. The page is fully visible and usable throughout; nothing waits for it. Any click or key press skips it. Played once per browser session; skipped under reduced motion (NIB just appears).

### Bits element (DOM, `src/components/nib/BirthBits.tsx`)

```tsx
"use client";
import { useEffect, useState } from "react";

export default function BirthBits() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (document.documentElement.dataset.fx === "off") return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try { if (sessionStorage.getItem("nib:born")) return; } catch {}
    setShow(true);
    const hide = () => setShow(false);
    addEventListener("nib:hatched", hide, { once: true });
    return () => removeEventListener("nib:hatched", hide);
  }, []);
  if (!show) return null;
  return (
    <div className="birth" aria-hidden="true">
      <span /><span /><span /><span />
    </div>
  );
}
```

CSS: `.birth { position: fixed; left: 50%; top: 42%; transform: translate(-50%, -50%); display: flex; gap: 10px; z-index: 9000; pointer-events: none; }`, `.birth span { width: 22px; height: 22px; background: var(--nib); border: 2px solid var(--line); animation: blink 0.8s steps(2) infinite; }`, `.birth span:nth-child(odd) { animation-delay: 0.4s; }`, `@keyframes blink { 50% { opacity: 0.2; } }`. Render `<BirthBits />` in `layout.tsx` before `<NibLayer />`. The bits sit in the middle of the page without blocking anything (`pointer-events: none`).

### Brain changes (`nibBrain.ts`)

Add fields and a method:

```ts
private hatchT = -1;
private hatchFromX = 0;
private hatchFromY = 0;
firstMove = true;

hatch(fromX: number, fromY: number) {
  this.hatchT = 0; this.hatchFromX = fromX; this.hatchFromY = fromY;
  this.tipX = fromX; this.tipY = fromY;
  this.sx.x = 1.5; this.sy.x = 0.5; this.hop.v = -260;
}
skipHatch() { this.hatchT = -1; }
```

In `update`, replace the position block's first branch so hatching takes over:

```ts
if (this.hatchT >= 0) {
  this.hatchT += dt;
  const k = Math.min(1, this.hatchT / 0.9);
  const e = 1 - Math.pow(1 - k, 3);
  const dx = this.mode === "mouse" ? this.px : this.wx;
  const dy = this.mode === "mouse" ? this.py : this.wy;
  this.tipX = this.hatchFromX + (dx - this.hatchFromX) * e;
  this.tipY = this.hatchFromY + (dy - this.hatchFromY) * e;
  this.alpha = 1;
  if (k >= 1) { this.hatchT = -1; window.dispatchEvent(new Event("nib:hatched")); }
} else if (this.mode === "mouse") { /* existing mouse branch */ }
/* existing reduced and wander branches stay as else-ifs */
```

Rules: during the 0.9 second hatch the tip is allowed to animate (this is the only exception to the zero-lag tip rule). A click or key press calls `brain.skipHatch()` (tip snaps to the pointer immediately).

In `NibLayer.tsx`: on the first mouse `pointermove` when `brain.firstMove` is true and not reduced motion and not already born this session, set `firstMove = false`, call `brain.hatch(innerWidth / 2, innerHeight * 0.42)` and `sessionStorage.setItem("nib:born", "1")`. In touch mode call `hatch` once after 1.2 seconds. If reduced motion or `data-fx="off"`, never call `hatch` and dispatch `nib:hatched` immediately. Skip on `pointerdown` and `keydown`.

Commit: `add nib birth`

## Step 7.2: Shading and a cast shadow (depth without 3D)

In `nibRenderer.ts`, inside the transformed context (after `ctx.scale(...)`) **before** the body fill:

```ts
if (!night) {
  ctx.save();
  ctx.translate(2.6 + Math.max(0, -b.hop.x) * 0.02, 3.8 + Math.max(0, -b.hop.x) * 0.03);
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.beginPath();
  BODY.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath(); ctx.fill();
  ctx.restore();
}
```

Replace the flat `fillStyle = fill` with a gradient:

```ts
const grad = ctx.createLinearGradient(0, 0, 21, 31);
grad.addColorStop(0, night ? "#ffd98a" : "#ffe680");
grad.addColorStop(0.55, "#ffd23f");
grad.addColorStop(1, "#f2a900");
ctx.fillStyle = grad;
```

After the body stroke add a small specular highlight:

```ts
ctx.fillStyle = "rgba(255,255,255,0.55)";
ctx.beginPath(); ctx.ellipse(2.2, 7.5, 0.8, 3.4, -0.25, 0, Math.PI * 2); ctx.fill();
```

Keep the silhouette and eye positions unchanged. Check it still looks right at the smallest and largest squash values. Commit: `add nib shading`

## Step 7.3: Hero art direction and desktop feel

1. **The "i" arrow looks at NIB.** In `NibLayer`'s frame loop, every 100 ms compute the angle from the hero wordmark's arrow to NIB's tip and set `--look` on the arrow's SVG element only (`arrowEl.style.setProperty("--look", angle + "deg")`); the arrow uses `transform: rotate(var(--look, 0deg))`. Skip under reduced motion or fx off.
2. **Ticker strip** under the hero window: a thin bar with a slowly scrolling line `now loading nib ... 4 bits ok ... click gently ... small point, big ideas ...` (CSS `@keyframes` translateX, `aria-hidden`, paused under reduced motion). It must not cause horizontal scroll (`overflow: hidden` on the bar).
3. **Desktop icons** (1280px and wider only, hidden below): a fixed column on the left wallpaper margin with four real links drawn as small original pixel icons plus mono labels: `lost+found` to `#projects`, `nibble box` to `#nibble-box`, `guestbook` to `#guestbook`, `nib.txt` to `#about`. They are anchors (keyboard focusable, NIB reacts as curious). Make sure the ids exist and that the icons never overlap the main content area (`.main` max width leaves a margin; if the viewport is narrower than 1280, hide them).
4. **Active window state:** inactive windows use a muted title bar (`--plastic-lo` background, `--text-soft` text); the window containing focus or the pointer (`:focus-within` or `:hover`) uses the normal bar. This is CSS only and makes the page feel like an OS.

Commit: `add hero extras`, `add desktop icons`, `add window states`

## Step 7.4: Motion choreography and depth

1. **Windows pop open as they enter the viewport.** Hook `useReveal` adds `data-in="true"` via `IntersectionObserver` (threshold 0.15, once). CSS: windows start `opacity: 0; transform: translateY(12px) scale(0.98)` and animate with `steps(6)` over 260 ms (a pixel-y, retro feel) when `data-in` is set. Content must be visible without JavaScript or if the observer fails: apply the hidden start state only after the hook has run (add a `.js-reveal` class on mount). Under reduced motion or fx off, no animation and windows are visible immediately.
2. **Perspective tilt** on the project windows only (not the story caption, to keep text crisp): desktop with a fine pointer and no reduced motion. Max 3 degrees.

```tsx
"use client";
import { useEffect, type RefObject } from "react";

export function useTilt(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || document.documentElement.dataset.fx === "off") return;
    if (!matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--rx", `${(-y * 3).toFixed(2)}deg`);
        el.style.setProperty("--ry", `${(x * 3).toFixed(2)}deg`);
      });
    };
    const leave = () => { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => { cancelAnimationFrame(raf); el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); };
  }, [ref]);
}
```

   Add an optional `tilt` prop to `Window.tsx` that attaches a ref and calls `useTilt`, and CSS `.window--tilt { transform: perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); transition: transform 0.15s ease-out; }`. Do not tilt the guestbook window while an input inside it has focus. Check the text stays sharp; if it blurs on any browser, remove the tilt.
3. **Button press feel:** `.tb-btn:active { transform: translate(2px, 2px); }`.

Commit: `add window reveal`, `add window tilt`

## Step 7.5: Finish details

1. **Grain:** a static noise overlay (no animation, so no cost). Add to `globals.css`:

```css
html:not([data-fx="off"]) body::after {
  content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 9990; opacity: 0.06; mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
}
[data-theme="night"] body::after { mix-blend-mode: screen; opacity: 0.04; }
```

2. **Selection and scrollbar:** `::selection { background: var(--nib); color: #1c1b18; }` and a thin styled scrollbar (`scrollbar-width: thin; scrollbar-color: var(--line) var(--plastic);`).
3. **Tab title:** when the tab is hidden set `document.title = "come back? nib is lonely."`; restore the original when visible again.
4. **Favicon shows NIB's mood.** On each mood change (throttled to at most 4 times a second) draw a 32 by 32 canvas with NIB's arrow and eyes (open, half-closed when sleepy, closed when asleep, happy arcs when happy) and set `<link rel="icon">` to `canvas.toDataURL()`. Keep the static `public/favicon.svg` as the fallback and for the first paint. Subscribe through `nibBus`.
5. **Loading polish:** every loading, empty and error state in the guestbook and counter already exists; confirm each has NIB-voiced copy and a visible state at 360px.

Commit: `add grain`, `add tab title`, `add mood favicon`

## Verify

1. Hard refresh with a mouse: bits blink at centre, first mouse move hatches NIB (squash, then it flies to the pointer in under a second); clicking skips it; reload in the same tab does not replay it; a new tab does.
2. NIB has gradient shading, a highlight and a soft shadow; looks right while stretching, squashing and hopping.
3. The `i` arrow in the wordmark turns toward NIB.
4. Windows pop in once; project windows tilt gently; text stays crisp; guestbook does not tilt while typing.
5. `?fx=0` removes all of this (birth, tilt, reveal, grain, ticker motion) and the site still works.
6. Reduced motion: no birth, no tilt, no reveal, no ticker motion.
7. Phone: no horizontal scroll, desktop icons hidden, no jank, console clean, `npm run build` passes.
8. Send me screenshots (day, desktop and phone) for tuning before merging.
