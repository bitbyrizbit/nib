# NIB: MASTER BRIEF (v2, final)

## 0. How to use this brief

You are a build agent (designer and engineer) on one hackathon entry. This document is the source of truth.

- Do not invent rules, assets, prizes, dates or features that are not stated here. If something is missing, ask the owner one essential question, or take the safest option and say you did.
- If you can browse, verify the rules against the live pages (hax.baby, hax.baby/first-website, hax.baby/baby-problem, and the Unstop listing). If anything conflicts with this brief, the live site wins and you tell the owner.
- **LOCKED** decisions (section 12) must not be changed. **OPEN** decisions (section 14) must be proposed to the owner and approved before you commit to them.

---

## 1. The event

- **Name:** "Baby's First Website", a 48-hour online hackathon by haX.baby (also listed on Unstop).
- **Challenge:** "Baby's First Portfolio: Meet the Baby".
- **Dates:** 17 to 19 October 2026, UTC+05:30 (IST).
- **Core mission:** Build a cute, creative, immersive portfolio website for a character. It is a normal portfolio, but the "client" is a delightful little character. The builder chooses the colors, interactive surprises, sounds and how the story unfolds on scroll.
- **Host site identity (context only):** editorial serif headers, Fredoka accents, cream `#fff8f1`, berry `#a34063` / `#5c4033`, "Good things start small". **Our entry must not copy this look.**

---

## 2. What the site must communicate

1. **What they are:** species, look, personality, quirks, voice.
2. **What they do:** craft or creations, with **at least 3** showcase projects (real or fictional).
3. **Their story:** origin and journey told through interactive scroll or animated scenes, not a wall of text.

---

## 3. Tracks and ours

- **Track 1:** everyone builds for Pip, the official skull baby, with official pastel assets. Judged mostly on execution.
- **Track 2 (OURS), "Your Own Baby":** an original character. Judged mostly on originality, character design, voice and world-building.

**We are in Track 2. Do not use Pip, Pip's assets, Pip's canon or the Midnight Nursery world.** Both tracks use one rubric and one shared leaderboard.

**Track 2 rules:**

- 100% original character. No existing IP or lookalikes (Disney, Pokémon, Sanrio, anime, video game characters).
- Kind, playful and cute. Nothing gory, violent, hateful or disrespectful of any culture.
- The portfolio can show real skills through the character or a fictional job.
- **Must include a 5-point character sheet** on the site (About section or modal): Name, What they are, What they do, Their story, Tagline.

---

## 4. Required elements (every submission)

1. Intro establishing identity, look and personality.
2. Projects section with at least 3 things the character made.
3. Origin story through scroll, scenes or animation.
4. Immersion: at least one moment that reacts to the visitor (mouse tracking, clicks, or sound with a mute toggle).
5. Mobile-friendly layout (phones and tablets).
6. One hidden Easter egg.

**Golden rule:** about 150 words or fewer per section. Tell the story through layout, motion, illustration and interaction.

---

## 5. Tiers

- **Tier 1 (baseline):** cursor reaction with touch fallback; scroll-driven story; day/night or mood toggle that changes expression and palette; responsive layout; one Easter egg.
- **Tier 2 (standout, pick 1 or 2 and polish):** Web Audio music box or synth with mute; flashlight cursor; SVG route synced to scroll; interactive storybook; mini-game.
- **Tier 3 (boss, only if the core is rock-solid):** Three.js character; live guestbook; character remembers returning visitors (localStorage); chat; Lighthouse 90+.

A fully working, polished Tier 1 or 2 beats an ambitious but broken Tier 3. One polished interaction beats five half-broken ones.

---

## 6. Side quests (up to +13 points)

| Quest | Points |
|---|---|
| Live Guestbook (persistent wall) | +2 |
| Sparkle Cursor Trail | +2 |
| Hit Counter Odometer | +1 |
| Click Sounds + Mute (mute strictly required) | +3 |
| Responsive Chaos Mode (retro personality reshaping to any screen) | +5 |

---

## 7. Judging rubric

