# PHASE 4: THE REAL BACKEND

Read `docs/BRIEF.md`, `docs/plan/00-OVERVIEW.md`. Phases 1 to 3 must be fully ticked, and the site must already be live and submittable.

## What this phase delivers and why

Real, persistent, abuse-resistant features that a static site cannot fake: a **visitor counter odometer** (+1), a **live guestbook** (+2), and a **"visitors who found the secret"** count for the Easter egg. This also pushes toward the Tier 3 "live guestbook" and shows engineering depth. Nothing here may be fake: if the database is not configured the site must say **demo mode, not saved** instead of pretending.

If you are short on time, build in this order and stop whenever you must: visit counter, guestbook, egg count. The site must work with zero errors whether or not the backend is configured.

## Prompt for this phase

```
Build Phase 4 from docs/plan/PHASE-4.md exactly. Reference code was written without being run: run npx tsc --noEmit and npm run lint, fix errors and tell me what you changed.
Security rules: never put secrets in client code, validate every input on the server, never render user text as HTML (React text only), and do not log secrets.
Everything must work in demo mode (no env vars) and clearly label it. Commit after each numbered step with a plain lowercase message (no prefixes), then push. Do not start Phase 5.
```

---

## Step 4.1: Create the database and set environment variables

1. Go to upstash.com, sign up, create a **Redis** database (any region; pick one near the Vercel region), TLS on.
2. In the database page copy the **REST URL** and **REST TOKEN** (not the `redis://` URL).
3. Create `.env.local` in the repo root (it is gitignored; verify with `git status` that it is not listed):

```
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxx
GUESTBOOK_SALT=type-a-long-random-string
ADMIN_KEY=type-another-long-random-string
```

4. Create `.env.example` with the same four names and empty values and commit it.
5. Add the same four to Vercel for Production, Preview and Development:

```powershell
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production
vercel env add GUESTBOOK_SALT production
vercel env add ADMIN_KEY production
```

(repeat for `preview` and `development`, or add them in the Vercel dashboard under Project Settings, Environment Variables). If you used the Vercel Marketplace Upstash integration, it may inject `KV_REST_API_URL` and `KV_REST_API_TOKEN` instead; the code below accepts both.

6. Install dependencies:

```powershell
npm i @upstash/redis @upstash/ratelimit obscenity
```

Commit: `add backend packages`

## Step 4.2: Server helpers

### `src/lib/server/store.ts`

```ts
import { Redis } from "@upstash/redis";
import { createHash, randomUUID } from "node:crypto";

export type Entry = { id: string; name: string; message: string; face: 0 | 1 | 2 | 3; ts: number };

const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
export const redis = url && token ? new Redis({ url, token }) : null;

type Demo = { visits: number; eggs: number; entries: Entry[] };
const g = globalThis as unknown as { __nibDemo?: Demo };
export const demoStore: Demo = (g.__nibDemo ??= { visits: 0, eggs: 0, entries: [] });

export const KEYS = { visits: "nib:visits", eggs: "nib:eggs", ids: "nib:gb:ids" } as const;
export const entryKey = (id: string) => `nib:gb:e:${id}`;
export const newId = () => randomUUID().replace(/-/g, "").slice(0, 12);

export function ipHash(req: Request) {
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(fwd + (process.env.GUESTBOOK_SALT ?? "nib")).digest("hex").slice(0, 24);
}

export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === req.headers.get("host"); } catch { return false; }
}

export const NO_STORE = { "Cache-Control": "no-store" } as const;
```

### `src/lib/server/limits.ts`

```ts
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./store";

export const guestbookLimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, "10 m"), prefix: "nib:rl:gb" })
  : null;
```

### `src/lib/server/validate.ts`

