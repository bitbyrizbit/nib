"use client";
import { useRef } from "react";
import Window from "@/components/shell/Window";
import { useSceneProgress } from "@/lib/useSceneProgress";
import StageArt from "./StageArt";
import StoryRoute from "./StoryRoute";

export const SCENES = [
  { title: "0101", text: "Before I was a cursor I was four bits. Two off, two on. A nibble. Nobody had clicked me yet, so I just blinked and waited." },
  { title: "first click", text: "Then somebody clicked. Everything got bright and loud. I opened my eyes and there was a whole screen. Hello?" },
  { title: "first hover", text: "I found out I can turn into a hand. Over a link I get a hand. I have never been so happy about anything." },
  { title: "first mistake", text: "I followed a link and landed on a 404. Nothing was there. Then I found the others: dead buttons, lonely spinners, an under construction sign nobody finished." },
  { title: "first website", text: "So I gathered them up and built a home. It is a little crooked. Click gently, I'm new here." },
];

export default function Story() {
  const ref = useRef<HTMLElement>(null);
  const { scene, local, p } = useSceneProgress(ref, SCENES.length);
  const go = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.offsetTop + (total * (i + 0.5)) / SCENES.length, behavior: "smooth" });
  };

  return (
    <section id="story" ref={ref} className="story" aria-label="NIB's story">
      <ol className="sr-only">
        {SCENES.map((s, i) => (
          <li key={i}>
            <h2>{s.title}</h2>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
      <div className="story__stage">
        <div className="story__route-wrap">
          <StoryRoute p={p} scenes={SCENES.length} />
        </div>
        <div className="story__content">
          <svg className="story__art" viewBox="0 0 400 300" role="img" aria-label={`Illustration for scene ${scene + 1}: ${SCENES[scene].title}`}>
            <StageArt scene={scene} local={local} />
          </svg>
          <Window title={`story / ${scene + 1} of ${SCENES.length}`}>
            <ol className="story__list" aria-hidden="true">
              {SCENES.map((s, i) => (
                <li key={s.title} className="story__scene" data-active={i === scene}>
                  <h2>{s.title}</h2>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
            <div className="story__dots" role="group" aria-label="Jump to scene">
              {SCENES.map((s, i) => (
                <button
                  key={s.title}
                  type="button"
                  className="tb-btn"
                  aria-label={`Scene ${i + 1}: ${s.title}`}
                  aria-current={i === scene}
                  onClick={() => go(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </Window>
        </div>
      </div>
    </section>
  );
}
