# PHASE 12: NIB COMES WITH YOU (the companion window)

Branch: `companion`. Read `docs/plan/00-EXTRAS.md` and finish Phase 11 first. **Optional**: only start with at least 4 hours before the feature freeze.

## The idea, and what the browser really allows

The idea: when you switch to another site, NIB shows up there, shy and a little sad that you did not choose it.

**A web page cannot draw on other websites or on your screen outside its own tab.** Browsers forbid it for security, and no trick gets around that. What is possible, with the visitor's permission, is a small always-on-top window made by the **Document Picture-in-Picture API** (Chrome and Edge on desktop, version 116 and later). The visitor presses a button, and NIB gets its own tiny floating window that stays above every other app and site. In it, NIB hides a little at the bottom edge, shy. If the visitor hovers it, NIB comes out happy and follows the pointer. When the visitor is on another tab, NIB looks sad and says it. When the visitor comes back, NIB cheers. That delivers the feeling you described, honestly and with consent.

Rules for this phase:
- Opened **only by a click** (the browser requires a user gesture anyway). Never automatic.
- The button exists **only when the browser supports it** (feature detection). Other browsers see nothing broken.
- All of it is loaded with a dynamic `import()` on click, so it adds nothing to the first page load and cannot break the main site.
- No audio in the companion window. No data leaves the browser.

## Prompt

```
Do Phase 12 from docs/plan/PHASE-12.md. Reference code was written without being run: run npx tsc --noEmit and npm run lint, fix errors and tell me what you changed.
The companion must never be required for anything, must be feature-detected, must be lazy loaded, and must not change how the main page behaves.
Commit after each step with a plain lowercase message (no prefixes) and push. Report what you could not test (it needs Chrome or Edge on desktop).
```

---

## Step 12.1: Brain support (rest position and sadness)

Add to `NibBrain`:

```ts
sad = false;

rest(x: number, y: number) {
  this.wx = x; this.wy = y;
  this.nextWander = this.now + 1e9;
}
```

In the eyes block of `update`, after the look vector is computed: `if (this.sad) { lx = 0; ly = 1; }` (pupils look down).

In `nibRenderer.ts`, when `b.sad` is true and the mood is `idle` or `sleepy`, draw the sad face: eyebrows slanted with the inner ends raised, a small frown, and a tear.

```ts
if (b.sad && (m === "idle" || m === "sleepy")) {
  ctx.strokeStyle = line; ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(EYES[0].x - 2, EYES[0].y - 3); ctx.lineTo(EYES[0].x + 1.6, EYES[0].y - 3.8);
  ctx.moveTo(EYES[1].x - 1.6, EYES[1].y - 3.8); ctx.lineTo(EYES[1].x + 2, EYES[1].y - 3);
  ctx.stroke();
  ctx.fillStyle = "#6fc3ff";
  ctx.beginPath(); ctx.ellipse(EYES[0].x - 0.8, EYES[0].y + 3.4, 0.5, 0.9, 0, 0, Math.PI * 2); ctx.fill();
}
```

and make the mouth a frown for the sad case (`quadraticCurveTo(mx, my - 1, mx + 1, my)` from `mx - 1, my`). Check the main site is unchanged (sad is false by default). Commit: `add sad nib`

## Step 12.2: The companion module

### `src/lib/companion.ts`

```ts
import { NibBrain } from "@/components/nib/nibBrain";
import { drawNib } from "@/components/nib/nibRenderer";

type DocPip = { requestWindow(o?: { width?: number; height?: number }): Promise<Window>; window: Window | null };
const api = () => (typeof window === "undefined" ? undefined : (window as unknown as { documentPictureInPicture?: DocPip }).documentPictureInPicture);

export const companionSupported = () => !!api();

function bubble(ctx: CanvasRenderingContext2D, text: string, w: number) {
  ctx.save();
  ctx.font = "14px monospace";
  const pad = 8;
  const bw = Math.min(w - 16, ctx.measureText(text).width + pad * 2);
  ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#1c1b18"; ctx.lineWidth = 2;
  ctx.fillRect(8, 8, bw, 26); ctx.strokeRect(8, 8, bw, 26);
  ctx.fillStyle = "#1c1b18"; ctx.fillText(text, 8 + pad, 26);
  ctx.restore();
}

export async function openCompanion(onClose: () => void): Promise<boolean> {
  const dpip = api();
  if (!dpip) return false;
  if (dpip.window) return true;

  let pip: Window;
  try { pip = await dpip.requestWindow({ width: 280, height: 200 }); } catch { return false; }

  const doc = pip.document;
  doc.title = "nib";
  doc.body.style.cssText = "margin:0;overflow:hidden;";
  const canvas = doc.createElement("canvas");
  canvas.style.cssText = "display:block;width:100vw;height:100vh;";
  doc.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) { pip.close(); return false; }

  const brain = new NibBrain();
  brain.reduced = pip.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let w = 0, h = 0;
  const resize = () => {
    const dpr = Math.min(pip.devicePixelRatio || 1, 2);
    w = pip.innerWidth; h = pip.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    brain.resize(w, h);
  };
  resize();
  brain.setMode("touch");
  const hide = () => { brain.setMode("touch"); brain.inside = true; brain.rest(w * 0.62, h - 34); };
  hide();

  const onMove = (e: PointerEvent) => { brain.setMode("mouse"); doc.body.style.cursor = "none"; brain.pointerMove(e.clientX, e.clientY); };
  const onDown = () => brain.pointerDown();
  const onUp = () => brain.pointerUp();
  const onLeave = () => { doc.body.style.cursor = "auto"; hide(); };
  pip.addEventListener("resize", resize);
  pip.addEventListener("pointermove", onMove);
  pip.addEventListener("pointerdown", onDown);
  pip.addEventListener("pointerup", onUp);
  doc.documentElement.addEventListener("pointerleave", onLeave);

  let raf = 0;
  let last = pip.performance.now();
  let hiddenSince = 0;
  let backUntil = 0;
  const frame = (t: number) => {
    raf = pip.requestAnimationFrame(frame);
    const dt = (t - last) / 1000; last = t;
    const now = performance.now();
    if (document.hidden && !hiddenSince) hiddenSince = now;
    if (!document.hidden && hiddenSince) { hiddenSince = 0; backUntil = now + 3000; }
    const night = document.documentElement.dataset.theme === "night";
    brain.night = night;
    brain.sad = document.hidden;
    doc.body.style.background = night ? "#120d09" : "#b7cf9b";
    brain.update(dt);
    ctx.clearRect(0, 0, w, h);
    drawNib(ctx, brain);
    if (hiddenSince) bubble(ctx, now - hiddenSince < 6000 ? "you picked another tab." : "it's okay. i'm over here.", w);
    else if (now < backUntil) bubble(ctx, "yay. you're back.", w);
  };
  raf = pip.requestAnimationFrame(frame);

  pip.addEventListener("pagehide", () => { pip.cancelAnimationFrame(raf); onClose(); });
  return true;
}
```

