import { NextResponse } from "next/server";
import { redis, demoStore, KEYS, entryKey, newId, ipHash, sameOrigin, NO_STORE, type Entry } from "@/lib/server/store";
import { validateEntry } from "@/lib/server/validate";
import { guestbookLimit } from "@/lib/server/limits";

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
