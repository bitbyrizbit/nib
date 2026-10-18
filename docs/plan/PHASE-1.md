# PHASE 1: FOUNDATION AND A LIVING NIB

Read `docs/BRIEF.md` and `docs/plan/00-OVERVIEW.md` first. Build only this phase.

## What this phase delivers and why

A deployed site with the project set up, the visual system (tokens, fonts, 1999-desktop window shell), a hero, a day/night toggle, and **the most important thing in the whole project: NIB as a living cursor**. Everything else in the site depends on NIB feeling right, so it comes first. Phase 1 ends with a live URL.

## Prompt for this phase

```
Build Phase 1 from docs/plan/PHASE-1.md exactly, step by step. Reference code in the doc was written without being run:
paste it, run npx tsc --noEmit and npm run lint, fix errors, and tell me what you changed.
Commit after every numbered step with a plain lowercase message (no prefixes like feat: or docs:), then git push.
Do not start Phase 2. At the end run the checklist and report what passed and what you could not verify.
```

---

## Step 1.1: Scaffold Next.js inside the existing repo

The repo already has `README.md`, `CREDITS.md`, `AGENTS.md`, `LICENSE`, `.gitignore`, `docs/`. Scaffold in a temp folder, then merge, so nothing gets overwritten. Run in PowerShell:

```powershell
cd C:\Users\Rud\Desktop\nib
npx create-next-app@latest _scaffold --ts --app --src-dir --eslint --no-tailwind --import-alias "@/*" --use-npm --disable-git
```

If it asks questions: TypeScript yes, ESLint yes, **Tailwind NO**, `src/` directory yes, App Router yes, React Compiler no, import alias `@/*`. Then merge without overwriting our own files:

```powershell
robocopy _scaffold . /E /XF README.md .gitignore AGENTS.md CLAUDE.md /XD node_modules .git
Remove-Item _scaffold -Recurse -Force
npm install
```

(robocopy exit codes 0 to 7 mean success.) Append to `.gitignore` if missing: `next-env.d.ts` and `*.tsbuildinfo`. Delete the demo files the scaffold created that we will replace: `src/app/page.module.css` if present, and any default SVGs in `public/` (`next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`). Create `public/robots.txt`:

```
User-agent: *
Allow: /
```

Run `npm run dev`, open http://localhost:3000, confirm the default page loads with no errors. Commit: `add project setup`

## Step 1.2: Design tokens, global styles, fonts, theme

### `src/app/tokens.css`

```css
:root {
  --font-display: var(--font-display-next, "Arial Rounded MT Bold", "Arial Black", sans-serif);
  --font-ui: var(--font-ui-next, Verdana, sans-serif);
  --font-mono: var(--font-mono-next, "Courier New", monospace);

  --s1: 4px; --s2: 8px; --s3: 12px; --s4: 16px; --s5: 24px; --s6: 32px; --s7: 48px; --s8: 72px;

  --ink: #1c1b18;
  --line: #1c1b18;
  --plastic: #ddd6c1;
  --plastic-hi: #f6f1e0;
  --plastic-lo: #a79f86;
  --wallpaper: #b7cf9b;
  --dither: rgba(28, 27, 24, 0.14);
  --signal: #e8412f;
  --nib: #ffd23f;
  --phosphor: #1f7a4a;
  --title-bg: #1c1b18;
  --title-fg: #ffd23f;
  --text: #1c1b18;
  --text-soft: #4a4637;
  --shadow-c: #1c1b18;
  --taskbar-h: 48px;
}

[data-theme="night"] {
  --ink: #0a0d1c;
  --line: #7dffb0;
  --plastic: #1b2036;
  --plastic-hi: #2c3354;
  --plastic-lo: #0f1226;
  --wallpaper: #0a0d1c;
  --dither: rgba(125, 255, 176, 0.1);
  --signal: #ff4fa3;
  --phosphor: #7dffb0;
  --title-bg: #7dffb0;
  --title-fg: #0a0d1c;
  --text: #d7f5e3;
  --text-soft: #9bb8a8;
  --shadow-c: #000000;
}
```

### `src/app/globals.css`

