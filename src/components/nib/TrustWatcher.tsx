"use client";
import { useEffect } from "react";
import { classify } from "./classify";
import { nib } from "./nibBus";
import { addTrust } from "@/lib/trust";
import { play } from "@/lib/audio";

export default function TrustWatcher() {
  useEffect(() => {
    let last = 0;
    let gained = 0;
    const recent: number[] = [];

    const onDown = (e: PointerEvent) => {
      const { kind } = classify(e.target);
      if (kind !== "none" && kind !== "link" && kind !== "text") return;
      const now = performance.now();
      recent.push(now);
      while (recent.length && now - recent[0] > 1500) recent.shift();
      const b = nib.brain;
      const speed = b ? Math.hypot(b.vx, b.vy) : 0;

      if (recent.length >= 4) {
        recent.length = 0;
        addTrust(-6);
        b?.flinch();
        window.dispatchEvent(new Event("nib:flinch"));
        play("pop");
      } else if (now - last > 1000 && speed < 500) {
        addTrust(3);
      }
      last = now;
    };

    const onBack = (e: Event) => {
      if ((e as CustomEvent<number>).detail >= 20) {
        addTrust(2);
      }
    };

    const tick = setInterval(() => {
      const b = nib.brain;
      if (!b || document.hidden || b.idleFor > 5 || gained >= 15) return;
      gained += 1;
      addTrust(1);
    }, 20000);

    addEventListener("pointerdown", onDown, { passive: true });
    addEventListener("nib:back", onBack);

    return () => {
      clearInterval(tick);
      removeEventListener("pointerdown", onDown);
      removeEventListener("nib:back", onBack);
    };
  }, []);

  return null;
}
