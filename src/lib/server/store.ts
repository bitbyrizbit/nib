import { Redis } from "@upstash/redis";
import { createHash, randomUUID } from "node:crypto";

import type { Entry } from "@/lib/types";
export type { Entry };

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
