"use client";
import { useEffect, useRef, useState } from "react";
import { nib, nibBus } from "./nibBus";
import type { Mood } from "./nibBrain";
import { touchVisitor } from "@/lib/visitor";

const LINES: Partial<Record<Mood, string>> = {
  curious: "oh! a link",
  read: "reading is hard. i'm trying.",
  pout: "that one's not for me.",
  asleep: "zzz",
  dizzy: "whoa. too fast.",
};

export default function NibVoice() {
  const el = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");
  const seenRef = useRef<Set<string>>(new Set());
  const lastSaidRef = useRef<number>(-99);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    let raf = 0;

    const say = (t: string, force = false) => {
      const now = performance.now() / 1000;
      if (!force && now - lastSaidRef.current < 15) return;
      lastSaidRef.current = now;
      setText(t);
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => setText(""), 2400);
    };

    const unsub = nibBus.subscribe(() => {
      const m = nibBus.get();
      const line = LINES[m];
      if (line && !seenRef.current.has(m)) {
        seenRef.current.add(m);
        say(line);
      }
    });

    if (nib.brain) {
      nib.brain.onWake = () => say("i'm up! i'm up.");
    }

    const onAdopt = (e: Event) => {
      const count = (e as CustomEvent<number>).detail;
      if (count > 0 && !seenRef.current.has("adopt")) {
        seenRef.current.add("adopt");
        say("i made a friend.");
      }
    };

    const onEgg = () => say("you found it.", true);

    const onTheme = (e: Event) => {
      const mode = (e as CustomEvent<string>).detail;
      if (mode === "night" && !seenRef.current.has("night")) {
        seenRef.current.add("night");
        say("lights down.");
      } else if (mode === "day" && !seenRef.current.has("day")) {
        seenRef.current.add("day");
        say("good morning.");
      }
    };

    const onBack = (e: Event) => {
      const away = (e as CustomEvent<number>).detail ?? 0;
      if (away >= 5) {
        if (away < 20) {
          say("you're back!", true);
        } else if (away < 300) {
          say("i hid. i'm okay.", true);
        } else {
          say("i waited. hi.", true);
        }
      }
    };

    const onTurbo = () => {
      say("level up.", true);
    };

    const lastFlinchRef = { current: 0 };
    const onFlinch = () => {
      const now = performance.now() / 1000;
      if (now - lastFlinchRef.current < 10) return;
      lastFlinchRef.current = now;
      say("ow. gently?", true);
    };

    const onPip = (e: Event) => {
      const p = (e as CustomEvent<number>).detail;
      const lines: Record<number, string> = {
        1: "...hi.",
        2: "you're nice.",
        3: "i like it here.",
        4: "i trust you.",
      };
      if (lines[p]) say(lines[p]);
    };

    const onDiary = () => {
      say("new page in my diary.");
    };

    window.addEventListener("nib:adopted", onAdopt);
    window.addEventListener("nib:egg", onEgg);
    window.addEventListener("nib:theme", onTheme);
    window.addEventListener("nib:back", onBack);
    window.addEventListener("nib:turbo", onTurbo);
    window.addEventListener("nib:flinch", onFlinch);
    window.addEventListener("nib:pip", onPip);
    window.addEventListener("nib:diary", onDiary);

    const hi = setTimeout(() => {
      if (!seenRef.current.has("hi")) {
        seenRef.current.add("hi");
        const vis = touchVisitor();
        if (vis.visits > 1) {
          const h = new Date().getHours();
          let base = "hi again.";
          if (h >= 0 && h < 5) base = "you're up late too.";
          else if (h >= 5 && h < 12) base = "good morning.";
          else if (h >= 12 && h < 18) base = "hi again.";
          else base = "good evening.";

          if (vis.name) {
            say(`${base.replace(/\.$/, "")}, ${vis.name}.`);
          } else {
            say(base);
          }
        } else {
          say("hi. be gentle.");
        }
      }
    }, 2500);

    const follow = () => {
      raf = requestAnimationFrame(follow);
      const b = nib.brain;
      const e = el.current;
      if (!b || !e) return;
      e.style.transform = `translate(${Math.min(b.tipX + 34, window.innerWidth - 220)}px, ${Math.max(b.tipY - 40, 8)}px)`;
      e.style.opacity = text && b.alpha > 0.05 ? String(b.alpha) : "0";
    };
    follow();

    return () => {
      unsub();
      clearTimeout(hi);
      clearTimeout(hideTimerRef.current);
      cancelAnimationFrame(raf);
      window.removeEventListener("nib:adopted", onAdopt);
      window.removeEventListener("nib:egg", onEgg);
      window.removeEventListener("nib:theme", onTheme);
      window.removeEventListener("nib:back", onBack);
      window.removeEventListener("nib:turbo", onTurbo);
      window.removeEventListener("nib:flinch", onFlinch);
      window.removeEventListener("nib:pip", onPip);
      window.removeEventListener("nib:diary", onDiary);
      if (nib.brain) nib.brain.onWake = null;
    };
  }, [text]);

  return (
    <div ref={el} className="voice" aria-hidden="true">
      {text}
    </div>
  );
}
