"use client";
import { useEffect, useRef } from "react";
import { BODY } from "@/components/nib/nibShape";
import { play } from "@/lib/audio";

export default function HeroNib() {
  const svg = useRef<SVGSVGElement>(null);
  const pupils = useRef<SVGGElement>(null);
  const body = useRef<SVGGElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.fx === "off") return;
    const move = (e: PointerEvent) => {
      const s = svg.current,
        p = pupils.current;
      if (!s || !p) return;
      const r = s.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width * 0.3);
      const dy = e.clientY - (r.top + r.height * 0.4);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 300);
      p.setAttribute("transform", `translate(${((dx / d) * 0.9 * k).toFixed(2)} ${((dy / d) * 0.9 * k).toFixed(2)})`);
    };
    addEventListener("pointermove", move, { passive: true });
    return () => removeEventListener("pointermove", move);
  }, []);

  const squish = () => {
    play("yelp");
    const g = body.current;
    if (!g) return;
    g.classList.remove("hero-nib__squish");
    void g.getBoundingClientRect();
    g.classList.add("hero-nib__squish");
  };

  const pts = BODY.map(([x, y]) => `${x + 1},${y + 1}`).join(" ");
  return (
    <figure className="hero__photo">
      <button type="button" className="hero-nib" onClick={squish} aria-label="Say hi to NIB">
        <svg ref={svg} viewBox="-4 -2 32 42" aria-hidden="true">
          <defs>
            <linearGradient id="hn-fill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffe680" />
              <stop offset="0.55" stopColor="#ffd23f" />
              <stop offset="1" stopColor="#f2a900" />
            </linearGradient>
          </defs>
          <ellipse cx="12" cy="36.5" rx="9" ry="1.6" fill="rgba(0,0,0,0.18)" />
          <g ref={body} className="hero-nib__body">
            <polygon points={pts} fill="url(#hn-fill)" stroke="#1c1b18" strokeWidth="1.5" strokeLinejoin="round" />
            <ellipse cx="3.2" cy="9" rx="0.8" ry="3.4" fill="rgba(255,255,255,0.55)" transform="rotate(-14 3.2 9)" />
            <circle cx="3.6" cy="16.4" r="1.1" fill="rgba(232,65,47,0.55)" />
            <circle cx="11.6" cy="17.6" r="1.1" fill="rgba(232,65,47,0.55)" />
            <g stroke="#1c1b18" strokeWidth="0.8">
              <circle cx="5.4" cy="13" r="2.5" fill="#fff" />
              <circle cx="10.2" cy="14.3" r="2.5" fill="#fff" />
            </g>
            <g ref={pupils}>
              <circle cx="5.4" cy="13" r="1.3" fill="#1c1b18" />
              <circle cx="10.2" cy="14.3" r="1.3" fill="#1c1b18" />
              <circle cx="5" cy="12.5" r="0.45" fill="#fff" />
              <circle cx="9.8" cy="13.8" r="0.45" fill="#fff" />
            </g>
            <path d="M6.6 17.8 Q7.8 19.2 9 17.8" fill="none" stroke="#1c1b18" strokeWidth="0.8" strokeLinecap="round" />
          </g>
        </svg>
      </button>
      <figcaption className="hint">nib_id.bmp · NIB, age 4 bits</figcaption>
    </figure>
  );
}