```ts
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from "obscenity";

const matcher = new RegExpMatcher({ ...englishDataset.build(), ...englishRecommendedTransformers });
const URL_RE = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|xyz|ru|cn|co|me|app|dev|link|ly)\b)/i;
const CONTROL = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g;

export function clean(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.normalize("NFKC").replace(CONTROL, "").replace(/\s+/g, " ").trim().slice(0, max);
}

type Result = { ok: true; value: { name: string; message: string; face: 0 | 1 | 2 | 3 } } | { ok: false; error: string };

export function validateEntry(body: unknown): Result {
  if (typeof body !== "object" || body === null) return { ok: false, error: "that didn't look right." };
  const b = body as Record<string, unknown>;
  if (typeof b.hp === "string" && b.hp.length > 0) return { ok: false, error: "that didn't look right." };
  const t = Number(b.t);
  if (!Number.isFinite(t) || t < 2500 || t > 6 * 3600 * 1000) return { ok: false, error: "slow down a little. i'm small." };
  const message = clean(b.message, 140);
  if (message.length < 2) return { ok: false, error: "write between 2 and 140 characters." };
  const name = clean(b.name, 24) || "anonymous";
  const face = Number(b.face);
  if (!Number.isInteger(face) || face < 0 || face > 3) return { ok: false, error: "that didn't look right." };
  if (URL_RE.test(message) || URL_RE.test(name)) return { ok: false, error: "no links please. i can't click them yet." };
  if (matcher.hasMatch(message) || matcher.hasMatch(name)) return { ok: false, error: "that word is too big for me." };
  return { ok: true, value: { name, message, face: face as 0 | 1 | 2 | 3 } };
}
```

If `obscenity` exports differ in the installed version, read its README and adapt the three imports; keep the same behaviour (reject profanity in name and message). Tell the owner if you had to change it. Commit: `add server helpers`

## Step 4.3: API routes

All routes: `export const dynamic = "force-dynamic";` and return `NO_STORE` headers. Never return stack traces. Wrap Redis calls in try/catch and return a generic 503 `{ error: "the wall is asleep. try again later." }` on failure.

### `src/app/api/guestbook/route.ts`

```ts
import { NextResponse } from "next/server";
import { redis, demoStore, KEYS, entryKey, newId, ipHash, sameOrigin, NO_STORE, type Entry } from "@/lib/server/store";
import { validateEntry } from "@/lib/server/validate";
import { guestbookLimit } from "@/lib/server/limits";

export const dynamic = "force-dynamic";
const asleep = () => NextResponse.json({ error: "the wall is asleep. try again later." }, { status: 503, headers: NO_STORE });

export async function GET() {
  try {
    if (!redis) return NextResponse.json({ demo: true, total: demoStore.entries.length, entries: demoStore.entries.slice(0, 50) }, { headers: NO_STORE });
    const ids = await redis.zrange<string[]>(KEYS.ids, 0, 49, { rev: true });
    const total = await redis.zcard(KEYS.ids);
    const rows = ids.length ? await redis.mget<(Entry | null)[]>(...ids.map(entryKey)) : [];
    const entries = rows.filter((e): e is Entry => !!e);
    return NextResponse.json({ demo: false, total, entries }, { headers: NO_STORE });
  } catch { return asleep(); }
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "not allowed" }, { status: 403, headers: NO_STORE });
  if (Number(req.headers.get("content-length") ?? 0) > 2000) return NextResponse.json({ error: "too big" }, { status: 413, headers: NO_STORE });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "that didn't look right." }, { status: 400, headers: NO_STORE }); }
  const v = validateEntry(body);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400, headers: NO_STORE });

  try {
    if (guestbookLimit) {
      const r = await guestbookLimit.limit(ipHash(req));
      if (!r.success) return NextResponse.json({ error: "slow down. i am very small." }, { status: 429, headers: NO_STORE });
    }
    const entry: Entry = { id: newId(), ...v.value, ts: Date.now() };
    if (!redis) {
      demoStore.entries.unshift(entry);
      demoStore.entries.length = Math.min(demoStore.entries.length, 100);
      return NextResponse.json({ entry, demo: true }, { status: 201, headers: NO_STORE });
    }
    await redis.set(entryKey(entry.id), entry, { ex: 60 * 60 * 24 * 30 });
    await redis.zadd(KEYS.ids, { score: entry.ts, member: entry.id });
    const n = await redis.zcard(KEYS.ids);
    if (n > 300) await redis.zremrangebyrank(KEYS.ids, 0, n - 301);
    return NextResponse.json({ entry, demo: false }, { status: 201, headers: NO_STORE });
  } catch { return asleep(); }
}
```

### `src/app/api/guestbook/[id]/route.ts` (admin delete, for removing abuse)

