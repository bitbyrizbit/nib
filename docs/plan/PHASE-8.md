# PHASE 8: NIGHTLIGHT (the night mode rebuilt)

Branch: `nightlight`. Read `docs/plan/00-EXTRAS.md` first.

## Goal and why

The old night mode swapped colours and looked flat. The new one is a **dark room lit by NIB**: warm amber palette, NIB glows like a nightlight, the page brightens around it, and hidden drawings and messages appear only inside its light. This keeps the Tier 1 mood toggle, adds the Tier 2 "flashlight or nightlight cursor illuminating dark layers", and gives judges a "wait, that's clever" moment in the first 5 seconds after toggling.

Day mode must not change at all.

## Step 8.1: New night tokens

In `src/app/tokens.css` replace the whole `[data-theme="night"]` block with:

```css
[data-theme="night"] {
  --ink: #0f0b07;
  --line: #ffb347;
  --plastic: #261c14;
  --plastic-hi: #3a2b1e;
  --plastic-lo: #150f0a;
  --wallpaper: #120d09;
  --dither: rgba(255, 179, 71, 0.08);
  --signal: #ff5e9c;
  --phosphor: #ffb347;
  --title-bg: #ffb347;
  --title-fg: #1a1109;
  --text: #ffe3b8;
  --text-soft: #d8b98c;
  --shadow-c: #000000;
}
```

Then replace every hard-coded old night colour in the code. Find them:

```powershell
Select-String -Path src -Pattern "7dffb0|0a0d1c|1b2036|2c3354" -Recurse
```

Replace `#7dffb0` with `#ffb347` and `#0a0d1c` with `#0f0b07` in `nibRenderer.ts` (night outline, shadow glow, zZ colour), in the bit particles, in the Odometer cell colour, and anywhere else the search finds. Do not leave any green or navy.

Contrast targets (verify with a contrast checker, do not assume): `--text` on `--plastic` at least 7:1, `--text-soft` on `--plastic` at least 4.5:1, `--signal` on `--plastic` at least 4.5:1, `--title-fg` on `--title-bg` at least 7:1. If one fails, adjust that colour only.

Commit: `new night colors`

## Step 8.2: Night wallpaper (static stars, no animation)

Add to `globals.css`:

```css
[data-theme="night"] body {
  background-image:
    radial-gradient(1.6px 1.6px at 12% 18%, #ffe3b8 98%, transparent),
    radial-gradient(1.2px 1.2px at 33% 72%, #ffe3b8 98%, transparent),
    radial-gradient(1.8px 1.8px at 61% 24%, #ffe3b8 98%, transparent),
    radial-gradient(1.2px 1.2px at 82% 58%, #ffe3b8 98%, transparent),
    radial-gradient(1.4px 1.4px at 47% 90%, #ffe3b8 98%, transparent),
    radial-gradient(var(--dither) 1.2px, transparent 1.4px);
  background-size: 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 7px 7px;
  background-attachment: fixed, fixed, fixed, fixed, fixed, scroll;
}
```

Add a static vignette so the room feels dark at the edges (night only):

```css
[data-theme="night"] body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 8000;
  background: radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0, 0, 0, 0.45) 100%);
}
```

Commit: `add night stars`

## Step 8.3: NIB glows like a nightlight (canvas halo)

In `nibRenderer.ts`, at the start of `drawNib` after the early return and before the tail, add:

```ts
if (b.night) {
  const hx = b.tipX + 10, hy = b.tipY + 16;
  const r = b.reduced ? 74 : 70 + Math.sin(b.now * 2) * 6;
  const g = ctx.createRadialGradient(hx, hy, 4, hx, hy, r);
  g.addColorStop(0, "rgba(255,200,100,0.35)");
  g.addColorStop(1, "rgba(255,200,100,0)");
  ctx.save();
  ctx.globalAlpha = b.alpha;
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(hx, hy, r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
```

At night NIB's body outline stays `#0f0b07` and its glow `shadowColor` is `#ffb347`. Commit: `add nib glow`

## Step 8.4: The page lights up around NIB, and hidden drawings appear

### `src/components/nib/NightLight.tsx`

Important: set the CSS variables **on these two small elements**, not on `<html>`. Changing a custom property on the root every frame forces the browser to recalculate style for the whole page.