| Weight | Criterion |
|---|---|
| 35% | Functionality & Polish: working buttons, smooth interactions, **zero console errors**, clean state |
| 30% | Early-Web Soul: playful 90s/00s whimsy, distinct personality, feels like a real cozy web place |
| 20% | Creativity & Surprises: Easter eggs, toys, fresh storytelling |
| 15% | Clean Craft: responsive, fast, accessible controls, tidy code |

Track 2 comparisons lean on originality, character design, voice and world-building.

---

## 8. Rules and logistics

- Any web stack and any backend.
- Must be built during the 48 hours. **Public GitHub commit history between 17 and 19 October is required.**
- Solo, or up to 3 people.
- AI tools are allowed, but the owner must understand and be responsible for the shipped code.
- **Art credit:** hand-drawn, SVG/CSS, pixel art and AI-generated art are allowed, but every source must be credited visibly in the footer or credits.
- **Mute toggle:** always provide an easy-to-spot, working mute switch wherever there is sound.
- Mobile-first: must work smoothly on phones and tablets.

---

## 9. Timeline (IST)

| Date and time | Milestone |
|---|---|
| **17 Oct, 17:17** | Kickoff, 48 hours begin |
| **18 Oct, 17:17** | Submissions open, live deploy check |
| **19 Oct, 17:17** | Code freeze, submissions close (hard deadline) |

Have a live, deployed, working version well before the deadline. Do not leave deployment to the last hour.

---

## 10. What to submit

1. Live deployed URL (Vercel, Netlify, GitHub Pages, Cloudflare, etc.)
2. Public GitHub repo with commit history from 17 to 19 October
3. Story behind the build (a few paragraphs on the character and proudest features)
4. Character sheet (5 points)
5. Credits (art, audio, fonts, libraries)

---

## 11. Prizes (context)

$400 pool: 1st $160 (plus AI credits, merch, certificate, engineering interview opportunity), 2nd $120, 3rd $80, 4th $40, each with AI credits and perks.

---

## 12. LOCKED CREATIVE DECISIONS

### Identity

- **Project and character name:** NIB. Wordmark styled `nib` (lowercase), with the dot of the "i" acting as a pointer.
- **Tagline:** *Click gently. I'm new here.*
- **Descriptor:** *A newborn cursor discovering the internet, one click at a time.*
- **Wordmark subline:** nib · baby's first cursor
- **Footer line:** *Small point. Big ideas.*
- **Easter-egg line:** *Half a byte. Whole lot of world.*
- **Meaning:** a nib is the pointed tip of a pen or cursor, and sounds like *nibble*, half a byte (4 bits).
- **Core idea:** **the character is the website.** NIB is a baby cursor, newly arrived online and learning what everything does. Every part of the portfolio is something NIB made, learned or broke while exploring. NIB's first website is this site, which ties directly to the hackathon's theme.

### Character design

- **The arrow is the body.** Keep the classic pointer silhouette recognizable at a glance, with a slightly lopsided tip, a soft squishy body, two expressive eyes and a small trailing tail. It should look like a cursor that has just learned how to be a cursor.
- **No generic round baby body with a cursor attached.** The arrow itself must remain the character.
- Optional detail: a tiny "Hello, my name is" sticker. It is also the Easter egg target.
- **Personality:** curious, clumsy, easily excited, sincere, a little impatient. Four bits old.
- **Emotion comes from behavior, not just face swaps:** NIB leans toward links, hesitates over unfamiliar controls, stretches when dragging and slowly slumps when idle.
- **Signature gesture (must be executed consistently):** a tiny anticipatory lean before every click, then a squash, then a delayed little bounce. This is purely cosmetic. **The click's action fires immediately.**

### Signature interaction: cursor states as emotions

| Visitor action | NIB feels |
|---|---|
| Moves over empty space | Idle, drifting, looking around |
| Hovers a link or button | Excited, leans in, bounces |
| Hovers readable text | Squints, reading mode |
| Idle for a while | Sleepy, yawns, slumps |
| Hovers something blocked or disabled | Pouts |
| Drags something | Holds on tight, stretches |
| Clicks | Lean, squash, delayed bounce, happy yelp |

### Cursor engineering rules (non-negotiable)

