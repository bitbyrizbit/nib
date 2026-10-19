import type { NibBrain } from "./nibBrain";
import { BODY, EYES, EYE_R, MOUTH } from "./nibShape";

export function drawNib(ctx: CanvasRenderingContext2D, b: NibBrain) {
  if (b.particles.length) {
    ctx.save();
    ctx.font = "18px VT323, monospace";
    for (const p of b.particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = b.trailPink ? "#ff5e9c" : b.night ? "#ffb347" : "#1c1b18";
      ctx.fillText(p.ch, p.x, p.y);
    }
    ctx.restore();
  }

  if (b.alpha < 0.02) return;
  const night = b.night;
  const line = night ? "#0f0b07" : "#1c1b18";
  const fill = "#ffd23f";

  // Nightlight canvas halo (Step 8.3)
  if (b.night) {
    const hx = b.tipX + 10,
      hy = b.tipY + 16;
    const r = b.reduced ? 74 : 70 + Math.sin(b.now * 2) * 6;
    const g = ctx.createRadialGradient(hx, hy, 4, hx, hy, r);
    g.addColorStop(0, "rgba(255,200,100,0.35)");
    g.addColorStop(1, "rgba(255,200,100,0)");
    ctx.save();
    ctx.globalAlpha = b.alpha;
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(hx, hy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.globalAlpha = b.alpha;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const n = b.tail.length;
  if (n > 1) {
    ctx.strokeStyle = line;
    for (let i = 1; i < n; i++) {
      ctx.beginPath();
      ctx.moveTo(b.tail[i - 1].x, b.tail[i - 1].y);
      ctx.lineTo(b.tail[i].x, b.tail[i].y);
      ctx.lineWidth = 3 + 5 * (1 - i / n);
      ctx.stroke();
    }
    ctx.strokeStyle = fill;
    for (let i = 1; i < n; i++) {
      ctx.beginPath();
      ctx.moveTo(b.tail[i - 1].x, b.tail[i - 1].y);
      ctx.lineTo(b.tail[i].x, b.tail[i].y);
      ctx.lineWidth = 1.2 + 3.2 * (1 - i / n);
      ctx.stroke();
    }
  }

  if (b.bow && b.tail.length > 0) {
    const tip = b.tail[b.tail.length - 1];
    ctx.save();
    ctx.translate(tip.x, tip.y);
    ctx.fillStyle = "#ff5e9c";
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
  ctx.scale(b.scale * b.sx.x, b.scale * b.sy.x);

  if (!night) {
    ctx.save();
    ctx.translate(2.6 + Math.max(0, -b.hop.x) * 0.02, 3.8 + Math.max(0, -b.hop.x) * 0.03);
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.beginPath();
    BODY.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  ctx.beginPath();
  BODY.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  if (night) {
    ctx.shadowColor = "#ffb347";
    ctx.shadowBlur = 14;
  }
  const grad = ctx.createLinearGradient(0, 0, 21, 31);
  grad.addColorStop(0, night ? "#ffd98a" : "#ffe680");
  grad.addColorStop(0.55, "#ffd23f");
  grad.addColorStop(1, "#f2a900");
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = line;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Specular highlight
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath();
  ctx.ellipse(2.2, 7.5, 0.8, 3.4, -0.25, 0, Math.PI * 2);
  ctx.fill();

  const m = b.mood;
  ctx.fillStyle = "rgba(232,65,47,0.55)";
  ctx.beginPath();
  ctx.arc(2.6, 15.4, 1, 0, Math.PI * 2);
  ctx.arc(10.6, 16.6, 1, 0, Math.PI * 2);
  ctx.fill();

  const lid = m === "sleepy" ? 0.5 : 0;
  EYES.forEach((e, i) => {
    ctx.strokeStyle = line;
    ctx.lineWidth = 0.8;
    if (m === "flinch") {
      ctx.beginPath();
      if (i === 0) {
        ctx.moveTo(e.x - 1.6, e.y - 1.2);
        ctx.lineTo(e.x + 1.2, e.y);
        ctx.lineTo(e.x - 1.6, e.y + 1.2);
      } else {
        ctx.moveTo(e.x + 1.6, e.y - 1.2);
        ctx.lineTo(e.x - 1.2, e.y);
        ctx.lineTo(e.x + 1.6, e.y + 1.2);
      }
      ctx.stroke();
      return;
    }
    if (m === "asleep" || m === "happy") {
      ctx.beginPath();
      if (m === "happy") {
        ctx.moveTo(e.x - 1.8, e.y + 0.8);
        ctx.quadraticCurveTo(e.x, e.y - 1.6, e.x + 1.8, e.y + 0.8);
      } else {
        ctx.moveTo(e.x - 1.8, e.y);
        ctx.quadraticCurveTo(e.x, e.y + 1.4, e.x + 1.8, e.y);
      }
      ctx.stroke();
      return;
    }
    if (m === "dizzy") {
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.ellipse(e.x, e.y, EYE_R, EYE_R, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Spiral pupil
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(b.now * 8);
      ctx.beginPath();
      for (let theta = 0; theta < Math.PI * 3; theta += 0.2) {
        const r = (theta / (Math.PI * 3)) * 1.5;
        const px = Math.cos(theta) * r;
        const py = Math.sin(theta) * r;
        if (theta === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = line;
      ctx.lineWidth = 0.6;
      ctx.stroke();
      ctx.restore();
      return;
    }

    const open = b.blink > 0 ? 0.08 : 1 - lid;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(e.x, e.y, EYE_R, EYE_R * open, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = line;
    const pr = m === "curious" ? 1.3 : 1;
    ctx.beginPath();
    ctx.ellipse(
      e.x + b.eyeX.x * 0.8,
      e.y + b.eyeY.x * 0.8 * open,
      pr,
      pr * Math.max(open, 0.1),
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    if (m === "pout") {
      ctx.beginPath();
      ctx.moveTo(e.x - 2, e.y - 2.4 + (i ? 0.8 : -0.4));
      ctx.lineTo(e.x + 2, e.y - 2.4 + (i ? -0.4 : 0.8));
      ctx.stroke();
    }
  });

  ctx.strokeStyle = line;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  const mx = MOUTH.x,
    my = MOUTH.y;
  if (b.fidget === "yawn") {
    ctx.arc(mx, my + 0.4, 1.3, 0, Math.PI * 2);
  } else if (m === "flinch") {
    ctx.moveTo(mx - 1.4, my);
    ctx.quadraticCurveTo(mx - 0.7, my - 0.7, mx, my);
    ctx.quadraticCurveTo(mx + 0.7, my + 0.7, mx + 1.4, my);
  } else if (m === "happy") {
    ctx.moveTo(mx - 1.4, my - 0.3);
    ctx.quadraticCurveTo(mx, my + 2, mx + 1.4, my - 0.3);
  } else if (m === "pout") {
    ctx.moveTo(mx - 1, my + 0.8);
    ctx.quadraticCurveTo(mx, my - 0.4, mx + 1, my + 0.8);
  } else if (m === "curious") {
    ctx.arc(mx, my + 0.3, 0.7, 0, Math.PI * 2);
  } else if (m === "dizzy") {
    ctx.moveTo(mx - 1.5, my);
    ctx.quadraticCurveTo(mx - 0.75, my - 0.8, mx, my);
    ctx.quadraticCurveTo(mx + 0.75, my + 0.8, mx + 1.5, my);
  } else if (m === "read" || m === "asleep") {
    ctx.moveTo(mx - 1, my);
    ctx.lineTo(mx + 1, my);
  } else {
    ctx.moveTo(mx - 1, my - 0.2);
    ctx.quadraticCurveTo(mx, my + 1.1, mx + 1, my - 0.2);
  }
  ctx.stroke();
  ctx.restore();

  if (m === "asleep") {
    ctx.save();
    ctx.globalAlpha = b.alpha;
    ctx.fillStyle = night ? "#ffb347" : "#1c1b18";
    ctx.font = "22px VT323, monospace";
    ctx.fillText("z", b.tipX + 34, b.tipY - 6 - ((b.now * 12) % 10));
    ctx.fillText("z", b.tipX + 46, b.tipY - 18 - ((b.now * 12 + 5) % 10));
    ctx.restore();
  }
}
