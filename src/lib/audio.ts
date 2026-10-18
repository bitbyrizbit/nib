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

function noise(t0: number, dur: number, lo: number, hi: number, gain: number) {
  if (!ctx || !master) return;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 2;
  bp.frequency.setValueAtTime(lo, t0);
  bp.frequency.linearRampToValueAtTime(hi, t0 + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
  src.connect(bp).connect(g).connect(master);
  src.start(t0);
  src.stop(t0 + dur);
  live.add(src);
  src.onended = () => live.delete(src);
}

const DTMF: Record<string, [number, number]> = {
  "1": [697, 1209],
  "2": [697, 1336],
  "3": [697, 1477],
  "4": [770, 1209],
  "5": [770, 1336],
};

export function playDialup(): number {
  if (muted) return 0;
  const c = ensure();
  if (!c) return 0;
  const start = c.currentTime + 0.05;
  let t = start;
  for (const digit of "5551234") {
    const [a, b] = DTMF[digit] || [770, 1336];
    tone(a, t, 0.09, { type: "sine", gain: 0.06 });
    tone(b, t, 0.09, { type: "sine", gain: 0.06 });
    t += 0.14;
  }
  t += 0.5;
  tone(2100, t, 0.9, { type: "sine", gain: 0.05 });
  t += 1.0;
  for (let i = 0; i < 24; i++) {
    tone(i % 2 ? 2250 : 1200, t, 0.07, { type: "sine", gain: 0.05 });
    t += 0.075;
  }
  noise(t, 1.6, 800, 3500, 0.12);
  for (let i = 0; i < 14; i++) tone(1000 + Math.random() * 1600, t + i * 0.11, 0.05, { type: "square", gain: 0.03 });
  return t + 1.6 - start;
}

export type Sfx = "click" | "yelp" | "adopt" | "pop" | "shake" | "copied";

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
  } else if (name === "shake") {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => pluckAt(f, t + i * 0.06));
  } else if (name === "copied") {
    pluckAt(783.99, t);
    pluckAt(1046.5, t + 0.08);
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