```css
@import "./tokens.css";

*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  min-height: 100dvh;
  font-family: var(--font-ui);
  font-size: 18px;
  line-height: 1.5;
  color: var(--text);
  background-color: var(--wallpaper);
  background-image: radial-gradient(var(--dither) 1.2px, transparent 1.4px);
  background-size: 7px 7px;
  padding-bottom: calc(var(--taskbar-h) + var(--s5));
  overflow-x: hidden;
}
h1, h2, h3 { font-family: var(--font-display); font-weight: 400; line-height: 1.05; margin: 0 0 var(--s3); }
p { margin: 0 0 var(--s3); }
a { color: inherit; }
button { font: inherit; color: inherit; }
:focus-visible { outline: 3px solid var(--signal); outline-offset: 2px; }

/* NIB cursor replacement: only when the class is set by NibLayer (mouse users) */
html.nib-on, html.nib-on * { cursor: none !important; }
html.nib-on input, html.nib-on textarea, html.nib-on select, html.nib-on [data-nib="native"],
html.nib-on input *, html.nib-on textarea * { cursor: auto !important; }
html.nib-on input[type="text"], html.nib-on textarea { cursor: text !important; }

.nib-canvas { position: fixed; inset: 0; pointer-events: none; z-index: 9999; }

.main { max-width: 1180px; margin: 0 auto; padding: var(--s6) var(--s4); display: grid; gap: var(--s7); }

/* Window */
.window {
  background: var(--plastic);
  border: 2px solid var(--line);
  box-shadow: inset -2px -2px 0 var(--plastic-lo), inset 2px 2px 0 var(--plastic-hi), 6px 6px 0 var(--shadow-c);
}
.window__bar { display: flex; align-items: center; justify-content: space-between; gap: var(--s3); background: var(--title-bg); color: var(--title-fg); padding: 4px 6px 4px 10px; }
.window__title { font-family: var(--font-mono); font-size: 22px; letter-spacing: 0.04em; text-transform: lowercase; }
.window__btn { width: 28px; height: 28px; display: grid; place-items: center; background: var(--plastic); color: var(--text); border: 2px solid var(--line); box-shadow: inset -2px -2px 0 var(--plastic-lo), inset 2px 2px 0 var(--plastic-hi); line-height: 1; padding: 0; }
.window__btn:active { box-shadow: inset 2px 2px 0 var(--plastic-lo); }
.window__body { padding: var(--s5); }

/* Taskbar */
.taskbar { position: fixed; left: 0; right: 0; bottom: 0; height: var(--taskbar-h); z-index: 50; display: flex; align-items: center; gap: var(--s3); padding: 0 var(--s3); background: var(--plastic); border-top: 2px solid var(--line); box-shadow: inset 0 2px 0 var(--plastic-hi); }
.taskbar__spacer { flex: 1; }
.tb-btn { min-height: 36px; min-width: 44px; padding: 0 var(--s3); display: inline-flex; align-items: center; gap: var(--s2); background: var(--plastic); border: 2px solid var(--line); box-shadow: inset -2px -2px 0 var(--plastic-lo), inset 2px 2px 0 var(--plastic-hi); font-family: var(--font-mono); font-size: 20px; text-transform: lowercase; }
.tb-btn[aria-pressed="true"], .tb-btn[aria-expanded="true"] { box-shadow: inset 2px 2px 0 var(--plastic-lo); background: var(--nib); color: #1c1b18; }
.tb-led { width: 10px; height: 10px; background: var(--plastic-lo); border: 1px solid var(--line); }
.tb-btn[aria-pressed="true"] .tb-led { background: var(--phosphor); }
.tb-clock { font-family: var(--font-mono); font-size: 22px; min-width: 64px; text-align: right; }
.start-menu { position: fixed; left: var(--s3); bottom: calc(var(--taskbar-h) + 6px); z-index: 60; min-width: 200px; background: var(--plastic); border: 2px solid var(--line); box-shadow: 6px 6px 0 var(--shadow-c); padding: var(--s2); display: grid; }
.start-menu a { padding: var(--s2) var(--s3); text-decoration: none; font-family: var(--font-mono); font-size: 22px; }
.start-menu a:hover, .start-menu a:focus-visible { background: var(--title-bg); color: var(--title-fg); }

/* Hero */
.hero { display: grid; gap: var(--s4); }
.wordmark { font-size: clamp(88px, 22vw, 220px); letter-spacing: -0.02em; line-height: 0.9; margin: 0; position: relative; display: inline-block; }
.tagline { font-family: var(--font-display); font-size: clamp(24px, 4vw, 40px); margin: 0; }
.descriptor { color: var(--text-soft); max-width: 46ch; }
.bits { display: inline-flex; gap: var(--s2); align-items: center; font-family: var(--font-mono); font-size: 20px; }
.bit { width: 16px; height: 16px; border: 2px solid var(--line); background: var(--plastic-lo); transition: background 0.15s; }
.bit[data-on="true"] { background: var(--nib); box-shadow: 0 0 0 2px var(--line); }
.sticker { justify-self: start; transform: rotate(-3deg); background: var(--signal); color: #fff; padding: var(--s2) var(--s4); border: 2px solid var(--line); font-family: var(--font-mono); font-size: 22px; text-transform: none; }
.hint { font-family: var(--font-mono); font-size: 20px; color: var(--text-soft); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
}
```

### `src/lib/theme.ts`

```ts
"use client";
import { useSyncExternalStore } from "react";

export type Theme = "day" | "night";

const read = (): Theme => (document.documentElement.dataset.theme === "night" ? "night" : "day");

export function setTheme(t: Theme) {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem("nib:theme", t); } catch {}
}

function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, read, () => "day" as Theme);
}
```

### `src/app/layout.tsx`

