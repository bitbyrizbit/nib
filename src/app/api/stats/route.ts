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
