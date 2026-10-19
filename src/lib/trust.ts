"use client";
import { useSyncExternalStore } from "react";
import { loadJSON, saveJSON } from "@/lib/storage";
import { DIARY } from "@/lib/diary";

type State = { value: number; day: string; gained: number };
const KEY = "nib:trust";
const DAILY_CAP = 60;
const today = () => new Date().toISOString().slice(0, 10);

let state: State = { value: 10, day: today(), gained: 0 };
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  state = loadJSON<State>(KEY, state);
  if (state.day !== today()) state = { ...state, day: today(), gained: 0 };
}
function emit() {
  saveJSON(KEY, state);
  listeners.forEach((l) => l());
}

export const pipsFor = (v: number) => Math.min(4, Math.floor(v / 20));
export const trustValue = () => {
  load();
  return state.value;
};
export const unlockedCount = (v: number) => DIARY.filter((d) => v >= d.at).length;

export function addTrust(n: number) {
  load();
  if (n > 0) {
    n = Math.min(n, Math.max(0, DAILY_CAP - state.gained));
    state.gained += n;
  }
  const before = state.value;
  const next = Math.max(0, Math.min(100, before + n));
  if (next === before) return;
  state = { ...state, value: next };
  emit();
  window.dispatchEvent(new CustomEvent("nib:trust", { detail: next }));
  if (pipsFor(next) > pipsFor(before)) {
    window.dispatchEvent(new CustomEvent("nib:pip", { detail: pipsFor(next) }));
  }
  if (unlockedCount(next) > unlockedCount(before)) {
    window.dispatchEvent(new Event("nib:diary"));
  }
}

export function resetTrust() {
  loaded = true;
  state = { value: 10, day: today(), gained: 0 };
  emit();
  window.dispatchEvent(new CustomEvent("nib:trust", { detail: 10 }));
}

export function useTrust() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    () => {
      load();
      return state.value;
    },
    () => 10,
  );
}
