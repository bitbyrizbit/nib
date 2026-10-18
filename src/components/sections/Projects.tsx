import LostFound from "@/components/projects/LostFound";
import Playground from "@/components/projects/Playground";
import NibbleBox from "@/components/projects/NibbleBox";
import Guestbook from "@/components/projects/Guestbook";

export default function Projects() {
  return (
    <section id="projects" className="projects-section" aria-label="Projects made by NIB">
      <div className="projects-heading">
        <h2>projects.dir</h2>
        <p className="projects-sub">things nib made, found, or broke while exploring the internet</p>
      </div>
      <div className="projects-cluster">
        <div className="projects-col projects-col--left">
          <LostFound />
        </div>
        <div className="projects-col projects-col--right">
          <Playground />
        </div>
        <div className="projects-col projects-col--wide">
          <NibbleBox />
        </div>
        <div className="projects-col projects-col--wide">
          <Guestbook />
        </div>
      </div>
    </section>
  );
}
