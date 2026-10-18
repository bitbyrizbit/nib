"use client";
import { useEffect } from "react";
import { ensure, setMuted, useMuted } from "@/lib/audio";

export default function MuteButton() {
  const muted = useMuted();
  useEffect(() => {
    const unlock = () => {
      ensure();
    };
    addEventListener("pointerdown", unlock, { once: true, passive: true });
    addEventListener("keydown", unlock, { once: true });
    return () => {
      removeEventListener("pointerdown", unlock);
      removeEventListener("keydown", unlock);
    };
  }, []);
  return (
    <button
      type="button"
      className="tb-btn"
      aria-pressed={!muted}
      aria-label={muted ? "Sound is off. Turn sound on" : "Sound is on. Turn sound off"}
      onClick={() => {
        ensure();
        setMuted(!muted);
      }}
    >
      <span className="tb-led" aria-hidden="true" />
      sound
    </button>
  );
}
