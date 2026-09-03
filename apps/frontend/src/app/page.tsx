import { Reveal } from '@/components/reveal';
import { HeroSection } from '@/components/hero-section';
import { AboutSection } from '@/components/about-section';
import { ProjectsSection } from '@/components/projects-section';
import { ContactSection } from '@/components/contact-section';

export default async function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <HeroSection />

      {/* <div className="mx-auto max-w-6xl px-4"> */}
      {/* About Section (Experience, Skills, Education) */}
      <AboutSection />

      {/* Projects */}
      <section id="projects" className="scroll-mt-8 py-10 md:py-16 max-w-6xl mx-auto px-4">
        <Reveal>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-anton uppercase tracking-wider text-orange md:text-4xl mb-8">
              Projects
            </h2>
          </div>
        </Reveal>

        <div className="mt-10">
          <ProjectsSection />
        </div>
      </section>

      {/* Contact / Footer Section */}
      <ContactSection />
    </div>
    // </div>
  );
}
