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
    addEventListener("pointerdown", onDown, { passive: true });
    return () => removeEventListener("pointerdown", onDown);
  }, []);
  return null;
}
