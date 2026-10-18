import Taskbar from "@/components/shell/Taskbar";
import Hero from "@/components/sections/Hero";
import Story from "@/components/sections/Story";
import Projects from "@/components/sections/Projects";
import About from "@/components/sections/About";
import Footer from "@/components/sections/Footer";

export default function Page() {
  return (
    <>
      <main className="main">
        <Hero />
        <Story />
        <Projects />
        <About />
      </main>
      <Footer />
      <Taskbar />
    </>
  );
}
