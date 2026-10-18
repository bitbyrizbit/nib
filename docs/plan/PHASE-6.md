# PHASE 6: GIFTS AND SURPRISES (take NIB home, dial-up, arpeggios)

Branch: `gifts`. Read `docs/plan/00-EXTRAS.md` first.

## Goal and why

The rubric gives 20% to creativity and surprises. These are three small, safe features that give visitors something to *keep* and *play with*: NIB as a downloadable cursor and image, a dial-up modem handshake toy that honestly pings the real backend, and small musical flourishes. Everything is user-triggered, respects mute, and touches no core engine code.

---

## Step 6.1: "Take NIB home" (SVG, PNG and a real Windows cursor)

### Where

A new window `take_nib_home.exe` placed at the end of the About section (below the character sheet). Add `{ id: "take-home", label: "take nib home" }` to `NAV` and give the window that id.

### What it offers (all real working buttons)

1. **Download SVG** (vector, any size)
2. **Download PNG** at 256 px, with a small size choice (64, 128, 256)
3. **Download cursor (.cur)**, Windows only, 32 by 32, hotspot at the tip
4. A short helper text: for Windows: Settings, Bluetooth and devices, Mouse, Additional mouse settings, Pointers tab, Browse, pick the file. For websites: `cursor: url("nib.png") 1 1, auto;` (copy button for that snippet). macOS does not use `.cur` files, so say so honestly and point Mac users to the PNG/SVG.

Preview: show the real NIB (use the existing `NibSvg`), 120 px.

### Code

`src/lib/takeHome.ts`:

```ts
import { BODY } from "@/components/nib/nibShape";

export function nibSvg(size = 256): string {
  const pts = BODY.map(([x, y]) => `${x + 1},${y + 1}`).join(" ");
  const ink = "#1c1b18";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.round((size * 34) / 24)}" viewBox="0 0 24 34">` +
    `<polygon points="${pts}" fill="#ffd23f" stroke="${ink}" stroke-width="1.5" stroke-linejoin="round"/>` +
    `<g stroke="${ink}" stroke-width="0.8"><circle cx="5.4" cy="13" r="2.2" fill="#fff"/><circle cx="10.2" cy="14.3" r="2.2" fill="#fff"/></g>` +
    `<circle cx="5.4" cy="13" r="1" fill="${ink}"/><circle cx="10.2" cy="14.3" r="1" fill="${ink}"/>` +
    `<path d="M6.8 17.6 Q7.8 18.7 8.8 17.6" fill="none" stroke="${ink}" stroke-width="0.8" stroke-linecap="round"/></svg>`;
}

export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function renderPixels(w: number, h: number): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(new Blob([nibSvg(h)], { type: "image/svg+xml" }));
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0, Math.round((h * 24) / 34), h);
      URL.revokeObjectURL(url);
      resolve(ctx.getImageData(0, 0, w, h));
    };
    img.onerror = () => reject(new Error("render failed"));
    img.src = url;
  });
}

export async function pngBlob(size: number): Promise<Blob> {
  const h = size, w = Math.round((size * 24) / 34);
  const img = await renderPixels(w, h);
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  c.getContext("2d")!.putImageData(img, 0, 0);
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("png failed"))), "image/png"));
}

