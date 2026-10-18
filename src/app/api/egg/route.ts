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
