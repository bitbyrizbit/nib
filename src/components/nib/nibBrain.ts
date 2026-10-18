import { makeSpring, stepSpring } from "./spring";
import { REAR, S } from "./nibShape";

export type Mood = "idle" | "curious" | "read" | "sleepy" | "asleep" | "pout" | "grab" | "happy";
export type Kind = "none" | "link" | "text" | "disabled" | "drag" | "native";
export type Rect = { x: number; y: number; w: number; h: number };
export type TailPoint = { x: number; y: number; px: number; py: number };
export type Particle = { x: number; y: number; vy: number; life: number; ch: string };

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const TAIL_N = 9;
const TAIL_L = 6;

export class NibBrain {
  mode: "mouse" | "touch" = "mouse";
  reduced = false;
  night = false;
  width = 0;
  height = 0;
  now = 0;
  tipX = -200;
  tipY = -200;
  vx = 0;
  vy = 0;
  kind: Kind = "none";
  rect: Rect | null = null;
  down = false;
  inside = true;
  mood: Mood = "idle";
  alpha = 0;
  blink = 0;
  angle = makeSpring(0, 150, 13);
  sx = makeSpring(1, 230, 13);
  sy = makeSpring(1, 230, 13);
  hop = makeSpring(0, 280, 16);
  eyeX = makeSpring(0, 120, 16);
  eyeY = makeSpring(0, 120, 16);
  tail: TailPoint[] = [];
  particles: Particle[] = [];
  bow = false;
  trailPink = false;
  onMood: ((m: Mood) => void) | null = null;
  onWake: (() => void) | null = null;
  onClick: (() => void) | null = null;

  private lastSpawn = 0;

  private px = -200;
  private py = -200;
  private hasPointer = false;
  private lastActive = 0;
  private clickStart = -1;
  private bounced = true;
  private nextBlink = 2;
  private wx = 0;
  private wy = 0;
  private nextWander = 0;
  private touchReady = false;

  private hatchT = -1;
  private hatchFromX = 0;
  private hatchFromY = 0;
  firstMove = true;

  hatch(fromX: number, fromY: number) {
    this.hatchT = 0;
    this.hatchFromX = fromX;
    this.hatchFromY = fromY;
    this.tipX = fromX;
    this.tipY = fromY;
    this.sx.x = 1.5;
    this.sy.x = 0.5;
    this.hop.v = -260;
  }

  skipHatch() {
    this.hatchT = -1;
  }

  resize(w: number, h: number) { this.width = w; this.height = h; }

  setMode(m: "mouse" | "touch") {
    this.mode = m;
    if (m === "touch" && !this.touchReady) {
      this.touchReady = true;
      this.wx = this.width * 0.7; this.wy = this.height * 0.55;
      this.tipX = this.wx; this.tipY = this.wy;
    }
  }

  setTarget(kind: Kind, rect: Rect | null) { this.kind = kind; this.rect = rect; }

  poke() {
    if (this.mood === "asleep" || this.mood === "sleepy") { this.hop.v = -220; this.onWake?.(); }
    this.lastActive = this.now;
  }

  pointerMove(x: number, y: number) {
    if (!this.hasPointer) { this.tipX = x; this.tipY = y; }
    this.px = x; this.py = y; this.hasPointer = true; this.inside = true;
    this.poke();
  }

  leave() { this.inside = false; }

  pointerDown() {
    this.down = true; this.poke();
    this.clickStart = this.now; this.bounced = false;
    this.onClick?.();
  }

  pointerUp() { this.down = false; }

  tap(x: number, y: number) {
    this.wx = x; this.wy = y; this.nextWander = this.now + 4;
    if (this.reduced) { this.tipX = x; this.tipY = y; }
    this.pointerDown(); this.down = false;
  }

