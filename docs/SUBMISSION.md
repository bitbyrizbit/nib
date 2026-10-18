# NIB — haX.baby Hackathon Submission Pack

## 1. Project Information
- **Project Name:** NIB
- **Tagline:** *Click gently. I'm new here.*
- **Track:** Track 2 (Your Own Baby / Original Character)
- **Live Deployment:** [https://meet-nib.vercel.app/](https://meet-nib.vercel.app/)
- **GitHub Repository:** [https://github.com/bitbyrizbit/nib](https://github.com/bitbyrizbit/nib)

---

## 2. Character Sheet (Track 2)
- **Name:** NIB
- **What it is:** A baby cursor. A soft arrow with a lopsided tip, two big eyes, and a tail that never sits still. Four bits old (half a byte / a nibble). Curious, clumsy, sincere, and easily excited.
- **What it does:** Makes tiny web toys and tools, and adopts abandoned pieces of the internet.
- **Its story:** Born as a nibble in the dark (`0101`). Learned to click, learned to love links, got lost on a 404, then built a cozy crooked desktop home from what it found.
- **Tagline:** *Click gently. I'm new here.*

---

## 3. The Story Write-Up (Submission Essay)

> Most website characters live *inside* the page. NIB is the interface itself.
>
> The tip of NIB is locked to your actual hardware pointer with zero lag or smoothing, so when you click, you are literally holding NIB by the hand. The haX.baby theme ("Baby's First Website") inspired a simple question: what if a baby cursor had to build its own first website out of the bits and scraps it found while learning to click?
>
> NIB is four bits old — a nibble. That 4-bit motif is woven throughout the entire experience:
> 1. Four telemetry bits light up on the screen in real-time to reflect NIB's mood state.
> 2. The **Nibble Box** is a 4-step, 4-bit Web Audio synthesizer where each column represents one nibble (`0` to `F`), producing a 16-bit musical pattern shareable via a single 4-hex-digit link (`#box=A5C3`).
> 3. The scroll-driven origin story follows NIB from four isolated binary bits blinking in the dark, through its first click, its first hover transformation into a hand, its accidental tumble onto a 404 error page, and finally building its 1999-style desktop home.
>
> Under the playful retro aesthetics lies solid engineering:
> - A handcrafted canvas physics engine featuring spring dynamics, Verlet integration on the tail, and an autonomous wandering mode on mobile touch screens.
> - A procedural Web Audio API engine that generates all bleeps, clicks, synth notes, and lullabies in real time without a single external audio sample.
> - A live backend on Upstash Redis supporting atomic visitor counts with 30-minute deduplication, a persistent sticky-note guestbook with honeypot and profanity filtering, and an Easter egg secret-finder counter.
>
> All artwork and animations are 100% original code (SVG, Canvas, CSS), without any borrowed IP or external UI kits.

---

## 4. Key Highlights & Verification Guide (For Judges)

1. **Cursor Physics (Zero Smoothing):**
   - Move your mouse rapidly. The tip never lags behind your real pointer.
   - Hover a link (NIB leans forward with wide eyes), hover text (NIB squints to read), or hover a disabled button (NIB pouts).
   - Stop moving for 8s (NIB yawns); stop for 20s (NIB snoozes with floating 'z's).
2. **Audio & Mute Control:**
   - Click anywhere to unlock audio. Click the taskbar "sound" button to mute — every oscillator and sound effect ceases immediately.
3. **Projects Directory:**
   - **Lost & Found:** Adopt the 6 abandoned 90s artifacts (The Dead Link, The 800x600 Badge, etc.). Adopting 3 gives NIB a bow; adopting 6 gives NIB a pink trail.
   - **Pointer Playground:** 7 interactive pads proving each emotional state.
   - **Nibble Box:** 4-step pentatonic music box with tempo slider and URL sharing.
   - **Live Guestbook:** Real sticky notes saved directly to Upstash Redis with anti-spam protections.
4. **Easter Egg:**
   - Click the "Hello, my name is NIB" sticker 4 times rapidly to reveal NIB's secret matrix rain and lullaby.
5. **Responsive Chaos Mode:**
   - **Desktop (>=1100px):** 1999 Windows desktop experience.
   - **Tablet / Console (700-1099px):** Cartridge console bezel with notched project bars.
   - **Mobile Gadget (<700px):** Handheld LCD green phosphor pocket gadget with thumb-friendly controls.
   - Kill switch: append `?chaos=0` to restore standard desktop viewport styling anywhere.
