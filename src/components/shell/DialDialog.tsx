"use client";

import { useEffect, useRef, useState } from "react";
import { playDialup, stopAll, isMuted } from "@/lib/audio";
import { nib } from "@/components/nib/nibBus";
import Modal from "@/components/ui/Modal";

type DialState = "idle" | "dialing" | "handshake" | "checking" | "connected";

export default function DialDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [stage, setStage] = useState<DialState>("idle");
  const [progress, setProgress] = useState(0);
  const [resultText, setResultText] = useState("");
  const [silentNotice, setSilentNotice] = useState(false);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const handleClose = () => {
    clearTimers();
    stopAll();
    setStage("idle");
    setProgress(0);
    setResultText("");
    setSilentNotice(false);
    onClose();
  };

  useEffect(() => {
    if (open) {
      clearTimers();
      const muted = isMuted();
      if (!muted) {
        playDialup();
      }

      requestAnimationFrame(() => {
        setSilentNotice(muted);
        setStage("dialing");
        setProgress(15);
      });

      // Stage 2: handshake (1.5s to 4.3s)
      const t1 = setTimeout(() => {
        setStage("handshake");
        setProgress(45);
      }, 1500);

      // Stage 3: checking nib (4.3s)
      const t2 = setTimeout(async () => {
        setStage("checking");
        setProgress(75);

        let statusLine = "connected.";
        try {
          const res = await fetch("/api/stats", { cache: "no-store" });
          if (!res.ok) throw new Error("fetch failed");
          const data = await res.json();
          if (data.demo) {
            statusLine = "connected (demo mode)";
          } else if (typeof data.visits === "number") {
            statusLine = `you are visitor no. ${data.visits}`;
          } else {
            statusLine = "connected.";
          }
        } catch {
          statusLine = "connected (offline mode)";
        }

        // Stage 4: connected (~6.0s)
        const t3 = setTimeout(() => {
          setStage("connected");
          setProgress(100);
          setResultText(statusLine);

          // NIB reaction
          nib.brain?.pointerDown();
          nib.brain?.pointerUp();
          window.dispatchEvent(
            new CustomEvent("nib:voice", { detail: { text: "we're online.", duration: 3500 } })
          );
        }, 1700);

        timersRef.current.push(t3);
      }, 4300);

      timersRef.current.push(t1, t2);
    } else {
      clearTimers();
      stopAll();
    }
  }, [open]);

  return (
    <Modal open={open} onClose={handleClose} labelledBy="dial-title" className="dial-dialog">
      <div className="dial-header">
        <h2 id="dial-title" className="dial-title">
          dial_up.exe
        </h2>
        <button
          type="button"
          className="dial-close-x"
          onClick={handleClose}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="dial-body">
        <div className="dial-screen">
          <span className="dial-label">Modem: 56k V.90 / 28.8k baud</span>
          <progress className="dial-progress" max={100} value={progress} />

          <div className="dial-status-box" role="status">
            {stage === "dialing" && <p className="dial-line">dialing 555-1234...</p>}
            {stage === "handshake" && <p className="dial-line">negotiating handshake...</p>}
            {stage === "checking" && <p className="dial-line">checking nib status...</p>}
            {stage === "connected" && (
              <p className="dial-line dial-line--success">{resultText}</p>
            )}
          </div>

          {silentNotice && (
            <p className="dial-notice">
              sound is off. turn it on to hear the modem.
            </p>
          )}
        </div>

        <div className="dial-actions">
          <button
            type="button"
            className="tb-btn dial-btn"
            autoFocus
            onClick={handleClose}
          >
            {stage === "connected" ? "hang up" : "cancel"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