```tsx
"use client";
import { useEffect, useRef } from "react";
import { nib } from "./nibBus";
import { useTheme } from "@/lib/theme";

export default function NightLight() {
  const glow = useRef<HTMLDivElement>(null);
  const dream = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    if (theme !== "night") return;
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const b = nib.brain;
      if (!b) return;
      const x = `${Math.round(b.tipX + 8)}px`;
      const y = `${Math.round(b.tipY + 14)}px`;
      for (const el of [glow.current, dream.current]) {
        if (!el) continue;
        el.style.setProperty("--nx", x);
        el.style.setProperty("--ny", y);
      }
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [theme]);

  if (theme !== "night") return null;
  return (
    <>
      <div ref={glow} className="night-glow" aria-hidden="true" />
      <div ref={dream} className="dream-layer" aria-hidden="true">
        <svg className="dream-svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <g fill="none" stroke="#ffb347" strokeWidth="1.5" strokeDasharray="3 6" opacity="0.9">
            <polyline points="180,160 260,230 240,330 180,300 180,160" />
            <polyline points="860,120 940,170 1010,150 1060,210" />
            <circle cx="620" cy="560" r="46" />
          </g>
          <g fill="#ffb347">
            {[[180,160],[260,230],[240,330],[180,300],[860,120],[940,170],[1010,150],[1060,210]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" />)}
          </g>
          <g fontFamily="VT323, monospace" fontSize="34" fill="#ffb347">
            <text x="120" y="420">psst. you found the night shift.</text>
            <text x="700" y="480">4 bits of moonlight</text>
            <text x="360" y="700">nib sleeps with the lights on.</text>
            <text x="820" y="690">0101</text>
          </g>
        </svg>
      </div>
    </>
  );
}
```

Render `<NightLight />` in `layout.tsx` after `<NibLayer />`. It renders nothing in day mode.

### CSS (add to `globals.css`)

```css
.night-glow {
  position: fixed; inset: 0; pointer-events: none; z-index: 9000;
  background: radial-gradient(circle 280px at var(--nx, 50%) var(--ny, 50%), rgba(255, 190, 90, 0.2), rgba(255, 190, 90, 0.06) 55%, transparent 75%);
  mix-blend-mode: screen;
}
.dream-layer {
  position: fixed; inset: 0; pointer-events: none; z-index: 8999;
  -webkit-mask-image: radial-gradient(circle 170px at var(--nx, 50%) var(--ny, 50%), #000 0, transparent 100%);
  mask-image: radial-gradient(circle 170px at var(--nx, 50%) var(--ny, 50%), #000 0, transparent 100%);
}
.dream-svg { width: 100%; height: 100%; }
```

Notes:
- The glow **adds** light (screen blend), it never darkens text, so reading stays comfortable everywhere on the page.
- The hidden drawings are decorative only. Nothing essential lives in them.
- On touch devices the wandering NIB carries the light; that is fine and charming.
- Under reduced motion the halo does not pulse (handled in step 8.3); the follow still works because it is pointer-driven, not an animation.

Commit: `add night light`, `add hidden night drawings`

## Step 8.5: Night expression and toggle polish

- The label on the taskbar toggle stays `night`. When toggled on, play the existing `pop` sound (respecting mute) and let NIB do its happy mood once via `nib.brain?.pointerDown(); nib.brain?.pointerUp();` (this triggers the click squash and the happy face).
- Make NIB fall sleepy 3 seconds after the last movement at night (already in the brain via `this.night && idle > 3`; keep it).
- Add this to `NibVoice` lines: when switching to night for the first time in a session say `lights down.`; first time back to day say `good morning.` (still obeying the 15 second rule).
- Check every window, the story illustrations, the Nibble Box, the guestbook notes and the odometer at night: none may keep a hard-coded light colour that looks wrong. Fix any that do by using the tokens.

Commit: `polish night mode`

## Verify

1. Toggle night: palette is amber and brown-black, no green or navy anywhere (search again for the old hex values).
2. A halo follows NIB's tip; moving the mouse reveals the dotted constellations and the secret lines only within the light radius.
3. Text is readable everywhere (spot check the story captions, the guestbook form, the Nibble Box pads) and passes the contrast targets.
4. Touch: NIB wanders and lights the page; no hover-only dependency.
5. Reduced motion: no pulsing halo, everything else works.
6. No frame drops on a mid-range phone; CPU does not spike when idle (the loop only runs in night mode).
7. Day mode looks exactly as before. Reload in both themes: no flash of the wrong theme.
8. Console clean; `npm run build` passes. Real phone check, then merge and deploy.