```tsx
import type { Metadata, Viewport } from "next";
import { Bagel_Fat_One, Pixelify_Sans, VT323 } from "next/font/google";
import NibLayer from "@/components/nib/NibLayer";
import "./globals.css";

const display = Bagel_Fat_One({ weight: "400", subsets: ["latin", "latin-ext"], variable: "--font-display-next", display: "swap" });
const ui = Pixelify_Sans({ subsets: ["latin"], variable: "--font-ui-next", display: "swap" });
const mono = VT323({ weight: "400", subsets: ["latin"], variable: "--font-mono-next", display: "swap" });

export const metadata: Metadata = {
  title: "nib · baby's first cursor",
  description: "Click gently. I'm new here. A newborn cursor discovering the internet, one click at a time.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

const themeScript = `(function(){try{var t=localStorage.getItem('nib:theme');if(t!=='day'&&t!=='night'){t=matchMedia('(prefers-color-scheme: dark)').matches?'night':'day'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='day'}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${ui.variable} ${mono.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>
        {children}
        <NibLayer />
      </body>
    </html>
  );
}
```

Check: fonts load (no 404 in network tab), the wordmark font is visibly different from the body font. If a font name fails to import, tell the owner and pick the closest OFL font from Google Fonts rather than silently using a default. Commit: `add colors and fonts`

## Step 1.3: Desktop shell (Window, Taskbar, theme toggle)

### `src/lib/nav.ts`

```ts
export type NavItem = { id: string; label: string };
export const NAV: NavItem[] = [{ id: "hello", label: "hello" }];
```

Later phases add items here (story, projects, about, guestbook).

### `src/components/shell/Window.tsx`

```tsx
"use client";
import { useId, useState, type ReactNode } from "react";

export default function Window({ title, children, id, className = "", defaultOpen = true }: {
  title: string; children: ReactNode; id?: string; className?: string; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();
  return (
    <section id={id} className={`window ${className}`} aria-label={title}>
      <header className="window__bar">
        <span className="window__title">{title}</span>
        <button type="button" className="window__btn" aria-expanded={open} aria-controls={bodyId}
          aria-label={open ? `Minimize ${title}` : `Restore ${title}`} onClick={() => setOpen((o) => !o)}>
          {open ? "–" : "+"}
        </button>
      </header>
      <div id={bodyId} className="window__body" hidden={!open}>{children}</div>
    </section>
  );
}
```

### `src/components/shell/ThemeToggle.tsx`

```tsx
"use client";
import { setTheme, useTheme } from "@/lib/theme";

export default function ThemeToggle() {
  const theme = useTheme();
  const night = theme === "night";
  return (
    <button type="button" className="tb-btn" aria-pressed={night} onClick={() => setTheme(night ? "day" : "night")}>
      <span className="tb-led" aria-hidden="true" />
      night
    </button>
  );
}
```

### `src/components/shell/Taskbar.tsx`

```tsx
"use client";
import { useEffect, useState } from "react";
import { NAV } from "@/lib/nav";
import ThemeToggle from "./ThemeToggle";

export default function Taskbar() {
  const [menu, setMenu] = useState(false);
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }));
    tick();
    const id = setInterval(tick, 20000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  return (
    <>
      {menu && (
        <nav className="start-menu" aria-label="Sections">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={() => setMenu(false)}>{n.label}</a>
          ))}
        </nav>
      )}
      <div className="taskbar" role="toolbar" aria-label="nib taskbar">
        <button type="button" className="tb-btn" aria-expanded={menu} aria-haspopup="true" onClick={() => setMenu((m) => !m)}>nib ▸</button>
        <div className="taskbar__spacer" />
        <ThemeToggle />
        <span className="tb-clock" aria-label="Local time">{time}</span>
      </div>
    </>
  );
}
```

If the "▸" glyph does not render in VT323, replace it with `>`. Phase 3 adds the mute button here, Phase 4 the visit counter. Commit: `add window and taskbar`

## Step 1.4: Hero

### `src/lib/bits.ts`

```ts
import type { Mood } from "@/components/nib/nibBrain";

export const MOOD_BITS: Record<Mood, string> = {
  idle: "0001", curious: "0011", read: "0101", happy: "1111",
  pout: "1001", sleepy: "0100", asleep: "0000", grab: "0110",
};

export const toHex = (bits: string) => parseInt(bits, 2).toString(16).toUpperCase();
```

### `src/components/nib/nibBus.ts`

```ts
import type { Mood, NibBrain } from "./nibBrain";

type Listener = () => void;
const listeners = new Set<Listener>();
let current: Mood = "idle";

export const nib = { brain: null as NibBrain | null };

export const nibBus = {
  emit(m: Mood) { current = m; listeners.forEach((l) => l()); },
  subscribe(l: Listener) { listeners.add(l); return () => { listeners.delete(l); }; },
  get: () => current,
};
```

### `src/components/ui/BitLights.tsx`

```tsx
"use client";
import { useSyncExternalStore } from "react";
import { nibBus } from "@/components/nib/nibBus";
import { MOOD_BITS, toHex } from "@/lib/bits";

