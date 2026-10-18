import type { NibBrain } from "./nibBrain";
import { BODY, EYES, EYE_R, MOUTH, S } from "./nibShape";

export function drawNib(ctx: CanvasRenderingContext2D, b: NibBrain) {
  if (b.particles.length) {
    ctx.save();
    ctx.font = "18px VT323, monospace";
    for (const p of b.particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = b.trailPink ? "#ff4fa3" : b.night ? "#7dffb0" : "#1c1b18";
      ctx.fillText(p.ch, p.x, p.y);
    }
    ctx.restore();
  }

  if (b.alpha < 0.02) return;
  const night = b.night;
  const line = night ? "#0a0d1c" : "#1c1b18";
  const fill = "#ffd23f";

  ctx.save();
  ctx.globalAlpha = b.alpha;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (b.tail.length > 1) {
    ctx.beginPath();
    ctx.moveTo(b.tail[0].x, b.tail[0].y);
    for (let i = 1; i < b.tail.length; i++) ctx.lineTo(b.tail[i].x, b.tail[i].y);
    ctx.strokeStyle = line; ctx.lineWidth = 7; ctx.stroke();
    ctx.strokeStyle = fill; ctx.lineWidth = 3.5; ctx.stroke();
  }

  if (b.bow && b.tail.length > 0) {
    const tip = b.tail[b.tail.length - 1];
    ctx.save();
    ctx.translate(tip.x, tip.y);
    ctx.fillStyle = "#e8412f";
    ctx.strokeStyle = line;
    ctx.lineWidth = 1;
    // Left wing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-7, -4);
    ctx.lineTo(-7, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Right wing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(7, -4);
    ctx.lineTo(7, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Knot
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  ctx.translate(b.tipX, b.tipY + b.hop.x);
  ctx.rotate(b.angle.x);
  ctx.scale(S * b.sx.x, S * b.sy.x);

  ctx.beginPath();
  BODY.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  if (night) { ctx.shadowColor = "#7dffb0"; ctx.shadowBlur = 14; }
  ctx.fillStyle = fill; ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = line; ctx.lineWidth = 1.5; ctx.stroke();

  const m = b.mood;
  ctx.fillStyle = "rgba(232,65,47,0.55)";
  ctx.beginPath(); ctx.arc(2.6, 15.4, 1, 0, Math.PI * 2); ctx.arc(10.6, 16.6, 1, 0, Math.PI * 2); ctx.fill();

  const lid = m === "sleepy" ? 0.5 : 0;
  EYES.forEach((e, i) => {
    ctx.strokeStyle = line; ctx.lineWidth = 0.8;
    if (m === "asleep" || m === "happy") {
      ctx.beginPath();
      if (m === "happy") { ctx.moveTo(e.x - 1.8, e.y + 0.8); ctx.quadraticCurveTo(e.x, e.y - 1.6, e.x + 1.8, e.y + 0.8); }
      else { ctx.moveTo(e.x - 1.8, e.y); ctx.quadraticCurveTo(e.x, e.y + 1.4, e.x + 1.8, e.y); }
      ctx.stroke();
      return;
    }
    const open = b.blink > 0 ? 0.08 : 1 - lid;
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.ellipse(e.x, e.y, EYE_R, EYE_R * open, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = line;
    const pr = m === "curious" ? 1.3 : 1;
    ctx.beginPath(); ctx.ellipse(e.x + b.eyeX.x * 0.8, e.y + b.eyeY.x * 0.8 * open, pr, pr * Math.max(open, 0.1), 0, 0, Math.PI * 2); ctx.fill();
    if (m === "pout") {
      ctx.beginPath(); ctx.moveTo(e.x - 2, e.y - 2.4 + (i ? 0.8 : -0.4)); ctx.lineTo(e.x + 2, e.y - 2.4 + (i ? -0.4 : 0.8)); ctx.stroke();
    }
  });

  ctx.strokeStyle = line; ctx.lineWidth = 0.8; ctx.beginPath();
  const mx = MOUTH.x, my = MOUTH.y;
  if (m === "happy") { ctx.moveTo(mx - 1.4, my - 0.3); ctx.quadraticCurveTo(mx, my + 2, mx + 1.4, my - 0.3); }
  else if (m === "pout") { ctx.moveTo(mx - 1, my + 0.8); ctx.quadraticCurveTo(mx, my - 0.4, mx + 1, my + 0.8); }
  else if (m === "curious") { ctx.arc(mx, my + 0.3, 0.7, 0, Math.PI * 2); }
  else if (m === "read" || m === "asleep") { ctx.moveTo(mx - 1, my); ctx.lineTo(mx + 1, my); }
  else { ctx.moveTo(mx - 1, my - 0.2); ctx.quadraticCurveTo(mx, my + 1.1, mx + 1, my - 0.2); }
  ctx.stroke();
  ctx.restore();

  if (m === "asleep") {
    ctx.save();
    ctx.globalAlpha = b.alpha;
    ctx.fillStyle = night ? "#7dffb0" : "#1c1b18";
    ctx.font = "22px VT323, monospace";
    ctx.fillText("z", b.tipX + 34, b.tipY - 6 - ((b.now * 12) % 10));
    ctx.fillText("z", b.tipX + 46, b.tipY - 18 - ((b.now * 12 + 5) % 10));
    ctx.restore();
  }
}
