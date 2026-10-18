"use client";
import { useId, useState, type ReactNode } from "react";

export default function Window({ title, children, id, className = "", defaultOpen = true }: {
  title: string; children: ReactNode; id?: string; className?: string; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();
  return (
    <section id={id} className={`window ${className}`} aria-label={title}>
      <header className="window__bar">
        <span className="window__title">{title}</span>
        <button type="button" className="window__btn" aria-expanded={open} aria-controls={bodyId}
          aria-label={open ? `Minimize ${title}` : `Restore ${title}`} onClick={() => setOpen((o) => !o)}>
          {open ? "–" : "+"}
        </button>
      </header>
      <div id={bodyId} className="window__body" hidden={!open}>{children}</div>
    </section>
  );
}