export default function BitLights() {
  const mood = useSyncExternalStore(nibBus.subscribe, nibBus.get, () => "idle" as const);
  const bits = MOOD_BITS[mood];
  return (
    <div className="bits" role="img" aria-label={`NIB is feeling ${mood}`}>
      {bits.split("").map((b, i) => <span key={i} className="bit" data-on={b === "1"} />)}
      <span aria-hidden="true">0x{toHex(bits)}</span>
    </div>
  );
}
```

### `src/components/sections/Hero.tsx`

```tsx
import Window from "@/components/shell/Window";
import BitLights from "@/components/ui/BitLights";

export default function Hero() {
  return (
    <Window title="hello.exe" id="hello">
      <div className="hero">
        <h1 className="wordmark" aria-label="nib">
          n<span style={{ position: "relative", display: "inline-block" }}>ı
            <svg aria-hidden="true" viewBox="0 0 21 31" width="0.22em" height="0.32em"
              style={{ position: "absolute", left: "0.04em", top: "0.08em" }}>
              <polygon points="0,0 0,26 7,20 12,31 17,28.5 12,18 21,18" fill="#e8412f" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </span>b
        </h1>
        <p className="tagline">Click gently. I&apos;m new here.</p>
        <p className="descriptor">A newborn cursor discovering the internet, one click at a time.</p>
        <BitLights />
        <div className="sticker" data-sticker>Hello, my name is NIB</div>
        <p className="hint">move your mouse. or tap anywhere. nib will find you.</p>
      </div>
    </Window>
  );
}
```

Visual check on the wordmark: the "i" must show a small pointer arrow where its dot would be. If the dotless "ı" glyph is missing from Bagel Fat One, use a normal "i" and hide the font's dot by positioning the arrow over it; tune the arrow's `left` and `top` until it sits exactly on the dot position at the clamp sizes 88px, 140px and 220px. This is the project's logo, so spend time on it.

### `src/app/page.tsx`

```tsx
import Taskbar from "@/components/shell/Taskbar";
import Hero from "@/components/sections/Hero";

export default function Page() {
  return (
    <>
      <main className="main"><Hero /></main>
      <Taskbar />
    </>
  );
}
```

Commit: `add hero`

## Step 1.5: The NIB engine (this is the core of the project)

### How it works

- A fixed full-screen canvas (`NibLayer`) is drawn every animation frame.
- `NibBrain` holds all state and physics. `nibRenderer` only draws.
- **Tip rule:** in mouse mode `tipX/tipY` are set directly to the pointer position every frame, so the click point is exact. Rotation and scaling happen **around the tip**, so the tip never moves. Body lean, squash, stretch, eyes, hop and tail are springs.
- Touch devices have no cursor, so NIB wanders and walks toward taps. The native cursor is only hidden when a real mouse is detected.
- Interaction targets are found with `classify()` from DOM attributes: links and buttons (curious), text (read), disabled things (pout), `data-nib="drag"` (grab), inputs (NIB fades out and the native cursor returns).

### `src/components/nib/nibShape.ts`

```ts
export const S = 2.1;
export const BODY: ReadonlyArray<readonly [number, number]> = [[0, 0], [0, 26], [7, 20], [12, 31], [17, 28.5], [12, 18], [21, 18]];
export const REAR = { x: 14.5, y: 30 } as const;
export const EYES = [{ x: 4.4, y: 12 }, { x: 9.2, y: 13.3 }] as const;
export const EYE_R = 2.2;
export const MOUTH = { x: 6.8, y: 16.7 } as const;
```

These are starting values in local units (tip at 0,0, scaled by `S`). Tune them visually, but the silhouette must stay a recognisable arrow pointer with a slightly lopsided tip, and both eyes must stay inside the head.

### `src/components/nib/spring.ts`

```ts
export type Spring = { x: number; v: number; target: number; k: number; c: number };
export const makeSpring = (x = 0, k = 170, c = 16): Spring => ({ x, v: 0, target: x, k, c });
export function stepSpring(s: Spring, dt: number) {
  const a = -s.k * (s.x - s.target) - s.c * s.v;
  s.v += a * dt;
  s.x += s.v * dt;
}
```

### `src/components/nib/classify.ts`

```ts
import type { Kind } from "./nibBrain";

export function classify(target: EventTarget | null): { kind: Kind; el: Element | null } {
  if (!(target instanceof Element)) return { kind: "none", el: null };
  let el: Element | null;
  if ((el = target.closest('[disabled],[aria-disabled="true"],[data-nib="disabled"]'))) return { kind: "disabled", el };
  if ((el = target.closest('input,textarea,select,[contenteditable="true"],[data-nib="native"]'))) return { kind: "native", el };
  if ((el = target.closest('[data-nib="drag"]'))) return { kind: "drag", el };
  if ((el = target.closest('a[href],button,summary,[role="button"],[role="link"],[data-nib="link"]'))) return { kind: "link", el };
  if ((el = target.closest('p,li,h1,h2,h3,h4,blockquote,figcaption,[data-nib="read"]'))) return { kind: "text", el };
  return { kind: "none", el: null };
}
```

### `src/components/nib/nibBrain.ts`

```ts
import { makeSpring, stepSpring } from "./spring";
import { REAR, S } from "./nibShape";

