"use client";
import { setTheme, useTheme } from "@/lib/theme";
import { pop } from "@/lib/audio";
import { nib } from "@/components/nib/nibBus";

export default function ThemeToggle() {
  const theme = useTheme();
  const night = theme === "night";

  const onToggle = () => {
    pop();
    if (!night) {
      nib.brain?.pointerDown();
      setTimeout(() => nib.brain?.pointerUp(), 100);
    }
    setTheme(night ? "day" : "night");
  };

  return (
    <button type="button" className="tb-btn" aria-pressed={night} onClick={onToggle}>
      <span className="tb-led" aria-hidden="true" />
      night
    </button>
  );
}
