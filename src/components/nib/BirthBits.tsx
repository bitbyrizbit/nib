"use client";
import { useEffect, useState } from "react";

export default function BirthBits() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (document.documentElement.dataset.fx === "off") return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (sessionStorage.getItem("nib:born")) return;
    } catch {}
    setShow(true);
    const hide = () => setShow(false);
    window.addEventListener("nib:hatched", hide, { once: true });
    return () => window.removeEventListener("nib:hatched", hide);
  }, []);

  if (!show) return null;

  return (
    <div className="birth" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}
