import { BODY } from "./nibShape";

export default function NibSvg({ size = 80, mood = "idle", x = 0, y = 0, rotate = 0 }: {
  size?: number; mood?: "idle" | "happy" | "sleepy"; x?: number; y?: number; rotate?: number;
}) {
  const s = size / 32;
  const pts = BODY.map(([a, b]) => `${a},${b}`).join(" ");
  const eye = (cx: number, cy: number) =>
    mood === "happy" ? (
      <path key={`${cx}-${cy}`} d={`M${cx - 1.8} ${cy + 0.8} Q${cx} ${cy - 1.6} ${cx + 1.8} ${cy + 0.8}`} fill="none" stroke="#1c1b18" strokeWidth="0.8" />
    ) : (
      <g key={`${cx}-${cy}`}>
        <circle cx={cx} cy={cy} r="2.2" fill="#fff" stroke="#1c1b18" strokeWidth="0.8" />
        <circle cx={cx} cy={cy} r="1" fill="#1c1b18" />
      </g>
    );
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${s})`}>
      <polygon points={pts} fill="#ffd23f" stroke="#1c1b18" strokeWidth="1.5" strokeLinejoin="round" />
      {eye(4.4, 12)}{eye(9.2, 13.3)}
    </g>
  );
}