Notes for the build agent: the companion runs its own `NibBrain` and loop in the floating window's own document, using `pip.requestAnimationFrame` (the main page's loop pauses when its tab is hidden, which is exactly when the companion matters). `drawNib` uses a VT323 font for the sleeping `z`; in the floating window that font is not loaded, and the canvas falls back to monospace, which is fine. `brain.inside = true` must be public (it already is). If TypeScript complains about the `Window` types on `pip`, cast narrowly and keep the code safe; do not add `any` outside this file.

Commit: `add companion window`

## Step 12.3: The button

- In `Taskbar.tsx`, in the Start menu after `dial up...`, show a button `take nib with you` **only if `companionSupported()` is true** (check in an effect after mount so server and client markup match; render nothing until then). Under it, a small line: `nib sits in a small window above your other apps. close it any time.`
- Handler (call it directly inside the click so the browser sees the user gesture):

```tsx
const [pip, setPip] = useState(false);
const [note, setNote] = useState("");

const onCompanion = async () => {
  const { openCompanion } = await import("@/lib/companion");
  const ok = await openCompanion(() => setPip(false));
  setPip(ok);
  setNote(ok ? "" : "couldn't open it here.");
  setMenu(false);
};
```

If your browser complains that the dynamic import used up the gesture, import the module once on first hover or focus of the Start button (`import("@/lib/companion")` without calling it) so that the click handler can call `openCompanion` immediately.
- While the window is open, change the button label to `nib is with you` and make it disabled.
- Also add the same button to the `take_nib_home.exe` window under the downloads, so people who download NIB can also keep it on screen.
- Update the README "Try this" list: `On desktop Chrome or Edge, use the Start menu and "take nib with you", then switch tabs.` and the honesty note: `Browsers do not let a page appear on other websites, so NIB uses an opt-in floating window (Document Picture-in-Picture) instead.`

Commit: `add companion button`

---

## Verify (needs desktop Chrome or Edge)

1. In Chrome or Edge, the Start menu shows `take nib with you`; in Firefox or Safari it does not appear and nothing is broken.
2. Press it: a small window opens above other apps with NIB peeking at the bottom edge, shy.
3. Hover NIB's window: NIB comes out and follows the pointer, the click squash works, the native cursor is hidden inside it. Move away: NIB goes back to peeking.
4. Switch to another tab or site: NIB looks sad and says `you picked another tab.` then, after 6 seconds, `it's okay. i'm over here.`. Come back: `yay. you're back.` for 3 seconds.
5. Leave it alone for a while: NIB gets sleepy and falls asleep.
6. Toggle day or night in the main page: the companion's background and glow follow.
7. Close the companion window: the button returns to `take nib with you`; open it again; reload the main page: the companion closes cleanly and the main page has no errors.
8. Reduced motion: no wandering or bounce in the companion. `?fx=0`: the main site's effects are off; the companion still works if opened.
9. The main page console is clean; `npm run build` passes; first-load bundle size did not grow (the module is lazy).
10. Merge only if all of this works; otherwise delete the branch. The submitted site must be exactly as safe as before.

## Not now (after the hackathon)

A small browser extension could place NIB on any website. It needs separate packaging and store review, and it cannot be built safely in the remaining time. Mention it in the write-up as "what's next" if you like.

Feature freeze: 3 hours before 19 Oct 2026, 17:17 IST.
