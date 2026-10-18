# nib

> Click gently. I'm new here.

NIB is a baby cursor: a newborn pointer discovering the internet, one click at a time.  
Built for the **haX.baby "Baby's First Website"** hackathon (Track 2: Your Own Baby).

**Live Site:** [https://meet-nib.vercel.app/](https://meet-nib.vercel.app/)

---

## Try This (60 Seconds)

1. **Move your mouse:** That arrow is NIB, and its tip is locked to your real pointer with zero lag or smoothing.
2. **Hover around:** Hover a link, a text paragraph, then a locked button. NIB reacts with unique facial expressions and posture for each.
3. **Click anywhere:** Watch the squash, bounce, and lean physics.
4. **Scroll the story:** Scroll down to watch NIB grow from four blinking binary bits into a full living cursor.
5. **Explore the projects:**
   - **Lost & Found:** Adopt 6 abandoned relics of the 90s web.
   - **Pointer Playground:** Test every mood pad (stretch the slider, wait for a nap, type to NIB).
   - **Nibble Box:** A 4-step, 4-bit Web Audio synth. Click pads to make a tune and copy a shareable `#box=XXXX` URL.
   - **Live Guestbook:** Sign the persistent sticky-note wall with an emotion.
6. **Find the hidden Easter egg:** Click the "Hello, my name is NIB" sticker 4 times rapidly.
7. **Mobile:** On touch devices, NIB autonomously wanders and walks to wherever you tap.  
   *(iPhone note: turn off hardware silent switch to hear audio, and tap once to start).*

---

## Character Sheet (Track 2: Original Baby)

- **Name:** NIB
- **What it is:** A baby cursor. A soft arrow with a lopsided tip, two big eyes, and a tail that never sits still. Four bits old (half a byte / a nibble). Curious, clumsy, sincere, and easily excited.
- **What it does:** Makes tiny web toys and tools, and adopts abandoned pieces of the internet.
- **Its story:** Born as a nibble in the dark (`0101`). Learned to click, learned to love links, got lost on a 404, then built a crooked desktop home from what it found.
- **Tagline:** *Click gently. I'm new here.*

---

## What is Real (Zero Faking)

- **Hand-written Canvas Physics Engine:** Real-time spring physics, Verlet-tail simulation, and mood state machine. Built entirely with vanilla TypeScript and HTML5 Canvas — zero animation frameworks or UI kits.
- **Web Audio API Synth:** Procedural audio synthesis without any audio files, MP3s, or external sound samples. Features a master mute switch that silences all sources.
- **Real Upstash Redis Backend:** Live atomic visitor counter, secret-finder milestone tracker, and guestbook wall with rate limiting and profanity protection. Runs in an in-memory fallback demo mode if credentials are unset.
- **Aliveness & Local Memory:** NIB remembers returning visitors and greets them by name using the browser's local storage. Nothing is sent anywhere. Includes an interactive `forget me` button in the footer to reset all stored state at any time.

---

## How the Backend Works

Next.js Route Handlers powered by Upstash Redis (REST):
- **Atomic Counters:** Real-time visitor counts and secret-finder milestones incremented atomically via Redis `INCR`.
- **Visitor Deduplication:** 30-minute unique window tracking via IP hashes.
- **Abuse & Spam Protection:**
  - Same-origin header validation.
  - Hidden honeypot trap and minimum human typing threshold (`t >= 2500ms`).
  - Profanity filtering with the `obscenity` engine.
  - Spam URL detection rejecting external links.
  - IP sliding-window rate limiting via `@upstash/ratelimit`.
- **Admin Moderation:** Timing-safe authenticated delete endpoint (`timingSafeEqual`) to prune abusive entries.

---

## Run Locally

```bash
# Clone the repository
git clone https://github.com/bitbyrizbit/nib.git
cd nib

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.  
*(Optional: copy `.env.example` to `.env.local` to connect your own Upstash database; without it, the app automatically runs in demo mode).*  
*(Note: `scripts/make-og.js` is a build utility that generated the static `public/og.png` social card via sharp).*

---

## Credits & License
See [CREDITS.md](CREDITS.md) for full licensing, open font attributions, and stack details.