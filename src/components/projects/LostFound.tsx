"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Window from "@/components/shell/Window";
import { saveJSON } from "@/lib/storage";
import { play } from "@/lib/audio";

export type LostItem = {
  id: string;
  name: string;
  line: string;
  render: () => React.ReactNode;
};

const LOST_ITEMS: LostItem[] = [
  {
    id: "dead-link",
    name: "The Dead Link",
    line: "A link that never went anywhere. It still looks so sure of itself.",
    render: () => (
      <div className="lost-art lost-art--link">
        <span className="lost-link-text">click here!!</span>
        <svg viewBox="0 0 40 20" className="lost-crack" aria-hidden="true">
          <path d="M5 2 L18 10 L28 6 L35 18" stroke="#e8412f" strokeWidth="1.5" fill="none" />
        </svg>
      </div>
    ),
  },
  {
    id: "broken-image",
    name: "The Broken Picture",
    line: "It's missing a picture. I told it I can't see it either, but I believe in it.",
    render: () => (
      <div className="lost-art lost-art--frame">
        <svg viewBox="0 0 48 38" className="lost-frame-svg" aria-hidden="true">
          <rect x="2" y="2" width="44" height="34" fill="#f6f1e0" stroke="#1c1b18" strokeWidth="2" />
          <path d="M28 2 L46 20" stroke="#1c1b18" strokeWidth="2" fill="#a79f86" />
          <path d="M8 28 L18 16 L28 26 L36 18 L42 24" stroke="#1c1b18" strokeWidth="1.5" fill="none" />
          <circle cx="14" cy="10" r="3" fill="#e8412f" />
        </svg>
      </div>
    ),
  },
  {
    id: "spinner",
    name: "The Lost Spinner",
    line: "It's been loading forever. I sit with it. We are both waiting.",
    render: () => (
      <div className="lost-art lost-art--spinner">
        <div className="retro-spinner" aria-hidden="true" />
      </div>
    ),
  },
  {
    id: "construction",
    name: "The Unfinished Sign",
    line: "Somebody was going to finish this. I'm not going to say who. I'll finish it.",
    render: () => (
      <div className="lost-art lost-art--sign">
        <div className="hazard-stripes">
          <span>UNDER CONSTRUCTION</span>
        </div>
        <div className="half-bar"><div className="half-bar-fill" /></div>
      </div>
    ),
  },
  {
    id: "badge",
    name: "The 800 by 600 Badge",
    line: "800 by 600! The whole world fit in it once. It gets very cozy.",
    render: () => (
      <div className="lost-art lost-art--badge">
        <div className="web-badge">
          <span className="badge-top">BEST VIEWED</span>
          <span className="badge-bot">800 x 600</span>
        </div>
      </div>
    ),
  },
  {
    id: "floppy",
    name: "The Floppy",
    line: "It remembers things nobody asked it to save. I asked it to remember me.",
    render: () => (
      <div className="lost-art lost-art--floppy">
        <svg viewBox="0 0 40 40" className="floppy-svg" aria-hidden="true">
          <path d="M4 4 L32 4 L36 8 L36 36 L4 36 Z" fill="#2c3354" stroke="#1c1b18" strokeWidth="2" />
          <rect x="10" y="4" width="20" height="14" fill="#a79f86" stroke="#1c1b18" strokeWidth="1.5" />
          <rect x="22" y="7" width="5" height="8" fill="#1c1b18" />
          <rect x="8" y="22" width="24" height="14" fill="#f6f1e0" stroke="#1c1b18" strokeWidth="1.5" />
          <line x1="12" y1="26" x2="28" y2="26" stroke="#1c1b18" strokeWidth="1" />
          <line x1="12" y1="30" x2="24" y2="30" stroke="#1c1b18" strokeWidth="1" />
        </svg>
        <span className="floppy-lbl">save as...</span>
      </div>
    ),
  },
];

const STORAGE_KEY = "nib:adopted";

const subscribeAdopted = (cb: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", cb);
  window.addEventListener("nib:adopted", cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener("nib:adopted", cb);
  };
};

const getAdoptedSnapshot = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
};

const getAdoptedServerSnapshot = () => "[]";

export default function LostFound() {
  const adoptedRaw = useSyncExternalStore(subscribeAdopted, getAdoptedSnapshot, getAdoptedServerSnapshot);
  const adopted: string[] = (() => {
    try {
      return JSON.parse(adoptedRaw) as string[];
    } catch {
      return [];
    }
  })();

  const [selected, setSelected] = useState<LostItem | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelected(null);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  const adopt = (id: string) => {
    if (adopted.includes(id)) return;
    const next = [...adopted, id];
    saveJSON(STORAGE_KEY, next);
    play("adopt");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("nib:adopted", { detail: next.length }));
    }
  };

  const reset = () => {
    saveJSON(STORAGE_KEY, []);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("nib:adopted", { detail: 0 }));
    }
  };

  const openNote = (item: LostItem, el: HTMLButtonElement) => {
    triggerRef.current = el;
    setSelected(item);
  };

  return (
    <Window title="lost_and_found.shelf" id="lost-found" className="lost-found-window" tilt>
      <div className="lost-found">
        <header className="lost-header">
          <p className="lost-desc">
            Abandoned pieces of the web NIB adopted after landing on the 404. Click an object to read its story.
          </p>
          <div className="lost-counter" aria-live="polite">
            adopted <span className="lost-num">{adopted.length}</span> of {LOST_ITEMS.length}
          </div>
        </header>

        <div className="lost-grid" role="group" aria-label="Shelf of adopted web objects">
          {LOST_ITEMS.map((item) => {
            const isAdopted = adopted.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                className="lost-item"
                data-adopted={isAdopted}
                aria-label={`Open note about ${item.name}${isAdopted ? " (adopted)" : ""}`}
                onClick={(e) => openNote(item, e.currentTarget)}
              >
                {item.render()}
                <span className="lost-name">{item.name}</span>
                {isAdopted && <span className="lost-stamp" aria-hidden="true">♥ adopted</span>}
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="lost-modal-backdrop" onClick={() => { setSelected(null); triggerRef.current?.focus(); }}>
            <div className="lost-modal-wrap" onClick={(e) => e.stopPropagation()}>
              <Window title={`note / ${selected.name}`} defaultOpen={true}>
                <div className="lost-note-body">
                  <div className="lost-note-art">{selected.render()}</div>
                  <p className="lost-note-quote">&ldquo;{selected.line}&rdquo;</p>
                  <p className="lost-note-author">— nib</p>
                  <div className="lost-note-actions">
                    {adopted.includes(selected.id) ? (
                      <button disabled type="button" className="tb-btn lost-btn-disabled" aria-disabled="true">
                        ♥ already adopted
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="tb-btn lost-btn-adopt"
                        onClick={() => adopt(selected.id)}
                      >
                        adopt this object ♥
                      </button>
                    )}
                    <button
                      type="button"
                      className="tb-btn"
                      onClick={() => { setSelected(null); triggerRef.current?.focus(); }}
                    >
                      close
                    </button>
                  </div>
                </div>
              </Window>
            </div>
          </div>
        )}

        <footer className="lost-footer">
          <button type="button" className="lost-reset-btn" onClick={reset}>
            [ reset shelf ]
          </button>
          <span className="maker-mark">made by nib · 4 bits</span>
        </footer>
      </div>
    </Window>
  );
}
