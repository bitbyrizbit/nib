"use client";

import { useEffect, useRef } from "react";
import { nib } from "@/components/nib/nibBus";
import type { Mood } from "@/components/nib/nibBrain";

type FaviconType = "idle" | "sad" | "peek" | "asleep" | Mood;

const TITLES = [
  "come back? nib is lonely.",
  "nib is hiding.",
  "nib fell asleep.",
  "nib is still here.",
];
const ICONS = ["sad", "peek", "asleep", "asleep"] as const;
const stage = (s: number) => (s < 20 ? 0 : s < 90 ? 1 : s < 300 ? 2 : 3);

function drawFavicon(icon: FaviconType): string {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "/favicon.svg";

  ctx.save();
  ctx.scale(0.85, 0.85);

  if (icon === "peek") {
    ctx.translate(2, 14);
  } else {
    ctx.translate(2, 2);
  }

  // Polygon arrow body
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

  if (icon === "sad") {
    // Sad eyes looking down
    eyes.forEach((e) => {
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#1c1b18";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(e.x, e.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#1c1b18";
      ctx.beginPath();
      ctx.arc(e.x, e.y + 0.9, 1, 0, Math.PI * 2);
      ctx.fill();
    });
    // Tear drop on left eye
    ctx.fillStyle = "#6fc3ff";
    ctx.beginPath();
    ctx.ellipse(eyes[0].x - 0.8, eyes[0].y + 3.4, 0.6, 1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Small frown
    ctx.strokeStyle = "#1c1b18";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(6.8, 18.2);
    ctx.quadraticCurveTo(7.8, 17.2, 8.8, 18.2);
    ctx.stroke();
  } else if (icon === "peek") {
    // Eyes looking up towards top of tab
    eyes.forEach((e) => {
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#1c1b18";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(e.x, e.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#1c1b18";
      ctx.beginPath();
      ctx.arc(e.x, e.y - 0.9, 1, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (icon === "asleep") {
    // Closed eyes
    eyes.forEach((e) => {
      ctx.strokeStyle = "#1c1b18";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(e.x - 1.8, e.y);
      ctx.quadraticCurveTo(e.x, e.y + 1.4, e.x + 1.8, e.y);
      ctx.stroke();
    });
    // Tiny "z"
    ctx.font = "bold 9px monospace";
    ctx.fillStyle = "#1c1b18";
    ctx.fillText("z", 16, 9);
  } else if (icon === "happy") {
    eyes.forEach((e) => {
      ctx.strokeStyle = "#1c1b18";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(e.x - 1.8, e.y + 0.8);
      ctx.quadraticCurveTo(e.x, e.y - 1.6, e.x + 1.8, e.y + 0.8);
      ctx.stroke();
    });
  } else {
    // Normal / idle
    const open = icon === "sleepy" ? 0.5 : 1;
    eyes.forEach((e) => {
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
    });
    // Normal smile
    ctx.strokeStyle = "#1c1b18";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(6.8, 17.6);
    ctx.quadraticCurveTo(7.8, 18.7, 8.8, 17.6);
    ctx.stroke();
  }

  ctx.restore();
  return canvas.toDataURL("image/png");
}

export default function TabPolish() {
  const lastFaviconUpdate = useRef(0);

  useEffect(() => {
    const isFxOff = document.documentElement.dataset.fx === "off";

    let hiddenAt = 0;
    let timer: ReturnType<typeof setInterval> | undefined;
    let original = document.title;

    const setFavicon = (icon: FaviconType) => {
      if (isFxOff) return;
      const now = performance.now();
      if (now - lastFaviconUpdate.current < 250) return;
      lastFaviconUpdate.current = now;

      let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      try {
        link.href = drawFavicon(icon);
      } catch {}
    };

    const apply = (i: number) => {
      document.title = TITLES[i];
      setFavicon(ICONS[i]);
    };

    const onVisibility = () => {
      if (document.hidden) {
        original = document.title;
        hiddenAt = Date.now();
        if (isFxOff) {
          document.title = TITLES[0];
          return;
        }
        apply(0);
        timer = setInterval(() => {
          apply(stage((Date.now() - hiddenAt) / 1000));
        }, 1000);
      } else {
        clearInterval(timer);
        const away = hiddenAt ? (Date.now() - hiddenAt) / 1000 : 0;
        document.title = original;
        if (!isFxOff) setFavicon("idle");
        window.dispatchEvent(new CustomEvent("nib:back", { detail: away }));
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    const prevOnMood = nib.brain?.onMood;
    if (nib.brain && !isFxOff) {
      nib.brain.onMood = (m) => {
        prevOnMood?.(m);
        if (!document.hidden) setFavicon(m);
      };
    }

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      document.title = original;
      if (nib.brain) nib.brain.onMood = prevOnMood ?? null;
    };
  }, []);

  return null;
}
