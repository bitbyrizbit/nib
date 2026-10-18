export type Spring = { x: number; v: number; target: number; k: number; c: number };
export const makeSpring = (x = 0, k = 170, c = 16): Spring => ({ x, v: 0, target: x, k, c });
export function stepSpring(s: Spring, dt: number) {
  const a = -s.k * (s.x - s.target) - s.c * s.v;
  s.v += a * dt;
  s.x += s.v * dt;
}
