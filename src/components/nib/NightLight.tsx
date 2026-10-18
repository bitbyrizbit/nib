"use client";
import { useEffect, useRef } from "react";
import { nib } from "./nibBus";
import { useTheme } from "@/lib/theme";

export default function NightLight() {
  const glow = useRef<HTMLDivElement>(null);
  const dream = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    if (theme !== "night") return;
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const b = nib.brain;
      if (!b) return;
      const x = `${Math.round(b.tipX + 8)}px`;
      const y = `${Math.round(b.tipY + 14)}px`;
      for (const el of [glow.current, dream.current]) {
        if (!el) continue;
        el.style.setProperty("--nx", x);
        el.style.setProperty("--ny", y);
      }
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [theme]);

  if (theme !== "night") return null;
  return (
    <>
      <div ref={glow} className="night-glow" aria-hidden="true" />
      <div ref={dream} className="dream-layer" aria-hidden="true">
        <svg className="dream-svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <g fill="none" stroke="#ffb347" strokeWidth="1.5" strokeDasharray="3 6" opacity="0.9">
            <polyline points="180,160 260,230 240,330 180,300 180,160" />
            <polyline points="860,120 940,170 1010,150 1060,210" />
            <circle cx="620" cy="560" r="46" />
          </g>
          <g fill="#ffb347">
            {[
              [180, 160],
              [260, 230],
              [240, 330],
              [180, 300],
              [860, 120],
              [940, 170],
              [1010, 150],
              [1060, 210],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="5" />
            ))}
          </g>
          <g fontFamily="VT323, monospace" fontSize="34" fill="#ffb347">
            <text x="120" y="420">psst. you found the night shift.</text>
            <text x="700" y="480">4 bits of moonlight</text>
            <text x="360" y="700">nib sleeps with the lights on.</text>
            <text x="820" y="690">0101</text>
          </g>
        </svg>
      </div>
    </>
  );
}
