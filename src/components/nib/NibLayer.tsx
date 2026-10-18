"use client";
import { useEffect, useRef } from "react";
import { NibBrain } from "./nibBrain";
import { drawNib } from "./nibRenderer";
import { classify } from "./classify";
import { nib, nibBus } from "./nibBus";

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

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      keyboard = false; enableMouse(); brain.pointerMove(e.clientX, e.clientY);
    };
    const onDown = (e: PointerEvent) => {
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
    const onKey = (e: KeyboardEvent) => { if (e.key === "Tab") keyboard = true; };
    const onFocus = (e: FocusEvent) => {
      if (!keyboard || !(e.target instanceof Element)) return;
      const c = classify(e.target);
      const r = e.target.getBoundingClientRect();
      enableMouse();
      brain.pointerMove(r.left + 6, r.top + r.height / 2);
      hoverEl = c.el ?? e.target;
      brain.setTarget(c.kind === "none" ? "link" : c.kind, toRect(hoverEl));
    };
    const onScroll = () => brain.poke();
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
    };
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else { last = performance.now(); raf = requestAnimationFrame(frame); }
    };

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
      root.classList.remove("nib-on");
      nib.brain = null;
    };
  }, []);

  return <canvas ref={ref} className="nib-canvas" aria-hidden="true" />;
}
