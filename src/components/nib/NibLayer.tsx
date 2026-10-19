"use client";
import { useEffect, useRef } from "react";
import { NibBrain } from "./nibBrain";
import { drawNib } from "./nibRenderer";
import { classify } from "./classify";
import { nib, nibBus } from "./nibBus";
import { loadJSON } from "@/lib/storage";
import { pipsFor, trustValue } from "@/lib/trust";

const toRect = (el: Element) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };

export default function NibLayer() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const root = document.documentElement;
    const brain = new NibBrain();
    nib.brain = brain;
    brain.onMood = (m) => nibBus.emit(m);
    const rm = matchMedia("(prefers-reduced-motion: reduce)");
    brain.reduced = rm.matches;
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    brain.width = innerWidth; brain.height = innerHeight;
    brain.setMode(fine ? "mouse" : "touch");
    brain.trust = pipsFor(trustValue());

    const updateCosmetics = (count?: number) => {
      const n = typeof count === "number" ? count : loadJSON<string[]>("nib:adopted", []).length;
      brain.bow = n >= 3;
      brain.trailPink = n >= 6;
    };
    updateCosmetics();
    const onAdopted = (e: Event) => updateCosmetics((e as CustomEvent<number>).detail);
    window.addEventListener("nib:adopted", onAdopted);

    const onTrust = (e: Event) => {
      brain.trust = pipsFor((e as CustomEvent<number>).detail);
    };
    window.addEventListener("nib:trust", onTrust);

    let hoverEl: Element | null = null;
    let keyboard = false;
    let raf = 0;
    let last = performance.now();
    let rectTimer = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
      canvas.style.width = innerWidth + "px"; canvas.style.height = innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      brain.resize(innerWidth, innerHeight);
    };
    const enableMouse = () => { if (brain.mode !== "mouse") brain.setMode("mouse"); root.classList.add("nib-on"); };
    const enableTouch = () => { brain.setMode("touch"); root.classList.remove("nib-on"); };

    const shouldHatch = () => {
      if (document.documentElement.dataset.fx === "off") return false;
      if (rm.matches) return false;
      try {
        if (sessionStorage.getItem("nib:born")) return false;
      } catch {}
      return true;
    };

    if (!shouldHatch()) {
      brain.firstMove = false;
      window.dispatchEvent(new Event("nib:hatched"));
    }

    const triggerHatch = () => {
      if (!brain.firstMove || !shouldHatch()) return;
      brain.firstMove = false;
      try { sessionStorage.setItem("nib:born", "1"); } catch {}
      brain.hatch(innerWidth / 2, innerHeight * 0.42);
    };

    let touchHatchTimer: NodeJS.Timeout | null = null;
    if (shouldHatch()) {
      touchHatchTimer = setTimeout(() => {
        if (brain.firstMove) triggerHatch();
      }, 1200);
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      keyboard = false;
      enableMouse();
      if (brain.firstMove) triggerHatch();
      brain.pointerMove(e.clientX, e.clientY);
    };
    const onDown = (e: PointerEvent) => {
      brain.skipHatch();
      window.dispatchEvent(new Event("nib:hatched"));
      if (e.pointerType === "touch") { enableTouch(); brain.tap(e.clientX, e.clientY); }
      else { enableMouse(); brain.pointerMove(e.clientX, e.clientY); brain.pointerDown(); }
    };
    const onUp = () => brain.pointerUp();
    const onOver = (e: PointerEvent) => {
      const c = classify(e.target);
      hoverEl = c.el;
      brain.setTarget(c.kind, c.el ? toRect(c.el) : null);
    };
    const onLeave = () => brain.leave();
    const SEQ = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let konamiPos = 0;

    const onKey = (e: KeyboardEvent) => {
      brain.skipHatch();
      window.dispatchEvent(new Event("nib:hatched"));
      if (e.key === "Tab") keyboard = true;

      // Konami code (Step 9.5)
      if (!(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        konamiPos = e.key.toLowerCase() === SEQ[konamiPos].toLowerCase() ? konamiPos + 1 : e.key === SEQ[0] ? 1 : 0;
        if (konamiPos === SEQ.length) {
          konamiPos = 0;
          brain.turboUntil = brain.now + 6;
          window.dispatchEvent(new Event("nib:turbo"));
        }
      }
    };
    const onFocus = (e: FocusEvent) => {
      if (!keyboard || !(e.target instanceof Element)) return;
      const c = classify(e.target);
      const r = e.target.getBoundingClientRect();
      enableMouse();
      brain.pointerMove(r.left + 6, r.top + r.height / 2);
      hoverEl = c.el ?? e.target;
      brain.setTarget(c.kind === "none" ? "link" : c.kind, toRect(hoverEl));
    };
    let lastY = scrollY, lastT = performance.now();
    const onScroll = () => {
      brain.poke();
      const now = performance.now();
      const v = ((scrollY - lastY) / Math.max(1, now - lastT)) * 1000;
      brain.scrollV += (v - brain.scrollV) * 0.3;
      lastY = scrollY;
      lastT = now;
    };
    const onRm = () => { brain.reduced = rm.matches; };

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      const dt = (t - last) / 1000; last = t;
      brain.night = root.dataset.theme === "night";
      rectTimer += dt;
      if (rectTimer > 0.1) {
        rectTimer = 0;
        if (hoverEl) {
          if (hoverEl.isConnected) brain.setTarget(brain.kind, toRect(hoverEl));
          else { hoverEl = null; brain.setTarget("none", null); }
        }
      }
      brain.update(dt);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      drawNib(ctx, brain);

      // Hero arrow looks at NIB (Step 7.3)
      if (!rm.matches && document.documentElement.dataset.fx !== "off") {
        const arrowEl = document.getElementById("hero-arrow");
        if (arrowEl && brain.alpha > 0.2) {
          const rect = arrowEl.getBoundingClientRect();
          const ax = rect.left + rect.width / 2;
          const ay = rect.top + rect.height / 2;
          const angle = (Math.atan2(brain.tipY - ay, brain.tipX - ax) * 180) / Math.PI;
          arrowEl.style.setProperty("--look", `${angle.toFixed(1)}deg`);
        }
      }
    };
    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const onBack = (e: Event) => {
      const away = (e as CustomEvent<number>).detail ?? 0;
      if (away >= 5) {
        brain.pointerDown();
        brain.pointerUp();
      }
    };
    window.addEventListener("nib:back", onBack);

    resize();
    raf = requestAnimationFrame(frame);
    addEventListener("resize", resize);
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerdown", onDown, { passive: true });
    addEventListener("pointerup", onUp, { passive: true });
    addEventListener("pointercancel", onUp, { passive: true });
    addEventListener("pointerover", onOver, { passive: true });
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("keydown", onKey);
    addEventListener("focusin", onFocus);
    root.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVis);
    rm.addEventListener("change", onRm);

    return () => {
      if (touchHatchTimer) clearTimeout(touchHatchTimer);
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      removeEventListener("pointerup", onUp);
      removeEventListener("pointercancel", onUp);
      removeEventListener("pointerover", onOver);
      removeEventListener("scroll", onScroll);
      removeEventListener("keydown", onKey);
      removeEventListener("focusin", onFocus);
      root.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
      rm.removeEventListener("change", onRm);
      window.removeEventListener("nib:adopted", onAdopted);
      window.removeEventListener("nib:trust", onTrust);
      window.removeEventListener("nib:back", onBack);
      root.classList.remove("nib-on");
      nib.brain = null;
    };
  }, []);

  return <canvas ref={ref} className="nib-canvas" aria-hidden="true" />;
}
