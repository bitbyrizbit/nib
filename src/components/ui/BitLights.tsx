"use client";
import { useSyncExternalStore } from "react";
import { nibBus } from "@/components/nib/nibBus";
import { MOOD_BITS, toHex } from "@/lib/bits";

export default function BitLights() {
  const mood = useSyncExternalStore(nibBus.subscribe, nibBus.get, () => "idle" as const);
  const bits = MOOD_BITS[mood] ?? "0001";
  return (
    <div className="bits" role="img" aria-label={`NIB is feeling ${mood}`}>
      {bits.split("").map((b, i) => <span key={i} className="bit" data-on={b === "1"} />)}
      <span aria-hidden="true">0x{toHex(bits)}</span>
    </div>
  );
}
