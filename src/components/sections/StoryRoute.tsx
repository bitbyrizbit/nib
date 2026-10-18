"use client";
import { useEffect, useRef, useState } from "react";
import NibSvg from "@/components/nib/NibSvg";

const D = "M20 50 C 120 10, 200 90, 300 50 S 480 10, 580 50 S 760 90, 860 50 S 960 30, 980 50";

export default function StoryRoute({ p, scenes }: { p: number; scenes: number }) {
  const path = useRef<SVGPathElement>(null);
  const [pt, setPt] = useState({ x: 20, y: 50 });
  const [marks, setMarks] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const el = path.current;
    if (!el) return;
    const len = el.getTotalLength();
    setMarks(
      Array.from({ length: scenes }, (_, i) => {
        const q = el.getPointAtLength((len * (i + 0.5)) / scenes);
        return { x: q.x, y: q.y };
      })
    );
  }, [scenes]);

  useEffect(() => {
    const el = path.current;
    if (!el) return;
    const q = el.getPointAtLength(el.getTotalLength() * p);
    setPt({ x: q.x, y: q.y });
  }, [p]);

  return (
    <svg
      viewBox="0 0 1000 100"
      className="route"
      role="img"
      aria-label={`Journey progress, scene ${Math.min(scenes, Math.floor(p * scenes) + 1)} of ${scenes}`}
    >
      <path d={D} fill="none" stroke="var(--line)" strokeWidth="2" strokeDasharray="4 6" opacity="0.4" />
      <path
        ref={path}
        d={D}
        fill="none"
        stroke="var(--signal)"
        strokeWidth="4"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={1 - p}
      />
      {marks.map((m, i) => (
        <circle
          key={i}
          cx={m.x}
          cy={m.y}
          r="6"
          fill={p * scenes > i ? "var(--nib)" : "var(--plastic)"}
          stroke="var(--line)"
          strokeWidth="2"
        />
      ))}
      <NibSvg size={30} x={pt.x - 2} y={pt.y - 2} />
    </svg>
  );
}