export type Mood = "idle" | "curious" | "read" | "sleepy" | "asleep" | "pout" | "grab" | "happy";
export type Kind = "none" | "link" | "text" | "disabled" | "drag" | "native";
export type Rect = { x: number; y: number; w: number; h: number };
export type TailPoint = { x: number; y: number; px: number; py: number };

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const TAIL_N = 9;
const TAIL_L = 6;

export class NibBrain {
  mode: "mouse" | "touch" = "mouse";
  reduced = false;
  night = false;
  width = 0;
  height = 0;
  now = 0;
  tipX = -200;
  tipY = -200;
  vx = 0;
  vy = 0;
  kind: Kind = "none";
  rect: Rect | null = null;
  down = false;
  inside = true;
  mood: Mood = "idle";
  alpha = 0;
  blink = 0;
  angle = makeSpring(0, 150, 13);
  sx = makeSpring(1, 230, 13);
  sy = makeSpring(1, 230, 13);
  hop = makeSpring(0, 280, 16);
  eyeX = makeSpring(0, 120, 16);
  eyeY = makeSpring(0, 120, 16);
  tail: TailPoint[] = [];
  onMood: ((m: Mood) => void) | null = null;
  onWake: (() => void) | null = null;
  onClick: (() => void) | null = null;

  private px = -200;
  private py = -200;
  private hasPointer = false;
  private lastActive = 0;
  private clickStart = -1;
  private bounced = true;
  private nextBlink = 2;
  private wx = 0;
  private wy = 0;
  private nextWander = 0;
  private touchReady = false;

  resize(w: number, h: number) { this.width = w; this.height = h; }

  setMode(m: "mouse" | "touch") {
    this.mode = m;
    if (m === "touch" && !this.touchReady) {
      this.touchReady = true;
      this.wx = this.width * 0.7; this.wy = this.height * 0.55;
      this.tipX = this.wx; this.tipY = this.wy;
    }
  }

  setTarget(kind: Kind, rect: Rect | null) { this.kind = kind; this.rect = rect; }

  poke() {
    if (this.mood === "asleep" || this.mood === "sleepy") { this.hop.v = -220; this.onWake?.(); }
    this.lastActive = this.now;
  }

  pointerMove(x: number, y: number) {
    if (!this.hasPointer) { this.tipX = x; this.tipY = y; }
    this.px = x; this.py = y; this.hasPointer = true; this.inside = true;
    this.poke();
  }

  leave() { this.inside = false; }

  pointerDown() {
    this.down = true; this.poke();
    this.clickStart = this.now; this.bounced = false;
    this.onClick?.();
  }

  pointerUp() { this.down = false; }

  tap(x: number, y: number) {
    this.wx = x; this.wy = y; this.nextWander = this.now + 4;
    if (this.reduced) { this.tipX = x; this.tipY = y; }
    this.pointerDown(); this.down = false;
  }

