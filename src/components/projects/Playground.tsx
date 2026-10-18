"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Window from "@/components/shell/Window";
import BitLights from "@/components/ui/BitLights";
import { setTheme, useTheme } from "@/lib/theme";
import { nib } from "@/components/nib/nibBus";

export default function Playground() {
  const theme = useTheme();
  const night = theme === "night";

  // Slider (stretch pad)
  const [sliderVal, setSliderVal] = useState(4); // 0..15
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Nap pad countdown
  const [napSecs, setNapSecs] = useState(8);
  const [isHoveringNap, setIsHoveringNap] = useState(false);

  // Typing pad
  const [typed, setTyped] = useState("hello nib");

  // Nap timer effect
  useEffect(() => {
    if (!isHoveringNap) return;
    const id = setInterval(() => {
      setNapSecs((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [isHoveringNap]);

  // Drag logic for stretch pad
  const updateSliderFromPointer = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const val = Math.round(p * 15);
    setSliderVal(val);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    nib.brain?.pointerDown();
    updateSliderFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    updateSliderFromPointer(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      nib.brain?.pointerUp();
    }
  };

  const handleSliderKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setSliderVal((v) => Math.min(15, v + 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setSliderVal((v) => Math.max(0, v - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setSliderVal(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setSliderVal(15);
    }
  };

  return (
    <Window title="playground.exe" id="playground" className="playground-window">
      <div className="playground">
        <header className="pg-header">
          <p className="pg-desc">
            Prove every emotion. Poke a pad to trigger a mood, or watch the 4-bit telemetry lights respond in real time.
          </p>
          <div className="pg-telemetry">
            <span className="pg-telemetry-lbl">live mood:</span>
            <BitLights />
          </div>
        </header>

        <div className="pg-grid">
          {/* Pad 1: Link pad (curious) */}
          <div className="pg-pad pg-pad--link">
            <span className="pg-label">{"// 01 link pad"}</span>
            <button type="button" className="tb-btn pg-big-btn">
              hover me ▸ click me
            </button>
            <span className="pg-hint">leans in with big curious eyes, then squashes on click</span>
          </div>

          {/* Pad 2: Reading pad (read) */}
          <div className="pg-pad pg-pad--reading">
            <span className="pg-label">{"// 02 reading pad"}</span>
            <p className="pg-read-text">
              NIB reads slowly. It moves its eyes along every word and squints a bit. It is only four bits old.
            </p>
            <span className="pg-hint">squints into reading mode</span>
          </div>

          {/* Pad 3: No-go pad (pout) */}
          <div className="pg-pad pg-pad--disabled">
            <span className="pg-label">{"// 03 no-go pad"}</span>
            <button disabled type="button" className="tb-btn pg-locked-btn" aria-disabled="true">
              🔒 access denied
            </button>
            <span className="pg-hint">pouts at blocked controls</span>
          </div>

          {/* Pad 4: Stretch pad (grab) */}
          <div className="pg-pad pg-pad--stretch">
            <span className="pg-label">{"// 04 stretch pad (drag)"}</span>
            <div className="slider-container">
              <span className="slider-val">0x{sliderVal.toString(16).toUpperCase()} ({sliderVal})</span>
              <div
                ref={trackRef}
                className="slider-track"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <div
                  className="slider-thumb"
                  data-nib="drag"
                  role="slider"
                  tabIndex={0}
                  aria-label="Stretch pad slider"
                  aria-valuemin={0}
                  aria-valuemax={15}
                  aria-valuenow={sliderVal}
                  style={{ left: `${(sliderVal / 15) * 100}%` }}
                  onKeyDown={handleSliderKeyDown}
                />
              </div>
            </div>
            <span className="pg-hint">holds on tight &amp; stretches when dragging</span>
          </div>

          {/* Pad 5: Nap pad (sleepy / asleep) */}
          <div
            className="pg-pad pg-pad--nap"
            onPointerEnter={() => setIsHoveringNap(true)}
            onPointerLeave={() => { setIsHoveringNap(false); setNapSecs(8); }}
          >
            <span className="pg-label">{"// 05 nap pad"}</span>
            <div className="pg-nap-box">
              <span className="pg-nap-status">
                {napSecs === 0 ? "nib is sleeping! zzz" : `hold still here: ${napSecs}s`}
              </span>
            </div>
            <span className="pg-hint">yawns after 8s, falls asleep with floating z after 20s</span>
          </div>

          {/* Pad 6: Typing pad (native cursor) */}
          <div className="pg-pad pg-pad--type">
            <span className="pg-label">{"// 06 typing pad (native)"}</span>
            <input
              type="text"
              className="pg-input"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="type to nib..."
              aria-label="Say something to nib"
            />
            <div className="pg-input-preview">
              <span>nib heard: </span>
              <code>&ldquo;{typed || "(silence)"}&rdquo;</code>
            </div>
            <span className="pg-hint">nib fades out &amp; system cursor returns</span>
          </div>

          {/* Pad 7: Night pad (mood / palette shift) */}
          <div className="pg-pad pg-pad--night">
            <span className="pg-label">{"// 07 dial-up night shift"}</span>
            <button
              type="button"
              className="tb-btn pg-night-btn"
              aria-pressed={night}
              onClick={() => setTheme(night ? "day" : "night")}
            >
              <span className="tb-led" aria-hidden="true" />
              {night ? "switch to daylight" : "dial up the night"}
            </button>
            <span className="pg-hint">green phosphor glow &amp; gets sleepy sooner</span>
          </div>
        </div>

        <footer className="pg-footer">
          <span className="maker-mark">made by nib · 4 bits</span>
        </footer>
      </div>
    </Window>
  );
}
