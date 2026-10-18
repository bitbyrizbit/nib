"use client";
import { useEffect, useState, type RefObject } from "react";

export function useSceneProgress(ref: RefObject<HTMLElement | null>, scenes: number) {
  const [state, setState] = useState({ scene: 0, local: 0 });
  useEffect(() => {
    let raf = 0;
    const calc = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      const raw = p * scenes;
      const scene = Math.min(scenes - 1, Math.floor(raw));
      setState((s) => (s.scene === scene && Math.abs(s.local - (raw - scene)) < 0.01 ? s : { scene, local: raw - scene }));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(calc); };
    calc();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); };
  }, [ref, scenes]);
  return state;
}
