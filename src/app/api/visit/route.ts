import { NextResponse } from "next/server";
import { redis, demoStore, KEYS, ipHash, sameOrigin, NO_STORE } from "@/lib/server/store";


export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "not allowed" }, { status: 403, headers: NO_STORE });
  try {
    if (!redis) { demoStore.visits += 1; return NextResponse.json({ count: demoStore.visits, demo: true }, { headers: NO_STORE }); }
    const fresh = await redis.set(`nib:seen:${ipHash(req)}`, 1, { nx: true, ex: 1800 });
    const count = fresh ? await redis.incr(KEYS.visits) : Number((await redis.get<number>(KEYS.visits)) ?? 0);
    return NextResponse.json({ count, demo: false }, { headers: NO_STORE });
  } catch { return NextResponse.json({ error: "unavailable" }, { status: 503, headers: NO_STORE }); }
}
