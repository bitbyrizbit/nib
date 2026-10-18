"use client";
import { setTheme, useTheme } from "@/lib/theme";

export default function ThemeToggle() {
  const theme = useTheme();
  const night = theme === "night";
  return (
    <button type="button" className="tb-btn" aria-pressed={night} onClick={() => setTheme(night ? "day" : "night")}>
      <span className="tb-led" aria-hidden="true" />
      night
    </button>
  );
}
