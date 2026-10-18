"use client";
import { useId, useRef, useState, type ReactNode } from "react";
import { useReveal, useTilt } from "@/lib/useMotion";

export default function Window({
  title,
  children,
  id,
  className = "",
  defaultOpen = true,
  tilt = false,
}: {
  title: string;
  children: ReactNode;
  id?: string;
  className?: string;
  defaultOpen?: boolean;
  tilt?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();
  const ref = useRef<HTMLElement>(null);

  useReveal(ref);
  if (tilt) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useTilt(ref);
  }

  return (
    <section
      ref={ref}
      id={id}
      className={`window ${tilt ? "window--tilt" : ""} ${className}`}
      aria-label={title}
    >
      <header className="window__bar">
        <span className="window__title">{title}</span>
        <button
          type="button"
          className="window__btn"
          aria-expanded={open}
          aria-controls={bodyId}
          aria-label={open ? `Minimize ${title}` : `Restore ${title}`}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "–" : "+"}
        </button>
      </header>
      <div id={bodyId} className="window__body" hidden={!open}>
        {children}
      </div>
    </section>
  );
}
