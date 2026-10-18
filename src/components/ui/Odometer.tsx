"use client";
import { useEffect, useState } from "react";

export default function Odometer({ value, digits = 6 }: { value: number | null; digits?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (value === null) return;
    const id = requestAnimationFrame(() => setV(value));
    return () => cancelAnimationFrame(id);
  }, [value]);
  const str = String(Math.max(0, v)).padStart(Math.max(digits, String(value ?? 0).length), "0");
  return (
    <div className="odo" role="img" aria-label={value === null ? "Visitor count unavailable" : `Visitor number ${value}`}>
      {value === null
        ? Array.from({ length: digits }, (_, i) => (
            <span key={i} className="odo__cell">
              -
            </span>
          ))
        : str.split("").map((ch, i) => (
            <span key={i} className="odo__cell">
              <span className="odo__strip" style={{ transform: `translateY(${-Number(ch) * 1.2}em)` }}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </span>
            </span>
          ))}
    </div>
  );
}
