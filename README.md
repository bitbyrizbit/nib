# nib

> click gently. i'm new here.

NIB is a baby cursor living in the interface itself. The tip of the arrow is your real pointer, so whenever you click on this site, you are holding NIB.

Built for the haX.baby hackathon (Track 2: original character).

Live site: [meet-nib.vercel.app](https://meet-nib.vercel.app)

---

## the backstory

The hackathon theme asked for "Baby's First Website". Most projects build a site for an infant, or style a page like a toddler drew on it with crayons.

I wanted the baby to be the thing you use to touch the web: the pointer itself. NIB was born four bits old (half a byte, a nibble) inside an empty 640 by 480 viewport. It learned what a link was, got lost on a broken page, collected abandoned 90s web artifacts, and built a crooked desktop home out of what it found.

---

## what makes nib alive

NIB is drawn on a full-screen canvas sitting right on top of the DOM. Its tip is locked to your mouse coordinates with zero smoothing and zero delay, so clicks always land on the exact pixel you intended.

Behind that locked tip, everything else breathes:
- A spring simulation drives NIB's body squash, stretch, and lean angles based on pointer velocity.
- A seven-segment Verlet integration tail curls and drags naturally behind the arrow as you move.
- A mood state machine switches between nine distinct emotional states (idle, curious, reading, happy, pouting, grab, sleepy, asleep, and flinching) based on what you hover and how you click.
- Four mood bits light up in real time to show NIB's internal 4-bit state in binary and hexadecimal.
- An amber nightlight mode dims the screen into a flashlight halo that follows NIB, revealing hidden constellation doodles drawn across the background.
- A trust system measures your click cadence. Clicking slowly and gently builds trust (+3), while clicking four times in 1.5 seconds makes NIB flinch and lose trust (-6).

All visitor memory and trust are kept strictly inside your own browser's local storage. Nothing about your session, clicks, or name is ever transmitted to an analytics service or server.

---

## the three toys inside

### lost & found
Six abandoned relics of the early web (an 800x600 resolution badge, an under construction barrier, a hit counter, a guestbook quill, a dead link, and a 3.5-inch floppy disk). You can adopt them to clean up the screen. Adopting three puts a pink bow on NIB's tail; adopting all six gives NIB a pink binary particle trail.

### pointer playground
Seven interactive test pads that let you verify every mood and edge case: link gravity, reading text, locked button pout, drag-and-drop, the 8-second yawn and 20-second nap, dizzy scroll reaction, and the amber nightlight toggle.

### nibble box
A four-step pentatonic music box synthesized with the Web Audio API. Each step is four bits, so an entire melody fits in two bytes (four hex characters). Clicking the step buttons lets you write a loop and copy a shareable link formatted as `#box=XXXX`.

---

## guestbook and live counter

Under the retro shell is a real backend connected to Upstash Redis:
- A live visitor odometer that increments atomically on each visit.
- A guestbook wall where visitors can post short notes with an emotion tag.
- Same-origin checks, IP sliding-window rate limiting, honeypot fields, and obscenity filtering.
- Automatic demo-mode fallback if Redis environment variables are absent, so the site never crashes in local evaluation.

---

## try this

A few quiet details built into the interface:

1. **Switch tabs for 20 seconds.** The tab title and favicon tell a story while you are away (lonely, then hiding, then asleep). When you return, NIB gives a greeting based on how long you were gone.
2. **Click empty space four times rapidly.** NIB flinches with squeezed eyes, hops back, and asks "ow. gently?".
3. **Click gently.** Spacing out your clicks increases NIB's trust meter in the taskbar and unlocks five entries in `nib_diary.txt`.
4. **Type the Konami code.** Press `Up Up Down Down Left Right Left Right B A` on your keyboard to trigger turbo mode.
5. **Turn on night mode.** Toggle the lamp button in the taskbar. NIB turns into an amber nightlight that illuminates hidden ink drawings.
6. **Take NIB home.** Open `take_nib_home.exe` to download NIB as a vector SVG, crisp PNG (up to 1024px), or a native `.cur` cursor file for Windows mouse settings.
7. **Dial up the internet.** Open the Start menu (`nib ▸`) and choose `dial up...` to hear a procedural 56k modem handshake sound generated through Web Audio oscillators.
8. **Check accessibility.** Append `?fx=0` to the URL to disable all motion, tilts, and canvas effects. Screen readers receive semantic landmarks, alt text, and ARIA live regions throughout.

---

## technical honesty

- **Framework:** Next.js 16.4.2 (App Router), React 19, Turbopack.
- **Styling:** Vanilla CSS using CSS variables and semantic design tokens. No Tailwind, no CSS-in-JS runtime.
- **Physics and Graphics:** Hand-written HTML5 Canvas engine (~350 lines in `nibBrain.ts` and ~250 lines in `nibRenderer.ts`). Zero animation libraries.
- **Audio:** 100% synthesized in the browser using the Web Audio API. There are 0 audio files, 0 MP3s, and 0 external sound samples.
- **Storage and Privacy:** Visitor visits, adopted artifacts, and trust levels live exclusively in browser `localStorage`. A "forget me" button in the footer wipes everything cleanly.
- **Utility scripts:** `scripts/make-og.js` is an offline build helper used to generate the static social preview image `public/og.png` via sharp.

---

## run locally

```bash
# Clone the repository
git clone https://github.com/bitbyrizbit/nib.git
cd nib

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To connect your own Upstash Redis instance for the guestbook and counter, copy `.env.example` to `.env.local` and add your REST credentials. If left unset, the backend automatically runs in in-memory demo mode.

---

## license

MIT. All code, design, audio synthesis, and character artwork are original and open source. See [CREDITS.md](CREDITS.md) for full font licenses and dependency details.