"use client";

import { useState } from "react";
import Window from "@/components/shell/Window";
import NibPortrait from "./NibPortrait";
import { nibSvg, pngBlob, curBlob, download } from "@/lib/takeHome";
import { pop } from "@/lib/audio";

export default function TakeHome() {
  const [size, setSize] = useState<64 | 128 | 256>(256);
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const snippet = `cursor: url("nib.png") 1 1, auto;`;

  const onDownloadSvg = () => {
    pop();
    try {
      download(new Blob([nibSvg(512)], { type: "image/svg+xml" }), "nib.svg");
      setStatus("downloaded nib.svg");
    } catch {
      setStatus("couldn't make svg file");
    }
  };

  const onDownloadPng = async () => {
    pop();
    setBusy(true);
    setStatus("rendering png...");
    try {
      const blob = await pngBlob(size);
      download(blob, `nib-${size}.png`);
      setStatus(`downloaded nib-${size}.png`);
    } catch {
      setStatus("couldn't make that file, try the SVG");
    } finally {
      setBusy(false);
    }
  };

  const onDownloadCur = async () => {
    pop();
    setBusy(true);
    setStatus("generating .cur cursor...");
    try {
      const blob = await curBlob();
      download(blob, "nib.cur");
      setStatus("downloaded nib.cur (Windows 32x32)");
    } catch {
      setStatus("couldn't make that file, try the PNG");
    } finally {
      setBusy(false);
    }
  };

  const onCopySnippet = async () => {
    pop();
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setStatus("copied css snippet");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setStatus("couldn't copy snippet");
    }
  };

  return (
    <section id="take-home" className="takehome-section" aria-label="Take NIB home">
      <div className="takehome-wrap">
        <Window title="take_nib_home.exe" id="take-home-window">
          <div className="takehome-body">
            <header className="takehome-header">
              <h2>TAKE NIB HOME</h2>
              <span className="takehome-sub">free download · personal cursor & art (MIT)</span>
            </header>

            <div className="takehome-preview">
              <NibPortrait size={120} />
            </div>

            <div className="takehome-controls">
              <div className="takehome-actions">
                <button type="button" className="takehome-btn" onClick={onDownloadSvg}>
                  download .svg
                </button>
                <div className="takehome-png-group">
                  <button type="button" className="takehome-btn" onClick={onDownloadPng} disabled={busy}>
                    download .png
                  </button>
                  <div className="takehome-sizes" role="group" aria-label="PNG size">
                    {([64, 128, 256] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`size-btn ${size === s ? "size-btn--active" : ""}`}
                        onClick={() => {
                          pop();
                          setSize(s);
                        }}
                      >
                        {s}px
                      </button>
                    ))}
                  </div>
                </div>
                <button type="button" className="takehome-btn" onClick={onDownloadCur} disabled={busy}>
                  download .cur (windows)
                </button>
              </div>

              {status && (
                <p className="takehome-status" role="status">
                  {status}
                </p>
              )}

              <div className="takehome-guide">
                <p className="takehome-note">
                  <strong>Windows cursor:</strong> Settings &gt; Bluetooth & devices &gt; Mouse &gt; Additional mouse settings &gt; Pointers tab &gt; Browse, select <code>nib.cur</code>.
                </p>
                <p className="takehome-note">
                  <strong>macOS:</strong> macOS does not support <code>.cur</code> system pointers, but you can use the PNG or SVG in graphics or custom apps!
                </p>
                <div className="takehome-css">
                  <span className="takehome-note"><strong>Websites:</strong></span>
                  <div className="css-row">
                    <code>{snippet}</code>
                    <button type="button" className="copy-btn" onClick={onCopySnippet}>
                      {copied ? "copied!" : "copy"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Window>
      </div>
    </section>
  );
}
