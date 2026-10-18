import Window from "@/components/shell/Window";
import BitLights from "@/components/ui/BitLights";
import EggSticker from "@/components/sections/EggSticker";

export default function Hero() {
  return (
    <div className="hero-container">
      <Window title="hello.exe" id="hello">
        <div className="hero">
          <h1 className="wordmark" aria-label="nib">
            n<span style={{ position: "relative", display: "inline-block" }}>ı
              <svg
                id="hero-arrow"
                className="hero-arrow-svg"
                aria-hidden="true"
                viewBox="0 0 21 31"
                width="0.22em"
                height="0.32em"
                style={{ position: "absolute", left: "0.04em", top: "0.08em" }}
              >
                <polygon points="0,0 0,26 7,20 12,31 17,28.5 12,18 21,18" fill="#e8412f" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </span>b
          </h1>
          <p className="tagline">Click gently. I&apos;m new here.</p>
          <p className="descriptor">A newborn cursor discovering the internet, one click at a time.</p>
          <BitLights />
          <EggSticker />
          <p className="hint">move your mouse. or tap anywhere. nib will find you.</p>
        </div>
      </Window>
      <div className="ticker-strip" aria-hidden="true">
        <div className="ticker-track">
          <span>now loading nib ... 4 bits ok ... click gently ... small point, big ideas ... now loading nib ... 4 bits ok ... click gently ... small point, big ideas ...</span>
        </div>
      </div>
    </div>
  );
}
