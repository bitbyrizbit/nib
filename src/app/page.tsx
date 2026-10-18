import Taskbar from "@/components/shell/Taskbar";
import ChaosControls from "@/components/shell/ChaosControls";
import Hero from "@/components/sections/Hero";
import Story from "@/components/sections/Story";
import Projects from "@/components/sections/Projects";
import About from "@/components/sections/About";
import TakeHome from "@/components/projects/TakeHome";
import Footer from "@/components/sections/Footer";

export default function Page() {
  return (
    <>
      <main className="main">
        <Hero />
        <Story />
        <Projects />
        <About />
        <TakeHome />
      </main>
      <Footer />
      <ChaosControls />
      <Taskbar />
    </>
  );
}
