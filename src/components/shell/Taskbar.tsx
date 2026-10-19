"use client";
import { useEffect, useState } from "react";
import { NAV } from "@/lib/nav";
import ThemeToggle from "./ThemeToggle";
import MuteButton from "./MuteButton";
import TrustMeter from "./TrustMeter";
import DialDialog from "./DialDialog";

export default function Taskbar() {
  const [menu, setMenu] = useState(false);
  const [dialOpen, setDialOpen] = useState(false);
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }));
    tick();
    const id = setInterval(tick, 20000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  return (
    <>
      {menu && (
        <nav className="start-menu" aria-label="Sections">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={() => setMenu(false)}>{n.label}</a>
          ))}
          <button
            type="button"
            className="start-menu__action"
            onClick={() => {
              setMenu(false);
              setDialOpen(true);
            }}
          >
            dial up...
          </button>
        </nav>
      )}
      <div className="taskbar" role="toolbar" aria-label="nib taskbar">
        <button type="button" className="tb-btn" aria-expanded={menu} aria-haspopup="true" onClick={() => setMenu((m) => !m)}>nib ▸</button>
        <div className="taskbar__spacer" />
        <TrustMeter />
        <MuteButton />
        <ThemeToggle />
        <span className="tb-clock" aria-label="Local time">{time}</span>
      </div>
      <DialDialog open={dialOpen} onClose={() => setDialOpen(false)} />
    </>
  );
}
