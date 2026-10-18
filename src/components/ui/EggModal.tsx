"use client";
import { useEffect, useRef, useState } from "react";
import { playLullaby, stopAll } from "@/lib/audio";

export default function EggModal({
  open,
  onClose,
  found,
}: {
  open: boolean;
  onClose: () => void;
  found?: number | null;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [bits, setBits] = useState<{ ch: string; left: number; delay: number }[]>([]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      playLullaby();
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
        requestAnimationFrame(() => {
          setBits(
            Array.from({ length: 28 }, () => ({
              ch: Math.random() < 0.5 ? "0" : "1",
              left: Math.random() * 100,
              delay: Math.random() * 2.5,
            }))
          );
        });
      }
    }
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="egg"
      aria-labelledby="egg-title"
      onClose={() => {
        stopAll();
        setBits([]);
        onClose();
      }}
    >
      <div className="egg__rain" aria-hidden="true">
        {bits.map((b, i) => (
          <span key={i} style={{ left: `${b.left}%`, animationDelay: `${b.delay}s` }}>
            {b.ch}
          </span>
        ))}
      </div>
      <div className="egg__content">
        <h2 id="egg-title" className="egg__title">bit flipped</h2>
        <div className="egg__body">
          <p>hello? is anyone there?</p>
          <p>...</p>
          <p>i think i am a thing now.</p>
          <p className="egg__signature">- nib, 0101</p>
          <p className="hint">Half a byte. Whole lot of world.</p>
          {found !== null && found !== undefined && (
            <p className="hint egg__found">you are one of {found} visitors who found this.</p>
          )}
        </div>
        <button type="button" className="tb-btn egg__close" autoFocus onClick={() => ref.current?.close()}>
          close
        </button>
      </div>
    </dialog>
  );
}