```ts
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { redis, demoStore, KEYS, entryKey, NO_STORE } from "@/lib/server/store";

export const dynamic = "force-dynamic";

function authorized(req: Request) {
  const key = process.env.ADMIN_KEY;
  const got = req.headers.get("x-admin-key");
  if (!key || !got) return false;
  const a = Buffer.from(key), b = Buffer.from(got);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!authorized(req)) return NextResponse.json({ error: "no" }, { status: 401, headers: NO_STORE });
  const { id } = await params;
  if (!/^[a-f0-9]{12}$/.test(id)) return NextResponse.json({ error: "bad id" }, { status: 400, headers: NO_STORE });
  try {
    if (!redis) demoStore.entries = demoStore.entries.filter((e) => e.id !== id);
    else { await redis.zrem(KEYS.ids, id); await redis.del(entryKey(id)); }
    return NextResponse.json({ ok: true }, { headers: NO_STORE });
  } catch { return NextResponse.json({ error: "failed" }, { status: 503, headers: NO_STORE }); }
}
```

### `src/app/api/visit/route.ts`

```ts
import { NextResponse } from "next/server";
import { redis, demoStore, KEYS, ipHash, sameOrigin, NO_STORE } from "@/lib/server/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "not allowed" }, { status: 403, headers: NO_STORE });
  try {
    if (!redis) { demoStore.visits += 1; return NextResponse.json({ count: demoStore.visits, demo: true }, { headers: NO_STORE }); }
    const fresh = await redis.set(`nib:seen:${ipHash(req)}`, 1, { nx: true, ex: 1800 });
    const count = fresh ? await redis.incr(KEYS.visits) : Number((await redis.get<number>(KEYS.visits)) ?? 0);
    return NextResponse.json({ count, demo: false }, { headers: NO_STORE });
  } catch { return NextResponse.json({ error: "unavailable" }, { status: 503, headers: NO_STORE }); }
}
```

### `src/app/api/egg/route.ts`

```ts
import { NextResponse } from "next/server";
import { redis, demoStore, KEYS, ipHash, sameOrigin, NO_STORE } from "@/lib/server/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "not allowed" }, { status: 403, headers: NO_STORE });
  try {
    if (!redis) { demoStore.eggs += 1; return NextResponse.json({ count: demoStore.eggs, demo: true }, { headers: NO_STORE }); }
    const fresh = await redis.set(`nib:egg:${ipHash(req)}`, 1, { nx: true, ex: 86400 });
    const count = fresh ? await redis.incr(KEYS.eggs) : Number((await redis.get<number>(KEYS.eggs)) ?? 0);
    return NextResponse.json({ count, demo: false }, { headers: NO_STORE });
  } catch { return NextResponse.json({ error: "unavailable" }, { status: 503, headers: NO_STORE }); }
}
```

### `src/app/api/stats/route.ts`

```ts
import { NextResponse } from "next/server";
import { redis, demoStore, KEYS, NO_STORE } from "@/lib/server/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!redis) return NextResponse.json({ demo: true, visits: demoStore.visits, eggs: demoStore.eggs, entries: demoStore.entries.length }, { headers: NO_STORE });
    const [visits, eggs, entries] = await Promise.all([redis.get<number>(KEYS.visits), redis.get<number>(KEYS.eggs), redis.zcard(KEYS.ids)]);
    return NextResponse.json({ demo: false, visits: Number(visits ?? 0), eggs: Number(eggs ?? 0), entries }, { headers: NO_STORE });
  } catch { return NextResponse.json({ error: "unavailable" }, { status: 503, headers: NO_STORE }); }
}
```

### `next.config.ts` (merge with what the scaffold created)

```ts
import type { NextConfig } from "next";

const config: NextConfig = {
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }];
  },
};

export default config;
```

### Test the API from PowerShell (with `npm run dev` running)

```powershell
$base = "http://localhost:3000"
Invoke-RestMethod "$base/api/stats"
Invoke-RestMethod -Method Post "$base/api/visit"
$body = @{ name = "tester"; message = "hello nib"; face = 1; hp = ""; t = 5000 } | ConvertTo-Json
Invoke-RestMethod -Method Post "$base/api/guestbook" -ContentType "application/json" -Body $body
Invoke-RestMethod "$base/api/guestbook"
1..4 | ForEach-Object { try { Invoke-RestMethod -Method Post "$base/api/guestbook" -ContentType "application/json" -Body $body | Out-Null; "ok $_" } catch { "blocked $_ : $($_.Exception.Response.StatusCode.value__)" } }
```

Expected: the stats and visit calls return numbers; the first guestbook posts return 201; by the 4th rapid post you see `blocked 4 : 429` (when Redis is configured; in demo mode there is no rate limit, say so). Also test these must each return 400: empty message, message `visit www.spam.com`, `hp = "x"`, `t = 100`. Commit: `add api routes`

