"use client";
import { useSyncExternalStore } from "react";

export type Theme = "day" | "night";

const read = (): Theme => (typeof document !== "undefined" && document.documentElement.dataset.theme === "night" ? "night" : "day");

export function setTheme(t: Theme) {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = t;
  }
  try { localStorage.setItem("nib:theme", t); } catch {}
}

function subscribe(cb: () => void) {
  if (typeof document === "undefined") return () => {};
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, read, () => "day" as Theme);
}
