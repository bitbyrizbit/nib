"use client";
import Odometer from "@/components/ui/Odometer";
import { useVisits } from "@/lib/useVisits";

export default function Footer() {
  const { count, demo } = useVisits();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-badges" aria-label="Web buttons">
        <a href="#hello" className="web-badge web-badge--nib">
          <span className="badge-top">MADE WITH</span>
          <span className="badge-bot">NIB · 1999</span>
        </a>
        <a href="#story" className="web-badge web-badge--bits">
          <span className="badge-top">NIBBLE SIZE</span>
          <span className="badge-bot">4 BITS OLD</span>
        </a>
        <a href="#about" className="web-badge web-badge--gently">
          <span className="badge-top">INTERNET BABY</span>
          <span className="badge-bot">CLICK GENTLY</span>
        </a>
      </div>

      <div className="footer-counter" aria-live="polite">
        {count !== null && <span className="counter-label">you are visitor no.</span>}
        <Odometer value={count} />
        {demo && <span className="hint counter-demo">demo mode, not saved</span>}
      </div>

      <div className="footer-content">
        <p className="footer-tagline">Small point. Big ideas.</p>
        <p className="footer-desc">
          Built for the haX.baby &ldquo;Baby&apos;s First Website&rdquo; hackathon (Track 2: Your Own Baby).
        </p>

        <div className="footer-credits">
          <h3>Credits &amp; Open Source</h3>
          <ul>
            <li><strong>Fonts:</strong> Bagel Fat One, Pixelify Sans, VT323 (SIL Open Font License).</li>
            <li><strong>Stack:</strong> Next.js, React, @upstash/redis, @upstash/ratelimit, obscenity (all MIT).</li>
            <li><strong>Artwork:</strong> 100% original, generated via code (SVG, canvas, CSS). No third-party or Pip assets.</li>
            <li><strong>Audio:</strong> Synthesized in-browser with Web Audio API. Zero audio files or external samples.</li>
            <li><strong>Source code:</strong> <a href="https://github.com/bitbyrizbit/nib" target="_blank" rel="noopener noreferrer">github.com/bitbyrizbit/nib</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
