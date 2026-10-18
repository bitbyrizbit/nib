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
