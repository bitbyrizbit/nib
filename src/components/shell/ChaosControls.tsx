"use client";
import { NAV } from "@/lib/nav";

export default function ChaosControls() {
  const go = (dir: 1 | -1) => {
    const tops = NAV.map((n) => ({
      id: n.id,
      top: document.getElementById(n.id)?.getBoundingClientRect().top ?? Infinity,
    }));
    let cur = 0;
    tops.forEach((t, i) => {
      if (t.top <= 80) cur = i;
    });
    const target = Math.min(NAV.length - 1, Math.max(0, cur + dir));
    document.getElementById(NAV[target].id)?.scrollIntoView({ block: "start" });
  };

  return (
    <div className="chaos-controls" role="group" aria-label="Section controls">
      <button type="button" className="tb-btn" onClick={() => go(-1)}>
        prev
      </button>
      <button type="button" className="tb-btn" onClick={() => go(1)}>
        next
      </button>
    </div>
  );
}
