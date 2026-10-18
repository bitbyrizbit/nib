"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Window from "@/components/shell/Window";
import { ensure, getTime, pluckAt, subscribeAudio, isMuted, useMuted, play } from "@/lib/audio";
import { nib } from "@/components/nib/nibBus";

const NOTES = [523.25, 587.33, 659.25, 783.99];
const NAMES = ["C", "D", "E", "G"];
const LOOKAHEAD = 0.12;
const TICK = 25;

const toHex = (cols: number[]) => cols.map((n) => n.toString(16).toUpperCase()).join("");
const fromHex = (s: string) => s.split("").map((c) => parseInt(c, 16));

export default function NibbleBox() {
  const [cols, setCols] = useState<number[]>(() => {
    if (typeof window !== "undefined") {
      const m = window.location.hash.match(/^#box=([0-9a-fA-F]{4})$/);
      if (m) return fromHex(m[1]);
    }
    return [9, 2, 5, 2];
  });
  const [bpm, setBpm] = useState(100);
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);
  const [msg, setMsg] = useState("");
  const muted = useMuted();

  const colsRef = useRef(cols);
  const bpmRef = useRef(bpm);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextTime = useRef(0);
  const nextStep = useRef(0);

  useEffect(() => {
    colsRef.current = cols;
  }, [cols]);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  const stop = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    setPlaying(false);
    setStep(-1);
  }, []);

  const start = useCallback(() => {
    const c = ensure();
    if (!c || isMuted()) return;
    nextStep.current = 0;
    nextTime.current = c.currentTime + 0.08;
    setPlaying(true);
    timer.current = setInterval(() => {
      while (nextTime.current < getTime() + LOOKAHEAD) {
        const i = nextStep.current;
        const t = nextTime.current;
        const value = colsRef.current[i];
        NOTES.forEach((f, bit) => {
          if (value & (1 << bit)) pluckAt(f, t);
        });
        const delayMs = Math.max(0, (t - getTime()) * 1000);
        setTimeout(() => {
          setStep(i);
          if (nib.brain) nib.brain.hop.v = -90;
        }, delayMs);
        nextTime.current += 60 / bpmRef.current / 2;
        nextStep.current = (i + 1) % 4;
      }
    }, TICK);
  }, []);

  useEffect(() => subscribeAudio(() => {
    if (isMuted()) stop();
  }), [stop]);

  useEffect(() => stop, [stop]);

  useEffect(() => {
    const onHide = () => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [stop]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash.startsWith("#box=")) {
      document.getElementById("nibble-box")?.scrollIntoView({ block: "center" });
    }
  }, []);

  const toggle = (c: number, bit: number) =>
    setCols((prev) => prev.map((v, i) => (i === c ? v ^ (1 << bit) : v)));

  const copy = async () => {
    if (typeof window === "undefined") return;
    const url = `${location.origin}${location.pathname}#box=${toHex(cols)}`;
    try {
      await navigator.clipboard.writeText(url);
      play("copied");
      setMsg("link copied");
    } catch {
      setMsg(url);
    }
    setTimeout(() => setMsg(""), 3000);
  };

  const shake = () => {
    play("shake");
    setCols(Array.from({ length: 4 }, () => Math.floor(Math.random() * 16)));
  };

  return (
    <Window title="nibble_box.exe" id="nibble-box" className="nibble-box-window">
      <div className="nibble-box-content">
        <p className="box-desc">Four steps. Four bits each. Tap the pads to build a tune, then press play.</p>
        <div className="box" role="group" aria-label="Nibble Box pattern">
          {cols.map((value, c) => (
            <div key={c} className="box__col" data-active={step === c}>
              <div className="box__hex" aria-hidden="true">0x{value.toString(16).toUpperCase()}</div>
              {[3, 2, 1, 0].map((bit) => (
                <button
                  key={bit}
                  type="button"
                  className="box__pad"
                  aria-pressed={!!(value & (1 << bit))}
                  aria-label={`Step ${c + 1}, note ${NAMES[bit]}, ${value & (1 << bit) ? "on" : "off"}`}
                  onClick={() => toggle(c, bit)}
                />
              ))}
            </div>
          ))}
        </div>
        <p className="box__code" aria-live="polite">pattern 0x{toHex(cols)}</p>
        <div className="box__controls">
          <button type="button" className="tb-btn" disabled={muted} onClick={playing ? stop : start}>
            {muted ? "unmute to play" : playing ? "stop" : "play"}
          </button>
          <button type="button" className="tb-btn" onClick={() => setCols([0, 0, 0, 0])}>clear</button>
          <button
            type="button"
            className="tb-btn"
            onClick={shake}
          >
            shake
          </button>
          <button type="button" className="tb-btn" onClick={copy}>copy link</button>
          <label className="box__tempo">
            tempo {bpm}
            <input
              type="range"
              min={60}
              max={180}
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
            />
          </label>
        </div>
        {msg && <p role="status" className="hint">{msg}</p>}
        <div className="box__footer">
          <span className="stamp">made by nib · 16 bits</span>
        </div>
      </div>
    </Window>
  );
}