  update(dtRaw: number) {
    const dt = clamp(dtRaw, 0.0001, 1 / 30);
    this.now += dt;
    const prevX = this.tipX, prevY = this.tipY;

    if (this.mode === "mouse") {
      if (this.hasPointer) { this.tipX = this.px; this.tipY = this.py; }
    } else if (this.reduced) {
      this.tipX = this.wx; this.tipY = this.wy;
    } else {
      if (this.now > this.nextWander) {
        this.wx = 40 + Math.random() * Math.max(10, this.width - 80);
        this.wy = 80 + Math.random() * Math.max(10, this.height - 200);
        this.nextWander = this.now + 2.5 + Math.random() * 2.5;
      }
      const k = 1 - Math.exp(-dt * 2.2);
      this.tipX += (this.wx - this.tipX) * k;
      this.tipY += (this.wy - this.tipY) * k;
    }

    this.vx += ((this.tipX - prevX) / dt - this.vx) * 0.25;
    this.vy += ((this.tipY - prevY) / dt - this.vy) * 0.25;

    // mood
    const idle = this.now - this.lastActive;
    const clicking = this.clickStart >= 0 && this.now - this.clickStart < 0.7;
    let m: Mood = "idle";
    if (clicking) m = "happy";
    else if (this.kind === "disabled") m = "pout";
    else if (this.down && this.kind === "drag") m = "grab";
    else if (this.kind === "link") m = "curious";
    else if (this.kind === "text") m = "read";
    else if (idle > 20) m = "asleep";
    else if (idle > 8 || (this.night && idle > 3)) m = "sleepy";
    if (m !== this.mood) { this.mood = m; this.onMood?.(m); }

    // visibility
    const wantAlpha = this.kind === "native" || !this.inside || (this.mode === "mouse" && !this.hasPointer) ? 0 : 1;
    this.alpha += (wantAlpha - this.alpha) * Math.min(1, dt * 12);

    // eyes
    let lx = 0, ly = 0;
    if (this.rect && this.kind !== "none") {
      const dx = this.rect.x + this.rect.w / 2 - this.tipX, dy = this.rect.y + this.rect.h / 2 - this.tipY;
      const d = Math.hypot(dx, dy) || 1; lx = dx / d; ly = dy / d;
    } else {
      const sp = Math.hypot(this.vx, this.vy);
      if (sp > 40) { lx = this.vx / sp; ly = this.vy / sp; }
    }
    this.eyeX.target = lx; this.eyeY.target = ly;
    stepSpring(this.eyeX, dt); stepSpring(this.eyeY, dt);

    this.blink = Math.max(0, this.blink - dt);
    if (this.now > this.nextBlink) { this.blink = 0.14; this.nextBlink = this.now + 2.5 + Math.random() * 3.5; }

    if (this.reduced) {
      this.angle.x = 0; this.angle.v = 0; this.sx.x = 1; this.sx.v = 0; this.sy.x = 1; this.sy.v = 0; this.hop.x = 0; this.hop.v = 0;
      this.updateTail(dt, true);
      return;
    }

    // body targets
    let a = clamp(this.vx * 0.0009, -0.35, 0.35);
    let sxT = 1, syT = 1;
    switch (m) {
      case "curious": a += 0.22; sxT = 1.05; syT = 1.05; break;
      case "read": a -= 0.08; syT = 0.94; break;
      case "sleepy": a += 0.3; syT = 0.95; break;
      case "asleep": a += 0.55; syT = 0.9; break;
      case "pout": a += Math.sin(this.now * 38) * 0.06; break;
      case "grab": syT = 1.28; sxT = 0.86; break;
    }
    const s = Math.min(Math.hypot(this.vx, this.vy) / 3500, 0.22);
    syT *= 1 + s; sxT *= 1 - s * 0.6;

    if (this.clickStart >= 0) {
      const t = this.now - this.clickStart;
      if (t < 0.08) { a -= 0.2; sxT *= 0.92; syT *= 0.92; }
      else if (t < 0.17) { sxT *= 1.2; syT *= 0.8; }
      else if (!this.bounced) { this.bounced = true; this.hop.v = -300; }
    }

    this.angle.target = a; this.sx.target = sxT; this.sy.target = syT; this.hop.target = 0;
    for (const sp of [this.angle, this.sx, this.sy, this.hop]) { stepSpring(sp, dt / 2); stepSpring(sp, dt / 2); }
    this.updateTail(dt, false);
  }

  private updateTail(dt: number, still: boolean) {
    const a = this.angle.x, sx = S * this.sx.x, sy = S * this.sy.x;
    const rx = this.tipX + Math.cos(a) * REAR.x * sx - Math.sin(a) * REAR.y * sy;
    const ry = this.tipY + this.hop.x + Math.sin(a) * REAR.x * sx + Math.cos(a) * REAR.y * sy;
    if (this.tail.length === 0) {
      for (let i = 0; i < TAIL_N; i++) this.tail.push({ x: rx, y: ry + i * TAIL_L, px: rx, py: ry + i * TAIL_L });
    }
    this.tail[0].x = rx; this.tail[0].y = ry;
    if (still) {
      for (let i = 1; i < TAIL_N; i++) { const p = this.tail[i]; p.x = rx + i * TAIL_L * 0.7; p.y = ry + i * TAIL_L * 0.7; p.px = p.x; p.py = p.y; }
      return;
    }
    const g = (this.mood === "asleep" ? 1400 : 700) * dt * dt;
    for (let i = 1; i < TAIL_N; i++) {
      const p = this.tail[i];
      const vx = (p.x - p.px) * 0.92, vy = (p.y - p.py) * 0.92;
      p.px = p.x; p.py = p.y; p.x += vx; p.y += vy + g;
    }
    for (let it = 0; it < 3; it++) {
      for (let i = 1; i < TAIL_N; i++) {
        const a0 = this.tail[i - 1], b0 = this.tail[i];
        const dx = b0.x - a0.x, dy = b0.y - a0.y, d = Math.hypot(dx, dy) || 1;
        const k = (d - TAIL_L) / d;
        b0.x -= dx * k; b0.y -= dy * k;
      }
    }
  }
}
```

### `src/components/nib/nibRenderer.ts`

```ts
import type { NibBrain } from "./nibBrain";
import { BODY, EYES, EYE_R, MOUTH, S } from "./nibShape";

