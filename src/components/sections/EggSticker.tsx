"use client";
import { useRef, useState } from "react";
import EggModal from "@/components/ui/EggModal";

export default function EggSticker() {
  const count = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [n, setN] = useState(0);
  const [open, setOpen] = useState(false);

  const onClick = () => {
    count.current += 1;
    setN(count.current);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      count.current = 0;
      setN(0);
    }, 2000);
    if (count.current >= 4) {
      count.current = 0;
      setN(0);
      setOpen(true);
      try {
        localStorage.setItem("nib:egg", "1");
      } catch {}
      window.dispatchEvent(new CustomEvent("nib:egg"));
    }
  };

  return (
    <>
      <button
        type="button"
        className="sticker"
        data-sticker
        style={{ transform: `rotate(${-3 + n * 2}deg)` }}
        onClick={onClick}
        aria-label="Hello, my name is NIB sticker"
      >
        Hello, my name is NIB
      </button>
      <EggModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
