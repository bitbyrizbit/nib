import Window from "@/components/shell/Window";

export const CHARACTER_SHEET = [
  { label: "Name", value: "NIB" },
  {
    label: "What it is",
    value:
      "A baby cursor. A soft arrow with a lopsided tip, two big eyes and a tail that never sits still. Four bits old. Curious, clumsy, sincere and easily excited.",
  },
  {
    label: "What it does",
    value: "Makes tiny web toys and tools, and adopts abandoned pieces of the internet.",
  },
  {
    label: "Its story",
    value:
      "Born as a nibble in the dark. Learned to click, learned to love links, got lost on a 404, then built a home from what it found. Scroll up to watch it happen.",
  },
  { label: "Tagline", value: "Click gently. I'm new here." },
];

export default function About() {
  return (
    <section id="about" className="about-section" aria-label="About NIB">
      <div className="about-wrap">
        <Window title="nib.txt" id="about-window">
          <div className="sheet">
            <header className="sheet-header">
              <h2>CHARACTER_SHEET.TXT</h2>
              <span className="sheet-meta">system profile · track 2 entry</span>
            </header>
            <dl className="sheet-grid">
              {CHARACTER_SHEET.map((field) => (
                <div key={field.label} className="sheet-row">
                  <dt className="sheet-label">{field.label}:</dt>
                  <dd className="sheet-value">{field.value}</dd>
                </div>
              ))}
            </dl>
            <footer className="sheet-footer">
              <span className="sheet-line">Small point. Big ideas.</span>
            </footer>
          </div>
        </Window>
      </div>
    </section>
  );
}