export function drawNib(ctx: CanvasRenderingContext2D, b: NibBrain) {
  if (b.alpha < 0.02) return;
  const night = b.night;
  const line = night ? "#0a0d1c" : "#1c1b18";
  const fill = "#ffd23f";

  ctx.save();
  ctx.globalAlpha = b.alpha;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (b.tail.length > 1) {
    ctx.beginPath();
    ctx.moveTo(b.tail[0].x, b.tail[0].y);
    for (let i = 1; i < b.tail.length; i++) ctx.lineTo(b.tail[i].x, b.tail[i].y);
    ctx.strokeStyle = line; ctx.lineWidth = 7; ctx.stroke();
    ctx.strokeStyle = fill; ctx.lineWidth = 3.5; ctx.stroke();
  }

  ctx.translate(b.tipX, b.tipY + b.hop.x);
  ctx.rotate(b.angle.x);
  ctx.scale(S * b.sx.x, S * b.sy.x);

  ctx.beginPath();
  BODY.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  if (night) { ctx.shadowColor = "#7dffb0"; ctx.shadowBlur = 14; }
  ctx.fillStyle = fill; ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = line; ctx.lineWidth = 1.5; ctx.stroke();

  const m = b.mood;
  ctx.fillStyle = "rgba(232,65,47,0.55)";
  ctx.beginPath(); ctx.arc(2.6, 15.4, 1, 0, Math.PI * 2); ctx.arc(10.6, 16.6, 1, 0, Math.PI * 2); ctx.fill();

  const lid = m === "sleepy" ? 0.5 : 0;
  EYES.forEach((e, i) => {
    ctx.strokeStyle = line; ctx.lineWidth = 0.8;
    if (m === "asleep" || m === "happy") {
      ctx.beginPath();
      if (m === "happy") { ctx.moveTo(e.x - 1.8, e.y + 0.8); ctx.quadraticCurveTo(e.x, e.y - 1.6, e.x + 1.8, e.y + 0.8); }
      else { ctx.moveTo(e.x - 1.8, e.y); ctx.quadraticCurveTo(e.x, e.y + 1.4, e.x + 1.8, e.y); }
      ctx.stroke();
      return;
    }
    const open = b.blink > 0 ? 0.08 : 1 - lid;
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.ellipse(e.x, e.y, EYE_R, EYE_R * open, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = line;
    const pr = m === "curious" ? 1.3 : 1;
    ctx.beginPath(); ctx.ellipse(e.x + b.eyeX.x * 0.8, e.y + b.eyeY.x * 0.8 * open, pr, pr * Math.max(open, 0.1), 0, 0, Math.PI * 2); ctx.fill();
    if (m === "pout") {
      ctx.beginPath(); ctx.moveTo(e.x - 2, e.y - 2.4 + (i ? 0.8 : -0.4)); ctx.lineTo(e.x + 2, e.y - 2.4 + (i ? -0.4 : 0.8)); ctx.stroke();
    }
  });

  ctx.strokeStyle = line; ctx.lineWidth = 0.8; ctx.beginPath();
  const mx = MOUTH.x, my = MOUTH.y;
  if (m === "happy") { ctx.moveTo(mx - 1.4, my - 0.3); ctx.quadraticCurveTo(mx, my + 2, mx + 1.4, my - 0.3); }
  else if (m === "pout") { ctx.moveTo(mx - 1, my + 0.8); ctx.quadraticCurveTo(mx, my - 0.4, mx + 1, my + 0.8); }
  else if (m === "curious") { ctx.arc(mx, my + 0.3, 0.7, 0, Math.PI * 2); }
  else if (m === "read" || m === "asleep") { ctx.moveTo(mx - 1, my); ctx.lineTo(mx + 1, my); }
  else { ctx.moveTo(mx - 1, my - 0.2); ctx.quadraticCurveTo(mx, my + 1.1, mx + 1, my - 0.2); }
  ctx.stroke();
  ctx.restore();

  if (m === "asleep") {
    ctx.save();
    ctx.globalAlpha = b.alpha;
    ctx.fillStyle = night ? "#7dffb0" : "#1c1b18";
    ctx.font = "22px VT323, monospace";
    ctx.fillText("z", b.tipX + 34, b.tipY - 6 - ((b.now * 12) % 10));
    ctx.fillText("z", b.tipX + 46, b.tipY - 18 - ((b.now * 12 + 5) % 10));
    ctx.restore();
  }
}
```

### `src/components/nib/NibLayer.tsx`

```tsx
"use client";
import { useEffect, useRef } from "react";
import { NibBrain } from "./nibBrain";
import { drawNib } from "./nibRenderer";
import { classify } from "./classify";
import { nib, nibBus } from "./nibBus";

const toRect = (el: Element) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };

