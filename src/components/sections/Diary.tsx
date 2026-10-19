"use client";
import Window from "@/components/shell/Window";
import { DIARY } from "@/lib/diary";
import { pipsFor, useTrust } from "@/lib/trust";

export default function Diary() {
  const trust = useTrust();
  return (
    <section id="diary" className="diary-section" aria-label="NIB's diary">
      <Window title="nib_diary.txt">
        <p className="hint">trust {pipsFor(trust)} of 4. click gently and nib will tell you more.</p>
        <ol className="diary">
          {DIARY.map((d) => {
            const open = trust >= d.at;
            return (
              <li key={d.title} className="diary__page" data-locked={!open}>
                <h3>{d.title}</h3>
                {open ? (
                  <p className="diary__text">{d.text}</p>
                ) : (
                  <div className="diary__locked">
                    <div className="diary__locked-bits" aria-hidden="true">
                      {[0, 1, 2, 3].map((b) => (
                        <span
                          key={b}
                          className="diary__locked-bit"
                          data-on={b < pipsFor(trust)}
                        />
                      ))}
                    </div>
                    <p className="hint">locked: be gentler ({Math.max(1, d.at - trust)} more trust)</p>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        <p className="hint diary__footer-note">nib&apos;s trust is saved only in this browser.</p>
      </Window>
    </section>
  );
}
