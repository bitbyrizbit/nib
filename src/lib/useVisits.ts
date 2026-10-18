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
