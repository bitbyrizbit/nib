# nib

> Click gently. I'm new here.

NIB is a baby cursor with a big portfolio, built in 48 hours for the haX.baby **"Baby's First Website"** hackathon (Track 2: Your Own Baby).

**Live site:** [https://meet-nib.vercel.app/](https://meet-nib.vercel.app/)

---

## The Concept

**The character is the website.** NIB is a newborn cursor ("4 bits old / a nibble") discovering the internet one click at a time. After getting lost on a 404 error page, NIB gathered up abandoned pieces of the web and built a crooked, cozy 1999-desktop home.

### Character Sheet (Track 2)
1. **Name:** NIB
2. **What it is:** A baby cursor. A soft arrow with a lopsided tip, two big eyes and a tail that never sits still. Four bits old. Curious, clumsy, sincere and easily excited.
3. **What it does:** Makes tiny web toys and tools, and adopts abandoned pieces of the internet.
4. **Its story:** Born as a nibble in the dark. Learned to click, learned to love links, got lost on a 404, then built a home from what it found.
5. **Tagline:** *Click gently. I'm new here.*

---

## Features

- **Living NIB Cursor:** Custom full-screen `<canvas>` engine with spring physics and Verlet-tail mechanics. The tip is locked to the real pointer with 0 lag/smoothing for crisp immediate clicks. Transitions across 8 distinct moods (`idle`, `curious`, `read`, `happy`, `pout`, `grab`, `sleepy`, `asleep`).
- **Touch & Accessibility Support:** Autonomous wandering mode on touch devices that follows taps; full keyboard `Tab` navigation; complete `prefers-reduced-motion` compliance.
- **Scroll-Driven Origin Story:** 5-scene origin story with sticky stage, custom SVG illustrations, and an interactive scroll-synced journey route (`StoryRoute`).
- **Project 1 — The Lost & Found:** 6 adoptable abandoned web artifacts (broken picture, dead link, 800x600 badge, etc.) with stories, heart stamps, adoption counter, and `localStorage` persistence.
- **Project 2 — Pointer Playground:** 7 interactive pads proving every emotion (draggble stretch slider, sleep countdown pad, text typing pad with native cursor restoration, etc.).
- **Project 3 — The Nibble Box:** 4-step, 4-bit Web Audio synthesizer and music box. Features pentatonic scale plucks, tempo slider, randomize, and URL shareable patterns (`/#box=XXXX`).
- **Web Audio Engine & Global Mute:** Synthesized browser sound effects with a master mute toggle that immediately silences every oscillator, click sound, music box, and Easter egg.
- **Hidden Easter Egg:** Click the "Hello, my name is NIB" sticker 4 times to unlock NIB's first-ever message with falling bit rain and a synthesized lullaby.
- **Sparkle Bit Trail & Adopt Cosmetics:** Fast cursor movement leaves a trail of binary bits; adopting objects rewards NIB with a tail bow and pink trail.
- **Daylight & Dial-up Night Themes:** Retro beige plastic vs. glowing phosphor green night mode with zero flash.

---

## How to Run Locally

```bash
# Clone the repository
git clone https://github.com/bitbyrizbit/nib.git
cd nib

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Credits
See [CREDITS.md](CREDITS.md) for full licensing, font attribution, and tech stack details.