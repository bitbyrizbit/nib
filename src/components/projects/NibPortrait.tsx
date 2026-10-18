import { BODY } from "@/components/nib/nibShape";

export default function NibPortrait({ size = 120 }: { size?: number }) {
  const pts = BODY.map(([x, y]) => `${x + 1},${y + 1}`).join(" ");
  return (
    <svg
      viewBox="0 0 24 34"
      width={size}
      height={Math.round((size * 34) / 24)}
      role="img"
      aria-label="NIB, a baby cursor"
      className="takehome-svg"
    >
      <polygon points={pts} fill="#ffd23f" stroke="#1c1b18" strokeWidth="1.5" strokeLinejoin="round" />
      <g stroke="#1c1b18" strokeWidth="0.8">
        <circle cx="5.4" cy="13" r="2.2" fill="#fff" />
        <circle cx="10.2" cy="14.3" r="2.2" fill="#fff" />
      </g>
      <circle cx="5.4" cy="13" r="1" fill="#1c1b18" />
      <circle cx="10.2" cy="14.3" r="1" fill="#1c1b18" />
      <path d="M6.8 17.6 Q7.8 18.7 8.8 17.6" fill="none" stroke="#1c1b18" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}
