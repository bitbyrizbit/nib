# PHASE 2: STORY, CHARACTER SHEET AND TWO PROJECTS

Read `docs/BRIEF.md`, `docs/plan/00-OVERVIEW.md` and finish Phase 1 first (its checklist must be fully ticked).

## What this phase delivers and why

The content that makes NIB a *portfolio* and not just a cursor toy: the scroll-driven origin story, the five-field character sheet (required by Track 2), and the first two projects, **The Lost & Found** (the emotional center) and **The Pointer Playground** (the proof that NIB's emotions are real). It ends with a footer containing the credits the rules require.

Projects after this phase: 2. The third (Nibble Box) arrives in Phase 3, which is when the site becomes submittable.

## Prompt for this phase

```
Build Phase 2 from docs/plan/PHASE-2.md exactly. Use the copy text in the doc word for word; do not rewrite or add copy.
Every scene and section stays under 150 words. Commit after each numbered step with a plain lowercase message (no prefixes), then push.
Run the checklist at the end and report what passed and what you could not verify. Do not start Phase 3.
```

---

## Step 2.1: Page structure and nav

Update `src/lib/nav.ts`:

```ts
export const NAV: NavItem[] = [
  { id: "hello", label: "hello" },
  { id: "story", label: "story" },
  { id: "projects", label: "projects" },
  { id: "about", label: "about nib" },
];
```

`src/app/page.tsx` renders, in order inside `<main className="main">`: `<Hero />`, `<Story />`, `<Projects />`, `<About />`, then `<Footer />` after `</main>` and before `<Taskbar />`. The visual rhythm must change on purpose: hero is a single big window, story is a full-height sticky stage, projects are an asymmetric cluster of windows of different sizes, about is a narrow centered sheet. Do not make every section the same card.

Commit: `add page sections`

## Step 2.2: The origin story (scroll-driven)

### Behaviour

- Section `#story` is `5 scenes x 90dvh` tall. Inside it, one `position: sticky; top: 0; height: calc(100dvh - var(--taskbar-h))` stage stays on screen while the user scrolls.
- Scroll progress `p` (0 to 1) picks the scene: `scene = min(4, floor(p * 5))`, and `local` is the progress within that scene (0 to 1).
- Left or top: the SVG illustration for the scene. Right or bottom: the scene caption in a window. The caption is real text in the DOM (screen readers read all five scenes, as a list, regardless of scroll position).
- **Do not hijack scroll.** Normal scrolling only. Progress dots (four small bit lights plus a scene counter "scene 2 of 5") are clickable buttons that scroll to that scene, and work with the keyboard.
- Reduced motion: no scroll-linked animation; show all five scenes stacked normally as static cards (use a CSS media query to switch layout and drop the sticky stage).
- NIB grows through the scenes (the four-bit motif): the illustration shows the stage the character has reached.

### Scene copy (use exactly; each is far under 150 words)

| # | Title | Caption |
|---|---|---|
| 1 | 0101 | Before I was a cursor I was four bits. Two off, two on. A nibble. Nobody had clicked me yet, so I just blinked and waited. |
| 2 | first click | Then somebody clicked. Everything got bright and loud. I opened my eyes and there was a whole screen. Hello? |
| 3 | first hover | I found out I can turn into a hand. Over a link I get a hand. I have never been so happy about anything. |
| 4 | first mistake | I followed a link and landed on a 404. Nothing was there. Then I found the others: dead buttons, lonely spinners, an under construction sign nobody finished. |
| 5 | first website | So I gathered them up and built a home. It is a little crooked. Click gently, I'm new here. |

### Illustration spec (SVG, `viewBox="0 0 400 300"`, original art only)

Use the shared NIB polygon from `nibShape.ts` through a small `NibSvg` component so the story NIB is the same character as the cursor.

- Scene 1 (0101): near-black background. Four squares in a row at x = 130, 170, 210, 250 (y = 140, 24x24). Pattern `0101`: squares 2 and 4 are lit (`#ffd23f`), 1 and 3 are dim. Lit squares blink slowly (CSS animation, off under reduced motion).
- Scene 2 (first click): the four squares merge into one rounded yellow blob; two eyes open (animate eyelid height from 0 to full using `local`); a small "click" ring expands once.
- Scene 3 (first hover): NIB (arrow form) next to a blue underlined `link` text. As `local` rises, NIB's body swaps to a hand silhouette (simple CSS/SVG glove shape: rounded rectangle palm with an extended pointer finger) with happy eyes.
- Scene 4 (first mistake): small, dim NIB lost in the middle; floating "404" labels at different angles; a tangled tail. Fewer colours, desaturated.
- Scene 5 (first website): the full NIB in a little window frame ("home.html"), with the six Lost & Found objects (from step 2.3) arranged as furniture around it, and a crooked sign. Warm colours.

Keep each illustration under 80 lines of SVG. Reuse components; do not paste six huge SVG blobs.

### `src/lib/useSceneProgress.ts` (reference)

```ts
"use client";
import { useEffect, useState, type RefObject } from "react";

export function useSceneProgress(ref: RefObject<HTMLElement | null>, scenes: number) {
  const [state, setState] = useState({ scene: 0, local: 0 });
  useEffect(() => {
    let raf = 0;
    const calc = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      const raw = p * scenes;
      const scene = Math.min(scenes - 1, Math.floor(raw));
      setState((s) => (s.scene === scene && Math.abs(s.local - (raw - scene)) < 0.01 ? s : { scene, local: raw - scene }));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(calc); };
    calc();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); };
  }, [ref, scenes]);
  return state;
}
```

### `src/components/nib/NibSvg.tsx` (reference)

```tsx
import { BODY } from "./nibShape";

export default function NibSvg({ size = 80, mood = "idle", x = 0, y = 0, rotate = 0 }: {
  size?: number; mood?: "idle" | "happy" | "sleepy"; x?: number; y?: number; rotate?: number;
}) {
  const s = size / 32;
  const pts = BODY.map(([a, b]) => `${a},${b}`).join(" ");
  const eye = (cx: number, cy: number) =>
    mood === "happy" ? <path d={`M${cx - 1.8} ${cy + 0.8} Q${cx} ${cy - 1.6} ${cx + 1.8} ${cy + 0.8}`} fill="none" stroke="#1c1b18" strokeWidth="0.8" />
    : <><circle cx={cx} cy={cy} r="2.2" fill="#fff" stroke="#1c1b18" strokeWidth="0.8" /><circle cx={cx} cy={cy} r="1" fill="#1c1b18" /></>;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${s})`}>
      <polygon points={pts} fill="#ffd23f" stroke="#1c1b18" strokeWidth="1.5" strokeLinejoin="round" />
      {eye(4.4, 12)}{eye(9.2, 13.3)}
    </g>
  );
}
```

### `src/components/sections/Story.tsx` (structure)

```tsx
"use client";
import { useRef } from "react";
import Window from "@/components/shell/Window";
import { useSceneProgress } from "@/lib/useSceneProgress";
import StageArt from "./StageArt"; // you write this from the illustration spec above

