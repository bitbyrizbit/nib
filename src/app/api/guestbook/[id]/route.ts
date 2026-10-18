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
