import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { SkillsSection } from "@/components/SkillsSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { ExperienceSection } from "@/components/ExperienceSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";

export default function Home() {
  return (
    <div
      id="top"
      className="min-h-screen bg-white text-dark font-sans selection:bg-accent selection:text-black relative overflow-x-hidden"
    >
      <Navigation />

      <main className="relative z-10 pt-[72px]">
        {/* HeroSection owns the GLSLHills canvas — scoped to page 1 only */}
        <HeroSection />
        {/* Solid white below — hills cannot bleed through */}
        <div className="relative bg-white">
          <SkillsSection />
          <ProjectsSection />
          <ExperienceSection />
        </div>
      </main>

      <ContactSection />
      <Footer />
      <ScrollToTop />
    </div>
  );
}
