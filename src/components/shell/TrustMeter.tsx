"use client";
import { pipsFor, useTrust } from "@/lib/trust";
import { pop } from "@/lib/audio";

export default function TrustMeter() {
  const trust = useTrust();
  const pips = pipsFor(trust);

  const onClick = () => {
    pop();
    const el = document.getElementById("diary");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <button
      type="button"
      className="tb-btn tb-trust"
      onClick={onClick}
      aria-label={`NIB trust ${pips} of 4. Open NIB's diary`}
    >
      <span className="tb-trust__pips" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`tb-trust__pip ${i < pips ? "tb-trust__pip--lit" : ""}`}
          />
        ))}
      </span>
      <span className="tb-trust__label">diary</span>
    </button>
  );
}