- **NIB's tip is locked to the real pointer position with zero lag.** Only the body, eyes and tail use spring physics. Otherwise clicks feel wrong.
- NIB uses `pointer-events: none` and never covers the clickable target.
- Preserve native cursors where precision matters (text inputs, small targets, focus states). Provide a keyboard-friendly experience: NIB moves to the focused element.
- **Disable cursor replacement on touch devices.** On phones and tablets, NIB wanders on its own, walks toward taps and reacts to taps and scroll. Touch is designed for, not merely tolerated.
- Respect `prefers-reduced-motion`: no lean, bounce or wandering, with a calm static fallback.

### Voice

NIB has a tiny vocabulary of short, sincere lines such as "oh! a link", "I made this" and "oops. wrong page." Use them sparingly, in a consistent voice, never on every hover. Speech must never carry essential information.

### The four-bit motif

Four tiny lights are a recurring system. They show NIB's state, act as the loading indicator, power the Easter egg and drive the origin story, where NIB grows from four blinking bits into the full cursor.

### Character sheet (the five required fields)

1. **Name:** NIB
2. **What it is:** A baby cursor, a soft arrow with a lopsided tip, big eyes and a trailing tail. Four bits old. Curious, clumsy, sincere, easily excited.
3. **What it does:** Makes tiny web toys and tools, and adopts abandoned pieces of the internet.
4. **Its story:** See the origin scenes below.
5. **Tagline:** *Click gently. I'm new here.*

### Origin story (scroll-driven, each scene under 150 words, mostly visual)

1. **0101:** NIB is born as a 4-bit nibble in the dark, just four blinking dots.
2. **First click:** a click wakes it up and its eyes open.
3. **First hover:** it discovers the hand shape and falls in love with links.
4. **First mistake:** it wanders into a 404 and gets lost among abandoned pages.
5. **First website:** NIB builds a home from what it found. This is that home.

Each milestone visibly changes NIB's form, so by the end the visitor understands how four bits became a full cursor.

### Portfolio (at least 3 projects, planned 4)

Projects are things NIB made, not generic project cards with a mascot pasted on. Each has a little **maker's mark**, a quirk and a **working interaction**.

1. **The Lost & Found (the emotional center):** abandoned web objects (dead links, old buttons, loading spinners) NIB adopted. Clicking one reveals NIB's story about it.
2. **The Nibble Box:** a 4-bit music-box toy built with the Web Audio API, four-step patterns, with four-bit-inspired visuals.
3. **Pointer Playground:** poke NIB and see every emotion, plus a tiny course for the cursor states.
4. **NIB's Guestbook (conditional):** visitors sign a wall. It needs a real backend with validation and abuse protection. If it cannot be made genuinely persistent, label it honestly as a demo.

### Visitors help NIB grow (optional, P2)

Small milestones as the visitor progresses can unlock cosmetic cursor behaviors. **Essential navigation is never locked behind the story.**

### Mood toggle

**Daylight** and **Dial-up night** change the palette and NIB's expression (bright and bouncy vs drowsy and glowing).

### Easter egg

Click or tap NIB's sticker **four times** (four bits). A bit flips, NIB's first-ever message from the day it was born appears, and a hidden lullaby plays. The mute switch must silence it.

### Visual direction (direction, not final tokens)

- Not the host's cream and berry look, and not generic pastel "cute".
- A **lovingly lived-in 1999 desktop**: window chrome, a taskbar, "under construction", 88x31 webring buttons, a visitor counter, used with taste, not as parody.
- Daylight: warm beige plastic, ink black, signal red, "nib" yellow. Night: deep navy-black, phosphor green, hot pink.
- Type: a pixel face for system text (OFL fonts such as VT323, Silkscreen or Pixelify Sans) paired with a characterful display face. Final fonts are locked at the design-token step.

### Responsive Chaos Mode (staged, +5 points)

Three expressions of one world, never three separate sites. Text stays readable, navigation predictable and controls accessible. Do not emulate old-device quirks.

1. One responsive experience with the full character, story, projects and interactions.
2. The desktop-window aesthetic (layered windows, taskbar, NIB wandering the interface).
3. Only if everything is stable, device morphs at selected breakpoints: desktop as a home computer, tablet as a pocket console (projects as cartridges), phone as a pocket gadget (tiny display, simplified navigation).

