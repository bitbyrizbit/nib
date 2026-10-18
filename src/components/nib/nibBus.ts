import type { Mood, NibBrain } from "./nibBrain";

type Listener = () => void;
const listeners = new Set<Listener>();
let current: Mood = "idle";

export const nib = { brain: null as NibBrain | null };

export const nibBus = {
  emit(m: Mood) { current = m; listeners.forEach((l) => l()); },
  subscribe(l: Listener) { listeners.add(l); return () => { listeners.delete(l); }; },
  get: () => current,
};