  update(dtRaw: number) {
    const dt = clamp(dtRaw, 0.0001, 1 / 30);
    this.now += dt;
    const prevX = this.tipX, prevY = this.tipY;

    if (this.hatchT >= 0) {
      this.hatchT += dt;
      const k = Math.min(1, this.hatchT / 0.9);
      const e = 1 - Math.pow(1 - k, 3);
      const dx = this.mode === "mouse" ? this.px : this.wx;
      const dy = this.mode === "mouse" ? this.py : this.wy;
      this.tipX = this.hatchFromX + (dx - this.hatchFromX) * e;
      this.tipY = this.hatchFromY + (dy - this.hatchFromY) * e;
      this.alpha = 1;
      if (k >= 1) {
        this.hatchT = -1;
        window.dispatchEvent(new Event("nib:hatched"));
      }
    } else if (this.mode === "mouse") {
      if (this.hasPointer) { this.tipX = this.px; this.tipY = this.py; }
    } else if (this.reduced) {
      this.tipX = this.wx; this.tipY = this.wy;
    } else {
      if (this.now > this.nextWander) {
        this.wx = 40 + Math.random() * Math.max(10, this.width - 80);
        this.wy = 80 + Math.random() * Math.max(10, this.height - 200);
        this.nextWander = this.now + 2.5 + Math.random() * 2.5;
      }
      const k = 1 - Math.exp(-dt * 2.2);
      this.tipX += (this.wx - this.tipX) * k;
      this.tipY += (this.wy - this.tipY) * k;
    }

    this.vx += ((this.tipX - prevX) / dt - this.vx) * 0.25;
    this.vy += ((this.tipY - prevY) / dt - this.vy) * 0.25;

    // particles trail
    const speed = Math.hypot(this.vx, this.vy);
    if (!this.reduced && this.mode === "mouse" && this.alpha > 0.5 && speed > 600 && this.now - this.lastSpawn > 0.04 && this.particles.length < 60) {
      this.lastSpawn = this.now;
      this.particles.push({
        x: this.tipX + (Math.random() - 0.5) * 12,
        y: this.tipY + (Math.random() - 0.5) * 12,
        vy: 30 + Math.random() * 50,
        life: 0.9,
        ch: Math.random() < 0.5 ? "0" : "1",
      });
    }
    for (const p of this.particles) {
      p.y += p.vy * dt;
      p.life -= dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);

    // mood
    const idle = this.now - this.lastActive;
    const clicking = this.clickStart >= 0 && this.now - this.clickStart < 0.7;
    let m: Mood = "idle";
    if (clicking) m = "happy";
    else if (this.kind === "disabled") m = "pout";
    else if (this.down && this.kind === "drag") m = "grab";
    else if (this.kind === "link") m = "curious";
    else if (this.kind === "text") m = "read";
    else if (idle > 20) m = "asleep";
    else if (idle > 8 || (this.night && idle > 3)) m = "sleepy";
    if (m !== this.mood) { this.mood = m; this.onMood?.(m); }

    // visibility
    const wantAlpha = this.kind === "native" || !this.inside || (this.mode === "mouse" && !this.hasPointer) ? 0 : 1;
    this.alpha += (wantAlpha - this.alpha) * Math.min(1, dt * 12);

    // eyes
    let lx = 0, ly = 0;
    if (this.rect && this.kind !== "none") {
      const dx = this.rect.x + this.rect.w / 2 - this.tipX, dy = this.rect.y + this.rect.h / 2 - this.tipY;
      const d = Math.hypot(dx, dy) || 1; lx = dx / d; ly = dy / d;
    } else {
      const sp = Math.hypot(this.vx, this.vy);
      if (sp > 40) { lx = this.vx / sp; ly = this.vy / sp; }
    }
    this.eyeX.target = lx; this.eyeY.target = ly;
    stepSpring(this.eyeX, dt); stepSpring(this.eyeY, dt);

    this.blink = Math.max(0, this.blink - dt);
    if (this.now > this.nextBlink) { this.blink = 0.14; this.nextBlink = this.now + 2.5 + Math.random() * 3.5; }

    if (this.reduced) {
      this.angle.x = 0; this.angle.v = 0; this.sx.x = 1; this.sx.v = 0; this.sy.x = 1; this.sy.v = 0; this.hop.x = 0; this.hop.v = 0;
      this.updateTail(dt, true);
      return;
    }

    // body targets
    let a = clamp(this.vx * 0.0009, -0.35, 0.35);
    let sxT = 1, syT = 1;
    switch (m) {
      case "curious": a += 0.22; sxT = 1.05; syT = 1.05; break;
      case "read": a -= 0.08; syT = 0.94; break;
      case "sleepy": a += 0.3; syT = 0.95; break;
      case "asleep": a += 0.55; syT = 0.9; break;
      case "pout": a += Math.sin(this.now * 38) * 0.06; break;
      case "grab": syT = 1.28; sxT = 0.86; break;
    }
    const s = Math.min(Math.hypot(this.vx, this.vy) / 3500, 0.22);
    syT *= 1 + s; sxT *= 1 - s * 0.6;

    if (this.clickStart >= 0) {
      const t = this.now - this.clickStart;
      if (t < 0.08) { a -= 0.2; sxT *= 0.92; syT *= 0.92; }
      else if (t < 0.17) { sxT *= 1.2; syT *= 0.8; }
      else if (!this.bounced) { this.bounced = true; this.hop.v = -300; }
    }

    this.angle.target = a; this.sx.target = sxT; this.sy.target = syT; this.hop.target = 0;
    for (const sp of [this.angle, this.sx, this.sy, this.hop]) { stepSpring(sp, dt / 2); stepSpring(sp, dt / 2); }
    this.updateTail(dt, false);
  }

  private updateTail(dt: number, still: boolean) {
    const a = this.angle.x, sx = S * this.sx.x, sy = S * this.sy.x;
    const rx = this.tipX + Math.cos(a) * REAR.x * sx - Math.sin(a) * REAR.y * sy;
    const ry = this.tipY + this.hop.x + Math.sin(a) * REAR.x * sx + Math.cos(a) * REAR.y * sy;
    if (this.tail.length === 0) {
      for (let i = 0; i < TAIL_N; i++) this.tail.push({ x: rx, y: ry + i * TAIL_L, px: rx, py: ry + i * TAIL_L });
    }
    this.tail[0].x = rx; this.tail[0].y = ry;
    if (still) {
      for (let i = 1; i < TAIL_N; i++) { const p = this.tail[i]; p.x = rx + i * TAIL_L * 0.7; p.y = ry + i * TAIL_L * 0.7; p.px = p.x; p.py = p.y; }
      return;
    }
    const g = (this.mood === "asleep" ? 1400 : 700) * dt * dt;
    for (let i = 1; i < TAIL_N; i++) {
      const p = this.tail[i];
      const vx = (p.x - p.px) * 0.92, vy = (p.y - p.py) * 0.92;
      p.px = p.x; p.py = p.y; p.x += vx; p.y += vy + g;
    }
    for (let it = 0; it < 3; it++) {
      for (let i = 1; i < TAIL_N; i++) {
        const a0 = this.tail[i - 1], b0 = this.tail[i];
        const dx = b0.x - a0.x, dy = b0.y - a0.y, d = Math.hypot(dx, dy) || 1;
        const k = (d - TAIL_L) / d;
        b0.x -= dx * k; b0.y -= dy * k;
      }
    }
  }
}
