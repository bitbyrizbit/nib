import NibSvg from "@/components/nib/NibSvg";

export default function StageArt({ scene, local }: { scene: number; local: number }) {
  if (scene === 0) {
    // Scene 1: 0101 - Four bits in the dark, 2 and 4 lit and pulsing
    return (
      <g>
        <rect width="400" height="300" fill="#141412" />
        <text x="200" y="90" textAnchor="middle" fill="#a79f86" fontFamily="var(--font-mono)" fontSize="18" letterSpacing="0.1em">
          [ 0 1 0 1 ]
        </text>
        {/* Bit 1: 0 */}
        <rect x="126" y="138" width="28" height="28" fill="#2b2820" stroke="#4a4637" strokeWidth="2" rx="2" />
        {/* Bit 2: 1 */}
        <rect x="166" y="138" width="28" height="28" fill="#ffd23f" stroke="#1c1b18" strokeWidth="2" rx="2" opacity={0.6 + Math.sin(local * Math.PI * 2) * 0.4} />
        {/* Bit 3: 0 */}
        <rect x="206" y="138" width="28" height="28" fill="#2b2820" stroke="#4a4637" strokeWidth="2" rx="2" />
        {/* Bit 4: 1 */}
        <rect x="246" y="138" width="28" height="28" fill="#ffd23f" stroke="#1c1b18" strokeWidth="2" rx="2" opacity={0.6 + Math.sin(local * Math.PI * 2) * 0.4} />
        <text x="200" y="210" textAnchor="middle" fill="#7dffb0" fontFamily="var(--font-mono)" fontSize="16">
          waiting for a click...
        </text>
      </g>
    );
  }

  if (scene === 1) {
    // Scene 2: First click - bits merge into a blob, eyes open, click ripple expands
    const eyeOpen = Math.min(1, Math.max(0.1, local * 1.5));
    const ringR = 20 + local * 60;
    const ringAlpha = Math.max(0, 1 - local);
    return (
      <g>
        <rect width="400" height="300" fill="#f4eee1" />
        {/* Expanding click ring */}
        <circle cx="200" cy="150" r={ringR} fill="none" stroke="#e8412f" strokeWidth="2" strokeDasharray="4 4" opacity={ringAlpha} />
        {/* Emerging blob */}
        <ellipse cx="200" cy="150" rx="38" ry="32" fill="#ffd23f" stroke="#1c1b18" strokeWidth="2" />
        {/* Opening eyes */}
        <ellipse cx="188" cy="148" rx="4" ry={4 * eyeOpen} fill="#fff" stroke="#1c1b18" strokeWidth="1" />
        <circle cx="188" cy="148" r={1.8 * eyeOpen} fill="#1c1b18" />
        <ellipse cx="212" cy="148" rx="4" ry={4 * eyeOpen} fill="#fff" stroke="#1c1b18" strokeWidth="1" />
        <circle cx="212" cy="148" r={1.8 * eyeOpen} fill="#1c1b18" />
        {/* Small mouth */}
        <ellipse cx="200" cy="160" rx="2.5" ry="2" fill="#1c1b18" />
        <text x="200" y="225" textAnchor="middle" fill="#1c1b18" fontFamily="var(--font-display)" fontSize="20">
          *click!*
        </text>
      </g>
    );
  }

  if (scene === 2) {
    // Scene 3: First hover - NIB meets a link and transforms into a happy hand pointer
    const isHand = local > 0.4;
    return (
      <g>
        <rect width="400" height="300" fill="#f6f1e0" />
        {/* Blue link */}
        <g transform="translate(80 145)">
          <text x="0" y="0" fill="#0000ee" fontFamily="var(--font-mono)" fontSize="24" textDecoration="underline" fontWeight="bold">
            click here &gt;&gt;
          </text>
        </g>
        {isHand ? (
          // Glove hand shape with happy eyes
          <g transform="translate(230 110)">
            <path d="M12 0 C16 0 18 4 18 12 L18 20 C24 20 28 24 28 30 L28 46 C28 54 22 58 12 58 C2 58 0 52 0 44 L0 26 C0 20 6 20 12 20 Z" fill="#ffd23f" stroke="#1c1b18" strokeWidth="2" strokeLinejoin="round" />
            <path d="M6 32 Q9 30 12 32" stroke="#1c1b18" strokeWidth="1.5" fill="none" />
            <path d="M16 32 Q19 30 22 32" stroke="#1c1b18" strokeWidth="1.5" fill="none" />
            <path d="M11 40 Q14 43 17 40" stroke="#1c1b18" strokeWidth="1.5" fill="none" />
          </g>
        ) : (
          <NibSvg x={220} y={115} size={70} mood="happy" rotate={-10} />
        )}
        <text x="200" y="235" textAnchor="middle" fill="#e8412f" fontFamily="var(--font-display)" fontSize="18">
          {isHand ? "I get a hand!" : "leaning in..."}
        </text>
      </g>
    );
  }

  if (scene === 3) {
    // Scene 4: First mistake - 404, tangled tail, lonely abandoned web objects
    return (
      <g>
        <rect width="400" height="300" fill="#20222b" />
        {/* Floating 404s */}
        <text x="60" y="80" fill="#4a5068" fontFamily="var(--font-mono)" fontSize="32" transform="rotate(-12 60 80)">404</text>
        <text x="310" y="90" fill="#4a5068" fontFamily="var(--font-mono)" fontSize="28" transform="rotate(15 310 90)">not found</text>
        <text x="80" y="240" fill="#3a4055" fontFamily="var(--font-mono)" fontSize="24">error</text>
        <text x="300" y="230" fill="#4a5068" fontFamily="var(--font-mono)" fontSize="30" transform="rotate(-8 300 230)">404</text>
        {/* Small lonely NIB in center with sleepy/sad eyes and tangled tail */}
        <g transform="translate(180 120)">
          <path d="M10 25 Q-15 45 10 60 T35 30 T-5 20" stroke="#a79f86" strokeWidth="3" fill="none" />
          <NibSvg x={0} y={0} size={50} mood="sleepy" />
        </g>
        <text x="200" y="270" textAnchor="middle" fill="#a79f86" fontFamily="var(--font-mono)" fontSize="16">
          where did everybody go?
        </text>
      </g>
    );
  }

  // Scene 5: First website - home.html, warm cozy desk, adopted artifacts, crooked sign
  return (
    <g>
      <rect width="400" height="300" fill="#ddd6c1" />
      {/* Mini window chrome "home.html" */}
      <rect x="50" y="40" width="300" height="210" fill="#f6f1e0" stroke="#1c1b18" strokeWidth="2" />
      <rect x="50" y="40" width="300" height="24" fill="#1c1b18" />
      <text x="60" y="57" fill="#ffd23f" fontFamily="var(--font-mono)" fontSize="14">home.html</text>
      {/* Crooked welcome sign */}
      <g transform="rotate(-4 110 95)">
        <rect x="75" y="80" width="110" height="30" fill="#ffd23f" stroke="#1c1b18" strokeWidth="1.5" />
        <text x="130" y="100" textAnchor="middle" fill="#1c1b18" fontFamily="var(--font-mono)" fontSize="13" fontWeight="bold">welcome to nib</text>
      </g>
      {/* Adopted objects on floor */}
      <rect x="80" y="170" width="22" height="22" fill="#2c3354" stroke="#1c1b18" strokeWidth="1" />
      <text x="91" y="186" textAnchor="middle" fill="#fff" fontSize="11" fontFamily="var(--font-mono)">💾</text>
      <rect x="115" y="176" width="36" height="16" fill="#ffd23f" stroke="#1c1b18" strokeWidth="1" />
      <text x="133" y="188" textAnchor="middle" fill="#1c1b18" fontSize="8" fontFamily="var(--font-mono)">800x600</text>
      {/* Proud NIB in home */}
      <NibSvg x={220} y={110} size={75} mood="happy" />
      <text x="200" y="280" textAnchor="middle" fill="#1c1b18" fontFamily="var(--font-mono)" fontSize="16">
        Small point. Big ideas.
      </text>
    </g>
  );
}