## Step 4.4: Client pieces

### `src/lib/useVisits.ts`

```ts
"use client";
import { useEffect, useState } from "react";

const KEY = "nib:lastVisit";
const WINDOW = 30 * 60 * 1000;

export function useVisits() {
  const [count, setCount] = useState<number | null>(null);
  const [demo, setDemo] = useState(false);
  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        let counted = false;
        try { counted = Date.now() - Number(localStorage.getItem(KEY) || 0) < WINDOW; } catch {}
        const res = counted ? await fetch("/api/stats", { cache: "no-store" }) : await fetch("/api/visit", { method: "POST" });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        if (dead) return;
        setCount(counted ? data.visits : data.count);
        setDemo(!!data.demo);
        if (!counted) { try { localStorage.setItem(KEY, String(Date.now())); } catch {} }
      } catch { if (!dead) setCount(null); }
    })();
    return () => { dead = true; };
  }, []);
  return { count, demo };
}
```

### `src/components/ui/Odometer.tsx`

```tsx
"use client";
import { useEffect, useState } from "react";

export default function Odometer({ value, digits = 6 }: { value: number | null; digits?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (value === null) return;
    const id = requestAnimationFrame(() => setV(value));
    return () => cancelAnimationFrame(id);
  }, [value]);
  const str = String(Math.max(0, v)).padStart(Math.max(digits, String(value ?? 0).length), "0");
  return (
    <div className="odo" role="img" aria-label={value === null ? "Visitor count unavailable" : `Visitor number ${value}`}>
      {value === null
        ? Array.from({ length: digits }, (_, i) => <span key={i} className="odo__cell">-</span>)
        : str.split("").map((ch, i) => (
            <span key={i} className="odo__cell">
              <span className="odo__strip" style={{ transform: `translateY(${-Number(ch) * 1.2}em)` }}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => <span key={d}>{d}</span>)}
              </span>
            </span>
          ))}
    </div>
  );
}
```

Style: `.odo { display: inline-flex; gap: 2px; font-family: var(--font-mono); font-size: 32px; line-height: 1.2em; background: #1c1b18; padding: 4px; border: 2px solid var(--line); }`, `.odo__cell { display: block; width: 0.7em; height: 1.2em; overflow: hidden; background: #000; color: #7dffb0; text-align: center; }`, `.odo__strip { display: flex; flex-direction: column; transition: transform 1.4s cubic-bezier(.2,.8,.2,1); }`, `.odo__strip span { height: 1.2em; }`. Under reduced motion the global rule makes the transition instant.

Put the odometer in `Footer.tsx` with the label `you are visitor no.` and, when `demo` is true, the small text `demo mode, not saved`. If `count` is `null` (backend down), show dashes and no label claim.

### `src/components/projects/Guestbook.tsx` (reference)

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import Window from "@/components/shell/Window";
import type { Entry } from "@/lib/server/store";

const FACES = ["hi", "wow", "zzz", "love"] as const;
const ago = (ts: number) => {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
};