export async function curBlob(): Promise<Blob> {
  const w = 32, h = 32;
  const px = (await renderPixels(w, h)).data;
  const xorSize = w * h * 4;
  const maskRow = Math.ceil(w / 32) * 4;
  const maskSize = maskRow * h;
  const dibSize = 40 + xorSize + maskSize;
  const buf = new ArrayBuffer(22 + dibSize);
  const dv = new DataView(buf);
  dv.setUint16(0, 0, true); dv.setUint16(2, 2, true); dv.setUint16(4, 1, true);
  dv.setUint8(6, w); dv.setUint8(7, h); dv.setUint8(8, 0); dv.setUint8(9, 0);
  dv.setUint16(10, 1, true); dv.setUint16(12, 1, true);
  dv.setUint32(14, dibSize, true); dv.setUint32(18, 22, true);
  let o = 22;
  dv.setUint32(o, 40, true); dv.setInt32(o + 4, w, true); dv.setInt32(o + 8, h * 2, true);
  dv.setUint16(o + 12, 1, true); dv.setUint16(o + 14, 32, true);
  dv.setUint32(o + 20, xorSize + maskSize, true);
  o += 40;
  for (let y = h - 1; y >= 0; y--) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      dv.setUint8(o++, px[i + 2]); dv.setUint8(o++, px[i + 1]); dv.setUint8(o++, px[i]); dv.setUint8(o++, px[i + 3]);
    }
  }
  return new Blob([buf], { type: "image/x-icon" });
}
```

The window component calls `download(new Blob([nibSvg(512)], { type: "image/svg+xml" }), "nib.svg")`, `download(await pngBlob(size), "nib.png")` and `download(await curBlob(), "nib.cur")` from button handlers, each in `try/catch` with a visible status message ("downloaded", or "couldn't make that file, try the PNG") and `role="status"`.

### Honesty check (mandatory)

The `.cur` format above uses a standard 32-bit BMP cursor image with the hotspot at (1, 1). **You must test the downloaded `nib.cur` on a real Windows machine** (set it as the pointer through the Mouse settings, check the tip lands on what you click). If it does not load or the hotspot is off, fix the offsets, or **remove the `.cur` button entirely** and ship SVG and PNG only. Never ship a button that gives a broken file. Add to `CREDITS.md` that NIB's art is free to use as a cursor image for personal use (state the MIT licence applies).

Commit: `add take nib home`, `add cursor download`

---

## Step 6.2: Dial-up (a toy that pings the real backend)

### Concept

A Start menu item `dial up...` opens a small retro window. It plays an approximation of a 1990s modem handshake (touch-tone dialing, an answer tone, warbling data bursts and a hiss sweep, about 6 seconds, synthesised) while a progress bar steps through real-feeling stages: `dialing`, `handshake`, `checking nib` and `connected`. During `checking nib` it **actually calls `/api/stats`** and `connected` shows the real visitor count (or an honest "connected, offline mode" if the backend is not reachable or in demo mode). The sound never plays by itself; it starts only when the visitor presses the item. It must never delay anything else.

### Audio code (add to `src/lib/audio.ts`)

```ts
function noise(t0: number, dur: number, lo: number, hi: number, gain: number) {
  if (!ctx || !master) return;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 2;
  bp.frequency.setValueAtTime(lo, t0);
  bp.frequency.linearRampToValueAtTime(hi, t0 + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
  src.connect(bp).connect(g).connect(master);
  src.start(t0);
  src.stop(t0 + dur);
  live.add(src);
  src.onended = () => live.delete(src);
}

const DTMF: Record<string, [number, number]> = {
  "1": [697, 1209], "2": [697, 1336], "3": [697, 1477], "4": [770, 1209], "5": [770, 1336],
};

export function playDialup(): number {
  if (muted) return 0;
  const c = ensure();
  if (!c) return 0;
  const start = c.currentTime + 0.05;
  let t = start;
  for (const digit of "5551234") {
    const [a, b] = DTMF[digit];
    tone(a, t, 0.09, { type: "sine", gain: 0.06 });
    tone(b, t, 0.09, { type: "sine", gain: 0.06 });
    t += 0.14;
  }
  t += 0.5;
  tone(2100, t, 0.9, { type: "sine", gain: 0.05 });
  t += 1.0;
  for (let i = 0; i < 24; i++) { tone(i % 2 ? 2250 : 1200, t, 0.07, { type: "sine", gain: 0.05 }); t += 0.075; }
  noise(t, 1.6, 800, 3500, 0.12);
  for (let i = 0; i < 14; i++) tone(1000 + Math.random() * 1600, t + i * 0.11, 0.05, { type: "square", gain: 0.03 });
  return t + 1.6 - start;
}
```

### UI (`src/components/shell/DialDialog.tsx`)

Use a native `<dialog>` (like the Easter egg) with a `<progress>` bar and a `role="status"` text line. Behaviour:
- Opens from a new button in the Start menu (a `<button>`, not a link, labelled `dial up...`). In `Taskbar.tsx` render the button after the nav links, and close the menu when pressed.
- On open: call `playDialup()` (if muted, show the line `sound is off. turn it on to hear the modem.` and run the same steps silently).
- Steps on timers: `dialing...` (0 to 1.5 s), `handshake...` (1.5 to 4.3 s), `checking nib...` (4.3 s, call `fetch("/api/stats", { cache: "no-store" })` at this point), `connected.` at about 6 s. When connected show `you are visitor no. N` if the response is real, `connected (offline mode)` if the fetch failed, and `connected (demo mode)` if `demo` is true. Never invent a number.
- On `connected`, make NIB happy (`nib.brain?.pointerDown(); nib.brain?.pointerUp();`) and say the voice line `we're online.`.
- Closing (button or Esc) calls `stopAll()` and clears all timers. The dialog works fully by keyboard.

Commit: `add dial up sound`, `add dial up window`

---

## Step 6.3: Arpeggio flourishes

Add two sounds to `audio.ts`:

```ts
// extend the Sfx type: "shake" | "copied"
else if (name === "shake") [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => pluckAt(f, t + i * 0.06));
else if (name === "copied") { pluckAt(783.99, t); pluckAt(1046.5, t + 0.08); }
```

Call `play("shake")` in the Nibble Box `shake` handler and `play("copied")` when the link was copied successfully. Both respect mute automatically (`play` returns early when muted).

Commit: `add box sounds`

---

## Verify

1. Take NIB home: SVG opens in a browser and looks right at 512px; PNGs at 64, 128 and 256 are crisp with transparency; the `.cur` loads on a real Windows machine with the tip on the click point (otherwise the button is removed).
2. Dial-up: silent until pressed; about 6 seconds; the progress steps match the sound; the visitor number shown matches what the footer odometer says; Esc stops the sound immediately; muted shows the silent version with the honest message.
3. Mute silences dial-up and the arpeggios; reload keeps the mute state.
4. Reduced motion and keyboard paths work; no console errors; mobile layout fine (the new window does not overflow at 360px).
5. `npm run build` passes; real phone check; merge and deploy.
