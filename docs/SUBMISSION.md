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

> NIB is a baby cursor. Most characters live on a page; NIB lives in the interface itself. The tip of the arrow is your real pointer, so when you click, you are holding NIB. This is NIB's first website, which is why it fits "Baby's First Website".
>
> NIB is four bits old (half a byte, a nibble), and that number shows up everywhere: four lights show its mood, the Nibble Box is a four-step music toy whose pattern is four hex digits you can share as a link, and the story grows NIB from four blinking bits into a full cursor.
>
> I'm proudest of the cursor engine, written from scratch with springs, a tail simulation and a mood system. NIB leans toward links, squints at text, pouts at locked things, gets dizzy if you scroll too fast, and falls asleep if you stop. At night the page goes dark and NIB glows like a nightlight, lighting up hidden drawings. There is also a real guestbook and visitor counter with rate limiting and spam filtering, a dial-up modem toy, and a button that lets you download NIB as a cursor. NIB remembers returning visitors using only the browser's local storage, and nothing is sent anywhere.
>
> I used AI coding tools while building, and I reviewed and own all of the code. All art is original (SVG, CSS, canvas), all sound is synthesised in the browser, and every font and library is credited in the footer.

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
5. **Trust Mechanic & Diary:**
   - Click gently to build trust (+3) and fill the taskbar bit-lights. Click-spamming causes NIB to flinch with squeezed eyes and lose trust (-6).
   - Unlocks 5 narrative diary entries in `nib_diary.txt` as trust builds.
6. **Lonely Tab Story:**
   - Switch away from the tab: title and favicon evolve over time (lonely -> hiding after 20s -> asleep after 90s). Returning triggers custom greetings based on duration away.
7. **Take NIB Home:**
   - Sharp vector SVG, crisp transparent PNGs (up to 1024px rendered directly to canvas), and authentic Windows `.cur` cursor download.
8. **Responsive Chaos Mode:**
   - Desktop (>=1100px): 1999 Windows desktop experience.
   - Tablet / Console (700-1099px): Cartridge console bezel with notched project bars.
   - Mobile Gadget (<700px): Handheld pocket gadget with thumb-friendly controls.
   - Kill switch: append `?chaos=0` to restore standard desktop styling, or `?fx=0` to disable motion.
