"use client";
import { useSyncExternalStore } from "react";

const KEY = "nib:muted";
const VOLUME = 0.8;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;
const listeners = new Set<() => void>();
const live = new Set<AudioScheduledSourceNode>();

try {
  muted = typeof localStorage !== "undefined" && localStorage.getItem(KEY) === "1";
} catch {}

export function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : VOLUME;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export const getTime = () => (ctx ? ctx.currentTime : 0);
export const isMuted = () => muted;

type ToneOpts = { type?: OscillatorType; gain?: number; to?: number };

function tone(freq: number, t0: number, dur: number, o: ToneOpts = {}) {
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = o.type ?? "square";
  osc.frequency.setValueAtTime(freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
  const peak = o.gain ?? 0.1;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
  live.add(osc);
  osc.onended = () => live.delete(osc);
}

export function pluckAt(freq: number, t: number) {
  if (muted || !ensure()) return;
  tone(freq, t, 1.1, { type: "sine", gain: 0.16 });
  tone(freq * 2, t, 0.45, { type: "sine", gain: 0.05 });
  tone(freq * 4.01, t, 0.1, { type: "triangle", gain: 0.03 });
}

export type Sfx = "click" | "yelp" | "adopt" | "pop";

export function play(name: Sfx) {
  if (muted) return;
  const c = ensure();
  if (!c) return;
  const t = c.currentTime;
  if (name === "click") tone(880, t, 0.05, { gain: 0.05, to: 440 });
  else if (name === "yelp") tone(620, t, 0.14, { gain: 0.07, to: 1240 });
  else if (name === "pop") tone(300, t, 0.1, { type: "triangle", gain: 0.1, to: 120 });
  else if (name === "adopt") {
    pluckAt(523.25, t);
    pluckAt(783.99, t + 0.12);
  }
}

export const pop = () => play("pop");

const LULLABY = [659.25, 783.99, 880, 783.99, 659.25, 587.33, 523.25, 587.33, 659.25, 783.99, 659.25, 523.25];

export function playLullaby() {
  if (muted) return;
  const c = ensure();
  if (!c) return;
  const t = c.currentTime + 0.1;
  LULLABY.forEach((f, i) => pluckAt(f, t + i * 0.45));
}

export function stopAll() {
  live.forEach((s) => {
    try {
      s.stop();
    } catch {}
  });
  live.clear();
}

export function setMuted(m: boolean) {
  muted = m;
  try {
    localStorage.setItem(KEY, m ? "1" : "0");
  } catch {}
  if (ctx && master) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(m ? 0 : VOLUME, ctx.currentTime, 0.02);
  }
  if (m) stopAll();
  listeners.forEach((l) => l());
}

export function subscribeAudio(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useMuted() {
  return useSyncExternalStore(subscribeAudio, () => muted, () => false);
}
