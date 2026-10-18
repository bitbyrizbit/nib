"use client";

import { pop } from "@/lib/audio";

export default function DesktopIcons() {
  const icons = [
    {
      id: "projects",
      label: "lost+found",
      href: "#projects",
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
          <rect x="4" y="6" width="24" height="20" fill="var(--plastic)" stroke="var(--line)" strokeWidth="2" />
          <path d="M4 12 L28 12" stroke="var(--line)" strokeWidth="2" />
          <path d="M12 6 L12 12" stroke="var(--line)" strokeWidth="2" />
          <circle cx="16" cy="19" r="3" fill="var(--signal)" />
        </svg>
      ),
    },
    {
      id: "nibble-box",
      label: "nibble box",
      href: "#nibble-box",
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
          <rect x="4" y="4" width="24" height="24" fill="var(--plastic-lo)" stroke="var(--line)" strokeWidth="2" />
          <rect x="8" y="8" width="6" height="6" fill="var(--nib)" />
          <rect x="18" y="8" width="6" height="6" fill="var(--plastic)" />
          <rect x="8" y="18" width="6" height="6" fill="var(--plastic)" />
          <rect x="18" y="18" width="6" height="6" fill="var(--signal)" />
        </svg>
      ),
    },
    {
      id: "guestbook",
      label: "guestbook",
      href: "#guestbook",
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
          <rect x="5" y="4" width="22" height="24" fill="#fff" stroke="var(--line)" strokeWidth="2" />
          <line x1="9" y1="9" x2="23" y2="9" stroke="var(--line)" strokeWidth="2" />
          <line x1="9" y1="14" x2="23" y2="14" stroke="var(--line)" strokeWidth="2" />
          <line x1="9" y1="19" x2="19" y2="19" stroke="var(--line)" strokeWidth="2" />
        </svg>
      ),
    },
    {
      id: "about",
      label: "nib.txt",
      href: "#about",
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M6 4 L20 4 L26 10 L26 28 L6 28 Z" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />
          <path d="M20 4 L20 10 L26 10" fill="var(--plastic-hi)" stroke="var(--line)" strokeWidth="2" />
          <line x1="10" y1="14" x2="22" y2="14" stroke="var(--text-soft)" strokeWidth="1.5" />
          <line x1="10" y1="18" x2="22" y2="18" stroke="var(--text-soft)" strokeWidth="1.5" />
          <line x1="10" y1="22" x2="18" y2="22" stroke="var(--text-soft)" strokeWidth="1.5" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="desktop-icons" aria-label="Desktop shortcuts">
      {icons.map((item) => (
        <a
          key={item.id}
          href={item.href}
          className="desktop-icon"
          onClick={() => pop()}
        >
          <div className="desktop-icon__img">{item.icon}</div>
          <span className="desktop-icon__label">{item.label}</span>
        </a>
      ))}
    </aside>
  );
}
