export default function Footer() {
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

      <div className="footer-content">
        <p className="footer-tagline">Small point. Big ideas.</p>
        <p className="footer-desc">
          Built for the haX.baby &ldquo;Baby&apos;s First Website&rdquo; hackathon (Track 2: Your Own Baby).
        </p>

        <div className="footer-credits">
          <h3>Credits &amp; Open Source</h3>
          <ul>
            <li><strong>Fonts:</strong> Bagel Fat One, Pixelify Sans, VT323 (SIL Open Font License, via Google Fonts).</li>
            <li><strong>Framework:</strong> Next.js &amp; React with TypeScript and vanilla CSS.</li>
            <li><strong>Artwork:</strong> 100% original, generated via code (SVG, canvas, CSS). No third-party or Pip assets.</li>
            <li><strong>Audio (Phase 3):</strong> Synthesized in-browser with Web Audio API. Zero audio files or external samples.</li>
            <li><strong>Source code:</strong> <a href="https://github.com/bitbyrizbit/nib" target="_blank" rel="noopener noreferrer">github.com/bitbyrizbit/nib</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
