"use client";

import { useEffect, useRef } from "react";
import { nib } from "@/components/nib/nibBus";
import type { Mood } from "@/components/nib/nibBrain";

const ORIGINAL_TITLE = "nib · baby's first cursor";
const LONELY_TITLE = "come back? nib is lonely.";

function drawFavicon(mood: Mood): string {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "/favicon.svg";

  // Background arrow
  ctx.save();
  ctx.scale(0.85, 0.85);
  ctx.translate(2, 2);

  // Polygon arrow
  ctx.beginPath();
  const body = [[0, 0], [0, 26], [7, 20], [12, 31], [17, 28.5], [12, 18], [21, 18]];
  body.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fillStyle = "#ffd23f";
  ctx.fill();
  ctx.strokeStyle = "#1c1b18";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Eyes
  const eyes = [{ x: 5.4, y: 13 }, { x: 10.2, y: 14.3 }];
  eyes.forEach((e) => {
    if (mood === "happy") {
      ctx.strokeStyle = "#1c1b18";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(e.x - 1.8, e.y + 0.8);
      ctx.quadraticCurveTo(e.x, e.y - 1.6, e.x + 1.8, e.y + 0.8);
      ctx.stroke();
    } else if (mood === "asleep") {
      ctx.strokeStyle = "#1c1b18";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(e.x - 1.8, e.y);
      ctx.quadraticCurveTo(e.x, e.y + 1.4, e.x + 1.8, e.y);
      ctx.stroke();
    } else {
      const open = mood === "sleepy" ? 0.5 : 1;
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#1c1b18";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(e.x, e.y, 2.2, 2.2 * open, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#1c1b18";
      ctx.beginPath();
      ctx.arc(e.x, e.y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  ctx.restore();
  return canvas.toDataURL("image/png");
}

export default function TabPolish() {
  const lastFaviconUpdate = useRef(0);

  useEffect(() => {
    if (document.documentElement.dataset.fx === "off") return;

    // Tab title lonely effect
    const onVisibility = () => {
      if (document.hidden) {
        document.title = LONELY_TITLE;
      } else {
        document.title = ORIGINAL_TITLE;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Dynamic favicon for mood
    const updateFavicon = (m: Mood) => {
      const now = performance.now();
      if (now - lastFaviconUpdate.current < 250) return; // throttle to <= 4/sec
      lastFaviconUpdate.current = now;

      let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      try {
        link.href = drawFavicon(m);
      } catch {}
    };

    const prevOnMood = nib.brain?.onMood;
    if (nib.brain) {
      nib.brain.onMood = (m) => {
        prevOnMood?.(m);
        updateFavicon(m);
      };
    }

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.title = ORIGINAL_TITLE;
      if (nib.brain) nib.brain.onMood = prevOnMood ?? null;
    };
  }, []);

  return null;
}
