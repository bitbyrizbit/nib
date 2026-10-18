"use client";
import { useEffect, useRef, useState } from "react";
import Window from "@/components/shell/Window";
import { rememberName } from "@/lib/visitor";
import type { Entry } from "@/lib/types";

const FACES = ["hi", "wow", "zzz", "love"] as const;
const ago = (ts: number) => {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
};

export default function Guestbook() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [total, setTotal] = useState(0);
  const [demo, setDemo] = useState(false);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [face, setFace] = useState(0);
  const [hp, setHp] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const shownAt = useRef(0);

  const reload = async () => {
    setState("loading");
    try {
      const r = await fetch("/api/guestbook", { cache: "no-store" });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setEntries(d.entries);
      setTotal(d.total);
      setDemo(!!d.demo);
      setState("ready");
    } catch {
      setState("error");
    }
  };

  useEffect(() => {
    shownAt.current = Date.now();
    let dead = false;
    (async () => {
      try {
        const r = await fetch("/api/guestbook", { cache: "no-store" });
        if (!r.ok) throw new Error();
        const d = await r.json();
        if (dead) return;
        setEntries(d.entries);
        setTotal(d.total);
        setDemo(!!d.demo);
        setState("ready");
      } catch {
        if (!dead) setState("error");
      }
    })();
    return () => {
      dead = true;
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setStatus("");
    try {
      const r = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message, face, hp, t: Date.now() - shownAt.current }),
      });
      const d = await r.json();
      if (!r.ok) {
        setStatus(d.error ?? "something went wrong.");
        return;
      }
      setEntries((prev) => [d.entry, ...prev]);
      setTotal((t) => t + 1);
      if (name) rememberName(name);
      setMessage("");
      setStatus("thank you! nib put it on the wall.");
    } catch {
      setStatus("couldn't reach the wall. try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Window title="guestbook.html" id="guestbook" className="guestbook-window">
      <div className="gb">
        <p className="gb__intro">Leave a note for NIB. It reads every one (slowly).</p>
        {demo && (
          <p className="hint gb__demo" role="status">
            demo mode: notes are not saved
          </p>
        )}
        <form onSubmit={submit} className="gb__form">
          <label className="gb__field">
            <span className="gb__label">name (optional)</span>
            <input
              type="text"
              className="gb__input"
              value={name}
              maxLength={24}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              placeholder="anonymous"
            />
          </label>
          <label className="gb__field">
            <span className="gb__label">your note</span>
            <textarea
              className="gb__textarea"
              value={message}
              maxLength={140}
              rows={3}
              required
              onChange={(e) => setMessage(e.target.value)}
              placeholder="hello little cursor..."
            />
            <span className="hint gb__count-hint">{message.length}/140</span>
          </label>
          <fieldset className="gb__faces">
            <legend className="gb__label">pick a face</legend>
            <div className="gb__face-options">
              {FACES.map((f, i) => (
                <label key={f} className="gb__face-opt">
                  <input
                    type="radio"
                    name="face"
                    checked={face === i}
                    onChange={() => setFace(i)}
                  />{" "}
                  {f}
                </label>
              ))}
            </div>
          </fieldset>
          <input
            className="hp"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
          />
          <button type="submit" className="tb-btn gb__submit" disabled={busy}>
            {busy ? "sending..." : "sign the wall"}
          </button>
          <p role="status" aria-live="polite" className="hint gb__status">
            {status}
          </p>
        </form>
        {state === "loading" && <p className="hint">loading the wall...</p>}
        {state === "error" && (
          <p className="hint">
            the wall is asleep.{" "}
            <button type="button" className="tb-btn" onClick={reload}>
              try again
            </button>
          </p>
        )}
        {state === "ready" && entries.length === 0 && (
          <p className="hint">nobody here yet. be the first.</p>
        )}
        {state === "ready" && entries.length > 0 && (
          <div className="gb__feed">
            <p className="hint gb__wall-title">
              {total} note{total === 1 ? "" : "s"} on the wall
            </p>
            <ul className="gb__wall">
              {entries.map((en) => (
                <li
                  key={en.id}
                  className="gb__card"
                  style={{
                    transform: `rotate(${(parseInt(en.id.slice(0, 2), 16) % 7) - 3}deg)`,
                  }}
                >
                  <p className="gb__msg">{en.message}</p>
                  <footer className="gb__meta">
                    {en.name} · {FACES[en.face]} · {ago(en.ts)}
                  </footer>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Window>
  );
}
