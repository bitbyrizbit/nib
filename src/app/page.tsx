import Taskbar from "@/components/shell/Taskbar";
import DesktopIcons from "@/components/shell/DesktopIcons";
import ChaosControls from "@/components/shell/ChaosControls";
import Hero from "@/components/sections/Hero";
import Story from "@/components/sections/Story";
import Projects from "@/components/sections/Projects";
import About from "@/components/sections/About";
import Diary from "@/components/sections/Diary";
import TakeHome from "@/components/projects/TakeHome";
import Footer from "@/components/sections/Footer";

export default function Page() {
  return (
    <>
      <DesktopIcons />
      <main className="main">
        <Hero />
        <Story />
        <Projects />
        <About />
        <Diary />
        <TakeHome />
      </main>
      <Footer />
      <ChaosControls />
      <Taskbar />
    </>
  );
}