export const SCENES = [
  { title: "0101", text: "Before I was a cursor I was four bits. Two off, two on. A nibble. Nobody had clicked me yet, so I just blinked and waited." },
  { title: "first click", text: "Then somebody clicked. Everything got bright and loud. I opened my eyes and there was a whole screen. Hello?" },
  { title: "first hover", text: "I found out I can turn into a hand. Over a link I get a hand. I have never been so happy about anything." },
  { title: "first mistake", text: "I followed a link and landed on a 404. Nothing was there. Then I found the others: dead buttons, lonely spinners, an under construction sign nobody finished." },
  { title: "first website", text: "So I gathered them up and built a home. It is a little crooked. Click gently, I'm new here." },
];

export default function Story() {
  const ref = useRef<HTMLElement>(null);
  const { scene, local } = useSceneProgress(ref, SCENES.length);
  const go = (i: number) => {
    const el = ref.current; if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.offsetTop + (total * (i + 0.5)) / SCENES.length });
  };
  return (
    <section id="story" ref={ref} className="story" aria-label="NIB's story">
      <div className="story__stage">
        <svg className="story__art" viewBox="0 0 400 300" role="img" aria-label={`Illustration for scene ${scene + 1}: ${SCENES[scene].title}`}>
          <StageArt scene={scene} local={local} />
        </svg>
        <Window title={`story / ${scene + 1} of ${SCENES.length}`}>
          <ol className="story__list">
            {SCENES.map((s, i) => (
              <li key={s.title} className="story__scene" data-active={i === scene}>
                <h2>{s.title}</h2><p>{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="story__dots" role="group" aria-label="Jump to scene">
            {SCENES.map((s, i) => (
              <button key={s.title} type="button" className="tb-btn" aria-label={`Scene ${i + 1}: ${s.title}`} aria-current={i === scene} onClick={() => go(i)}>{i + 1}</button>
            ))}
          </div>
        </Window>
      </div>
    </section>
  );
}
```

Style rules (put in `globals.css`): `.story { height: calc(5 * 90dvh); }`, `.story__stage { position: sticky; top: 0; height: calc(100dvh - var(--taskbar-h)); display: grid; grid-template-columns: 1.2fr 1fr; gap: var(--s5); align-items: center; }`, on screens under 800px the stage becomes one column (art on top at 40% height, caption below). `.story__scene { display: none; }` and `.story__scene[data-active="true"] { display: block; }`. Because inactive scenes are hidden with `display: none`, screen readers would miss them, so for accessibility use a visually-hidden full list (`<ol class="sr-only">`) containing all five captions, and keep the visible list `aria-hidden="true"`. Under reduced motion: `.story { height: auto; } .story__stage { position: static; } .story__scene { display: block; margin-bottom: var(--s5); }` and hide the dots. Add `.sr-only` (1px clip pattern) if not present.

Commit in small steps: `add story scroll`, `add story drawings`, `add story captions`.

## Step 2.3: Project 1: The Lost & Found (emotional center)

### Concept

A window on NIB's "shelf" holding six abandoned web objects it adopted after landing on the 404. Each object is a small interactive item. Clicking an object opens a little note in NIB's voice with an **Adopt** button. Adopted objects get a heart-stamped "adopted" label and move into NIB's home. A counter shows "adopted 2 of 6", saved in `localStorage` key `nib:adopted` (JSON array of ids). This is a real working interaction with persistence. Phase 3 reads the count for cosmetics; Phase 4 may add a global count.

### Maker's mark

Bottom-right corner of the window: a tiny stamp `made by nib · 4 bits`.

### The six objects (art is CSS or SVG, original, drawn small and charming)

| id | Name | Look | NIB's line (use exactly) |
|---|---|---|---|
| dead-link | The Dead Link | Underlined blue "click here!!" with a tiny crack | A link that never went anywhere. It still looks so sure of itself. |
| broken-image | The Broken Picture | The classic empty picture frame with a corner torn | It's missing a picture. I told it I can't see it either, but I believe in it. |
| spinner | The Lost Spinner | A spinning ring that never finishes | It's been loading forever. I sit with it. We are both waiting. |
| construction | The Unfinished Sign | A yellow "under construction" sign with a half-built bar | Somebody was going to finish this. I'm not going to say who. I'll finish it. |
| badge | The 800 by 600 Badge | A small 88x31-style button reading "best viewed at 800x600" | 800 by 600! The whole world fit in it once. It gets very cozy. |
| floppy | The Floppy | A square floppy disk icon labelled "save as" | It remembers things nobody asked it to save. I asked it to remember me. |

Use only original drawings. Do not copy real brand badges or logos. The badge must not mention any real browser or company.

### Behaviour spec

- Items are `<button>`s (focusable, labelled "Open note about The Dead Link").
- Clicking opens a small inline "note" (a nested window) with the name, NIB's line and an `adopt` button. `Esc` or a close button closes it; focus returns to the item.
- Adopt: marks the object adopted, saves to `localStorage` (wrapped in try/catch), updates the counter, plays no sound yet (Phase 3 adds it), dispatches `window.dispatchEvent(new CustomEvent("nib:adopted", { detail: count }))`.
- Already adopted items show a stamp and the note's button becomes a disabled `adopted` label (this makes NIB pout when hovered, which is a nice reuse of the disabled mood).
- A `reset` button (small, in the footer of the window) clears adoption. It is a real working control.
- Responsive: grid of 3 columns on desktop, 2 on tablet, 2 on phone; every item at least 88px tall and 44px wide.

### `src/lib/storage.ts` (reference)

```ts
export function loadJSON<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
}
export function saveJSON(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}
```

Commit in steps: `add lost and found`, `add adopt notes`, `add adopt saving`.

## Step 2.4: Project 2: The Pointer Playground

### Concept

A window that lets visitors **prove every emotion** by poking it. Seven pads, each deliberately triggers one NIB state, plus a live readout of NIB's current state as four bit lights and a hex digit (reuse `BitLights`). It is also the place where NIB's behaviour is explained to a judge without any text lecture.

### Pads (all real, each labelled with a short mono caption)

1. **link pad:** a big button. Hover = curious. Click = the click animation.
2. **reading pad:** a short paragraph (about 20 words; "NIB reads slowly. It moves its eyes along every word and squints a bit."). Hover = read mood.
3. **no-go pad:** a `<button disabled>` styled as a big "locked" key. Hover = pout. Must be a truly disabled button.
4. **stretch pad:** a draggable slider thumb built with pointer events on an element marked `data-nib="drag"`. While dragging the thumb, NIB shows the grab mood (stretch). Dragging changes a visible value 0 to 15 (hex digit 0 to F).
5. **nap pad:** a plain empty box labelled "leave nib alone here for 8 seconds". NIB falls sleepy when idle over it (the global idle timer does this; the pad also shows a countdown while the pointer is still).
6. **typing pad:** a text input labelled "say something to nib". NIB fades out here and the native text cursor appears, because this is `kind: native`. Typed text is shown back in a mono preview.
7. **night pad:** a switch that calls `setTheme`. Demonstrates the mood and palette shift. Uses the same function as the taskbar toggle and stays in sync with it.

Each pad is a small bordered cell in an uneven grid (not six identical cards): vary sizes with CSS grid spans.

### Dragging implementation notes

- Use `setPointerCapture` on pointerdown, track `pointermove`, clamp to the track, release on `pointerup` and `pointercancel`.
- `touch-action: none` on the thumb so touch dragging does not scroll the page.
- Keyboard: the thumb is `role="slider"` with `aria-valuemin=0 aria-valuemax=15 aria-valuenow`, arrow keys change the value by 1, Home and End jump.
- On touch devices the "grab" mood comes from `pointerdown` on the thumb; set `brain.setTarget("drag", rect)` and `brain.down = true` through the existing pointer events (touch `tap` sets down briefly; for drag, call `nib.brain?.pointerDown()` on drag start and `pointerUp()` on end via the `nib` singleton).

Commit in steps: `add playground`, `add playground slider`, `add playground pads`.

## Step 2.5: Projects section layout

`Projects.tsx` is `<section id="projects">` with a heading window and an **asymmetric** desktop-style layout: Lost & Found large on the left (spans about 7 of 12 columns), Playground on the right (5 of 12) and offset downward by 48px; on screens under 900px everything is a single column in source order. Reserve space (do not fake) for the Nibble Box (Phase 3) and Guestbook (Phase 4): do **not** render empty or "coming soon" windows. Add them only when they work.

Commit: `add projects section`

## Step 2.6: About nib (the 5-field character sheet)

`About.tsx`, `<section id="about">`, a narrow centered window titled `nib.txt`. Layout is a form-like sheet (label column plus value column), not cards. Use this copy exactly:

- **Name:** NIB
- **What it is:** A baby cursor. A soft arrow with a lopsided tip, two big eyes and a tail that never sits still. Four bits old. Curious, clumsy, sincere and easily excited.
- **What it does:** Makes tiny web toys and tools, and adopts abandoned pieces of the internet.
- **Its story:** Born as a nibble in the dark. Learned to click, learned to love links, got lost on a 404, then built a home from what it found. Scroll up to watch it happen.
- **Tagline:** Click gently. I'm new here.

Footer line under the sheet in small mono text: `Small point. Big ideas.` Commit: `add character sheet`

## Step 2.7: Footer and credits

`Footer.tsx`:

- Three original 88x31 style link buttons made with CSS (not copies of anyone's logo): `made with nib`, `4 bits`, `click gently`. They are purely decorative; mark them `aria-hidden="true"` or make them real links to sections. **No dead links.**
- A "credits" list: Fonts: Bagel Fat One, Pixelify Sans, VT323 (SIL Open Font License, via Google Fonts). Built with Next.js and React. All character art and drawings: original, made with SVG, CSS and canvas. Audio (added in Phase 3): synthesised in the browser with the Web Audio API. Link to the GitHub repo.
- Update `CREDITS.md` to match exactly.

Commit: `add footer and credits`

## Step 2.8: Mobile pass for everything built so far

Test at 360x640, 390x844, 768x1024 and 1280x720:
- No horizontal scrollbar anywhere.
- Story is readable and the sticky stage fits above the taskbar (`dvh`, not `vh`).
- All buttons at least 44x44px.
- NIB touch mode wanders without covering reading text for long (it is `pointer-events: none`, but make sure it does not park exactly over the story caption; if it does, bias `wy` away from the caption region on small screens).
- Playground slider drags with a finger without scrolling the page.

Commit: `fix phone layout`

## Phase 2 checklist

- [ ] Five story scenes with the exact copy, each under 150 words, scroll-driven with working jump buttons
- [ ] Reduced motion shows all scenes statically; no console errors
- [ ] Lost & Found: six objects, notes open and close, adopt persists after reload, counter correct, reset works
- [ ] Playground: all 7 pads trigger the intended NIB moods and BitLights update
- [ ] Slider is keyboard operable and drags on touch without scrolling
- [ ] Character sheet has all 5 fields; footer credits match `CREDITS.md`
- [ ] No horizontal scroll at 360px; deployed and checked on a real phone
- [ ] Commits plain, lowercase, pushed