---

## 13. Priority order

Do not start a lower tier until the higher one works on a real phone.

| Priority | What to build |
|---|---|
| **P0** | NIB character and physics, responsive layout, cursor reactions, scroll story, 3 working projects |
| **P1** | Day/night toggle, Easter egg, **mute switch plus click sounds (+3)**, keyboard and reduced-motion support |
| **P2** | Nibble Box audio toy, scroll-synced SVG journey (Tier 2), visitor-growth milestones |
| **P3** | Sparkle trail of falling 0s and 1s (+2), real hit counter (+1), guestbook (+2, only if genuinely persistent). Optional: NIB remembers returning visitors via localStorage |
| **P4** | Full Chaos Mode device morph (+5) |

Prioritize the signature interaction over the quantity of side quests. A character that reacts beautifully is worth more than a dozen decorative effects. Not attempting: Three.js or AI chat.

---

## 14. OPEN decisions (propose, then wait for owner approval)

- Stack. The owner works in Python, FastAPI and React/Next.js. A light option such as Vite + React + TypeScript with canvas/SVG for NIB is a reasonable proposal, but it is not locked.
- Final fonts, color tokens and spacing scale.
- Backend for the counter and guestbook, if any (validation, rate limiting and abuse protection are required), or whether to skip those points.
- Deployment host and URL. The `nib` Vercel subdomain is probably taken, so propose an alternative such as `meet-nib`.

---

## 15. Engineering and creative rules

- Do not default to: purple/blue gradients on white, generic glassmorphism, gradient blobs, rows of rounded icon cards, a centered hero with two buttons, generic dashboards, rounded corners everywhere, generic sans-serif everywhere, meaningless grids, stock art, decorative 3D, repeated identical section layouts, animation that communicates nothing, fake data or fake functionality.
- The first 10 seconds must show what this is and invite interaction. No long intro that blocks content.
- Motion must carry meaning. No scroll hijacking and no endless movement.
- Every visible control works. Keyboard access, visible focus, semantic HTML and appropriate ARIA.
- **Zero console errors**, no broken links, no layout shift, no horizontal overflow.
- Keep dependencies light. Optimize fonts, images and bundle size. Smooth on low-end phones.
- Any counter or guestbook must be real or clearly labeled demo. Never fake silently.
- Audio starts only after a user gesture, and **the mute switch silences every sound source**, including click effects and the Easter egg.
- The site must still impress with the expensive effects removed.
- Never claim testing, accessibility or functionality that has not been verified.

---

## 16. Assets and credit

- All character art is original and drawn in code (SVG, CSS, canvas).
- Do not use third-party reference images, Pip assets or the host's art. References are inspiration only.
- Prefer synthesized audio (Web Audio) or original sound to avoid licensing issues.
- Use only openly licensed fonts, with fallbacks.
- Credit every font, sound, library and art source in the footer and `CREDITS.md`, updated as you go.

---

## 17. Workflow

1. **Reconnaissance:** inspect the repo, verify live rules if browsing is available.
2. **Experience architecture:** page structure, scenes, NIB state machine, design tokens (OPEN decisions proposed here).
3. **Build in priority order (P0 to P4),** committing small and often with clear messages. Public history must fall inside 17 to 19 October.
4. **Verify continuously:** console clean, keyboard, mute, reduced motion, a real phone, plus a tablet width.
5. **Deploy early** and keep a live version running throughout.
6. **Final polish:** footer credits, character sheet, submission write-up.

---

## 18. Pre-submission checklist

- [ ] Live URL works on a real phone and a laptop
- [ ] Public repo with commits across 17 to 19 October
- [ ] Zero console errors
- [ ] 3 or more working projects
- [ ] Origin story scenes under 150 words each
- [ ] Cursor reaction works, with a touch fallback
- [ ] Day/night toggle works
- [ ] Easter egg works, and mute silences it
- [ ] Mute switch is visible and silences everything
- [ ] Reduced-motion and keyboard paths work
- [ ] Character sheet on the site
- [ ] Footer credits and `CREDITS.md` complete
- [ ] Story write-up ready
- [ ] Submitted before 19 Oct 17:17 IST