export default function Guestbook() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [total, setTotal] = useState(0);
  const [demo, setDemo] = useState(false);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [face, setFace] = useState(0);
  const [hp, setHp] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const shownAt = useRef(Date.now());

  const load = async () => {
    setState("loading");
    try {
      const r = await fetch("/api/guestbook", { cache: "no-store" });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setEntries(d.entries); setTotal(d.total); setDemo(!!d.demo); setState("ready");
    } catch { setState("error"); }
  };
  useEffect(() => { void load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setStatus("");
    try {
      const r = await fetch("/api/guestbook", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message, face, hp, t: Date.now() - shownAt.current }),
      });
      const d = await r.json();
      if (!r.ok) { setStatus(d.error ?? "something went wrong."); return; }
      setEntries((prev) => [d.entry, ...prev]); setTotal((t) => t + 1);
      setMessage(""); setStatus("thank you! nib put it on the wall.");
    } catch { setStatus("couldn't reach the wall. try again."); }
    finally { setBusy(false); }
  };

  return (
    <Window title="guestbook.html" id="guestbook">
      <p>Leave a note for NIB. It reads every one (slowly).</p>
      {demo && <p className="hint" role="status">demo mode: notes are not saved</p>}
      <form onSubmit={submit} className="gb__form">
        <label>name (optional)<input type="text" value={name} maxLength={24} onChange={(e) => setName(e.target.value)} autoComplete="off" /></label>
        <label>your note<textarea value={message} maxLength={140} rows={3} required onChange={(e) => setMessage(e.target.value)} />
          <span className="hint">{message.length}/140</span></label>
        <fieldset className="gb__faces"><legend>pick a face</legend>
          {FACES.map((f, i) => (
            <label key={f}><input type="radio" name="face" checked={face === i} onChange={() => setFace(i)} /> {f}</label>
          ))}
        </fieldset>
        <input className="hp" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={(e) => setHp(e.target.value)} />
        <button type="submit" className="tb-btn" disabled={busy}>{busy ? "sending..." : "sign the wall"}</button>
        <p role="status" aria-live="polite" className="hint">{status}</p>
      </form>
      {state === "loading" && <p className="hint">loading the wall...</p>}
      {state === "error" && <p className="hint">the wall is asleep. <button type="button" className="tb-btn" onClick={load}>try again</button></p>}
      {state === "ready" && entries.length === 0 && <p className="hint">nobody here yet. be the first.</p>}
      {state === "ready" && entries.length > 0 && (
        <>
          <p className="hint">{total} note{total === 1 ? "" : "s"} on the wall</p>
          <ul className="gb__wall">
            {entries.map((en) => (
              <li key={en.id} style={{ transform: `rotate(${(parseInt(en.id.slice(0, 2), 16) % 7) - 3}deg)` }}>
                <p>{en.message}</p>
                <footer>{en.name} · {FACES[en.face]} · {ago(en.ts)}</footer>
              </li>
            ))}
          </ul>
        </>
      )}
    </Window>
  );
}
```

Notes for the build agent: user text is rendered only as React text (never `dangerouslySetInnerHTML`). The `Entry` import is a type only, so no server code reaches the client bundle; if the bundler complains, copy the type into a shared `src/lib/types.ts`. Style `.hp { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }`, `.gb__wall` as an uneven pinboard of sticky notes (CSS columns or grid with varied spans), not identical cards. Inputs show the native cursor (NIB fades out) because they are `input`/`textarea`.

Add Guestbook as the fourth window in `Projects.tsx` and `{ id: "guestbook", label: "guestbook" }` to `NAV`.

### Egg count in the Easter egg

In `EggSticker.tsx`, when the egg opens, call once per browser:

```ts
if (!localStorage.getItem("nib:eggPosted")) {
  fetch("/api/egg", { method: "POST" })
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => { if (d && !d.demo) { localStorage.setItem("nib:eggPosted", "1"); setFound(d.count); } })
    .catch(() => {});
}
```

Hold `found` in state (`number | null`) and pass it to `EggModal`; when not null, show `you are one of {found} visitors who found this.` under the last line. Show nothing if it is null or demo (never invent a number).

Commit in steps: `add visit counter`, `add guestbook`, `add secret finder count`.

## Step 4.5: Deploy and test on the live site

```powershell
vercel --prod
```

On the live URL:
1. The odometer rolls to a real number; reload within 30 minutes and it does not increase (same browser and IP).
2. Sign the guestbook from your phone and your laptop; both show on both.
3. Post 4 times quickly: you get the rate-limit message.
4. Try a note with a link and a rude word: both are refused with the friendly messages.
5. Delete a test note with the admin route:

```powershell
Invoke-RestMethod -Method Delete -Uri "https://YOUR-URL/api/guestbook/ENTRYID" -Headers @{ "x-admin-key" = "YOUR_ADMIN_KEY" }
```

6. Temporarily blank the Upstash variables in a **preview** deploy (or locally) and confirm the site shows `demo mode, not saved` and nothing crashes.
7. Console clean, `npm run build` passes.

Commit: `update readme backend`. Add a short "How the backend works" section to the README (no secrets).

## Phase 4 checklist

- [ ] Odometer shows a real persistent count, increments at most once per visitor per 30 minutes
- [ ] Guestbook persists across reload and devices; entries render safely as text
- [ ] Honeypot, minimum fill time, URL filter, profanity filter, rate limit and same-origin check all verified
- [ ] Admin delete works; `ADMIN_KEY` is never exposed to the client
- [ ] Egg count shows only real numbers
- [ ] Demo mode is clearly labelled and nothing breaks without env vars
- [ ] No secrets in the repo (`git log -p` search for the token); `.env.local` ignored
- [ ] Zero console errors; commits plain, lowercase, pushed