export default function NibLayer() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const root = document.documentElement;
    const brain = new NibBrain();
    nib.brain = brain;
    brain.onMood = (m) => nibBus.emit(m);
    const rm = matchMedia("(prefers-reduced-motion: reduce)");
    brain.reduced = rm.matches;
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    brain.width = innerWidth; brain.height = innerHeight;
    brain.setMode(fine ? "mouse" : "touch");

    let hoverEl: Element | null = null;
    let keyboard = false;
    let raf = 0;
    let last = performance.now();
    let rectTimer = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
      canvas.style.width = innerWidth + "px"; canvas.style.height = innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      brain.resize(innerWidth, innerHeight);
    };
    const useMouse = () => { if (brain.mode !== "mouse") brain.setMode("mouse"); root.classList.add("nib-on"); };
    const useTouch = () => { brain.setMode("touch"); root.classList.remove("nib-on"); };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      keyboard = false; useMouse(); brain.pointerMove(e.clientX, e.clientY);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") { useTouch(); brain.tap(e.clientX, e.clientY); }
      else { useMouse(); brain.pointerMove(e.clientX, e.clientY); brain.pointerDown(); }
    };
    const onUp = () => brain.pointerUp();
    const onOver = (e: PointerEvent) => {
      const c = classify(e.target);
      hoverEl = c.el;
      brain.setTarget(c.kind, c.el ? toRect(c.el) : null);
    };
    const onLeave = () => brain.leave();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Tab") keyboard = true; };
    const onFocus = (e: FocusEvent) => {
      if (!keyboard || !(e.target instanceof Element)) return;
      const c = classify(e.target);
      const r = e.target.getBoundingClientRect();
      useMouse();
      brain.pointerMove(r.left + 6, r.top + r.height / 2);
      hoverEl = c.el ?? e.target;
      brain.setTarget(c.kind === "none" ? "link" : c.kind, toRect(hoverEl));
    };
    const onScroll = () => brain.poke();
    const onRm = () => { brain.reduced = rm.matches; };

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      const dt = (t - last) / 1000; last = t;
      brain.night = root.dataset.theme === "night";
      rectTimer += dt;
      if (rectTimer > 0.1) {
        rectTimer = 0;
        if (hoverEl) {
          if (hoverEl.isConnected) brain.setTarget(brain.kind, toRect(hoverEl));
          else { hoverEl = null; brain.setTarget("none", null); }
        }
      }
      brain.update(dt);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      drawNib(ctx, brain);
    };
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else { last = performance.now(); raf = requestAnimationFrame(frame); }
    };

    resize();
    raf = requestAnimationFrame(frame);
    addEventListener("resize", resize);
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerdown", onDown, { passive: true });
    addEventListener("pointerup", onUp, { passive: true });
    addEventListener("pointercancel", onUp, { passive: true });
    addEventListener("pointerover", onOver, { passive: true });
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("keydown", onKey);
    addEventListener("focusin", onFocus);
    root.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVis);
    rm.addEventListener("change", onRm);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      removeEventListener("pointerup", onUp);
      removeEventListener("pointercancel", onUp);
      removeEventListener("pointerover", onOver);
      removeEventListener("scroll", onScroll);
      removeEventListener("keydown", onKey);
      removeEventListener("focusin", onFocus);
      root.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
      rm.removeEventListener("change", onRm);
      root.classList.remove("nib-on");
      nib.brain = null;
    };
  }, []);

  return <canvas ref={ref} className="nib-canvas" aria-hidden="true" />;
}
```

Run it and verify against the list below. Commit in this order as each part works: `add nib shape and springs`, `add nib cursor`, `add nib moods`, `add nib touch mode`.

## Step 1.6: Verify NIB (every line must pass)

1. Move the mouse: NIB's **tip is exactly under the real pointer**, with no lag at the tip. Body and tail lag softly behind.
2. Hover the taskbar buttons and the Start menu links: NIB turns curious (leans, bigger pupils). BitLights show `0011`.
3. Hover the descriptor paragraph: NIB squints (read mood, `0101`).
4. Click anywhere: the lean, then squash, then a delayed bounce plays, and the **click still works instantly**.
5. Stay still for about 8 seconds: sleepy. About 20 seconds: asleep with floating "z". Moving wakes it with a small hop.
6. Night toggle: palette changes, NIB gets a green glow, and it drifts sleepy sooner.
7. Hover a disabled control (temporarily add `<button disabled>test</button>`, then remove it): NIB pouts.
8. Chrome DevTools, device toolbar, iPhone size: the native cursor is not hidden, NIB wanders by itself, walks toward each tap and squashes on tap. No horizontal scroll at 360px width.
9. DevTools, Rendering, emulate `prefers-reduced-motion: reduce`: no wandering, no bounce, no wobbling tail, NIB still shows moods and still follows the pointer in mouse mode.
10. Keyboard only: press Tab; NIB moves beside each focused control and the focus ring is visible.
11. Console has **zero** errors or warnings. `npm run build` passes.

## Step 1.7: Deploy now

```powershell
npm i -g vercel
vercel login
vercel link
vercel --prod
```

Use project name `meet-nib` (the plain `nib` subdomain is probably taken). Then connect GitHub so every push deploys: `vercel git connect`. Open the live URL on a **real phone** and run checks 1 to 11 as far as they apply. Add the live URL to the README line "Live site: coming soon". Commit: `add live link`

## Phase 1 checklist

- [ ] `npm run build` and `npx tsc --noEmit` pass, no console errors
- [ ] Fonts load; wordmark `nib` shows the pointer arrow as the i-dot
- [ ] Window minimize button works; Start menu opens, closes with Esc and link click
- [ ] Theme toggle works and persists after reload with no flash
- [ ] NIB steps 1 to 10 in section 1.6 all pass
- [ ] Live on Vercel; opens on a real phone
- [ ] Commits are plain, lowercase, pushed
