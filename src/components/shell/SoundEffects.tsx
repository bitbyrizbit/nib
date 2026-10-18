"use client";
import { useEffect } from "react";
import { classify } from "@/components/nib/classify";
import { play } from "@/lib/audio";

export default function SoundEffects() {
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const { kind } = classify(e.target);
      if (kind === "link") play("click");
      else if (kind === "disabled") play("pop");
      else if (kind === "none" && Math.random() < 0.25) play("yelp");
    };

    const onTurbo = () => {
      play("shake");
    };

    addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("nib:turbo", onTurbo);
    return () => {
      removeEventListener("pointerdown", onDown);
      window.removeEventListener("nib:turbo", onTurbo);
    };
  }, []);
  return null;
}
