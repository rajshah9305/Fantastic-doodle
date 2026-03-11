import React, { useState } from 'react';
import { Mail, Terminal, Cpu, CheckCircle2, Copy, Check } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';
import {
  ParallaxGrid,
  ScrollProgress,
  DecryptText,
  ServiceModal,
  ServiceCard,
  ProjectCard,
  ExperienceItem,
  Navigation,
  FloatingActions,
  LoadingScreen,
  Button
} from './components';
import { PORTFOLIO_DATA } from './data/portfolio';
import architectureDiagram from './assets/architecture.jpg';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [emailCopied, setEmailCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PORTFOLIO_DATA.profile.socials.email);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans overflow-x-hidden relative">
      <ParallaxGrid />

      {/* Orange Spray Effect */}
      <div
        className="absolute top-0 right-0 w-[800px] h-[600px] bg-orange-600/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/4 mix-blend-multiply z-0"
        aria-hidden="true"
      />

      <ScrollProgress />

      <Navigation onScrollToTop={scrollToTop} />
      <FloatingActions onScrollToTop={scrollToTop} />

      <main className="relative z-10">
        {/* HERO SECTION */}
        <section className="container mx-auto px-6 md:px-12 pt-32 md:pt-40 pb-24 md:pb-32">
          <div className="space-y-12">
            <h1 className="font-sans text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.85] text-zinc-900">
              RAJ <span className="text-outline-zinc">SHAH</span>
            </h1>

            <div className="flex flex-col md:flex-row gap-16 md:items-end justify-between">
              <div>
                <h2 className="heading-2 mb-6">Digital Architect & Engineer</h2>
                <p className="max-w-xl body-large">
                  Fusing <span className="text-zinc-900 font-bold underline decoration-orange-600 underline-offset-4">Algorithmic Complexity</span> with <span className="text-zinc-900 font-bold underline decoration-orange-600 underline-offset-4">Structural Minimalism</span>. I architect high-performance digital ecosystems where form follows function—delivering software that is fault-tolerant, scalable, and aesthetically absolute.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <Button href={`mailto:${PORTFOLIO_DATA.profile.socials.email}`} icon={Mail}>
                  Initialize Contact
                </Button>
                <Button variant="outline" href="#work" icon={Terminal}>
                  View Database
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* METRICS & STATS */}
        <section className="mb-32 border-y border-zinc-200">
          <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-zinc-200">
            {PORTFOLIO_DATA.stats.map((stat, i) => (
              <div key={i} className="p-8 md:p-12 hover:bg-zinc-50 transition-colors duration-300">
                <span className="block label-mono text-zinc-400 mb-2">{stat.label}</span>
                <span className="block font-sans text-3xl md:text-5xl font-black tracking-tighter text-zinc-900">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* SERVICES MODULE */}
        <section id="services" className="container mx-auto px-6 md:px-12 mb-32 scroll-mt-32">
          <div className="flex items-end justify-between mb-16">
            <div className="max-w-2xl">
              <h2 className="heading-1 mb-6">Technical Services</h2>
              <p className="body-large">
                Specialized engineering modules designed to accelerate digital transformation and product velocity.
              </p>
            </div>
            <div className="hidden md:block">
              <Cpu size={48} className="text-zinc-200" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {PORTFOLIO_DATA.services.map((service) => (
              <ServiceCard key={service.id} service={service} onDetailsClick={setSelectedService} />
            ))}
          </div>

          {selectedService && (
            <ServiceModal
              service={selectedService}
              isOpen={!!selectedService}
              onClose={() => setSelectedService(null)}
            />
          )}
        </section>

        {/* SELECTED WORKS */}
        <section id="work" className="mb-32 scroll-mt-32">
          <div className="container mx-auto px-6 md:px-12 mb-12 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-1.5 bg-orange-600 rounded-full"></div>
                <h2 className="label-mono text-zinc-500">Project_Index_2026</h2>
              </div>
              <h3 className="heading-1">Selected Works</h3>
            </div>
            <div className="hidden md:block text-right label-mono text-zinc-400">
              <span>Sort: Chronological</span><br />
              <span>Status: All Systems Go</span>
            </div>
          </div>

          <div className="container mx-auto px-6 md:px-12">
            <div className="grid md:grid-cols-2 gap-6">
              {PORTFOLIO_DATA.projects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* EXPERIENCE TIMELINE */}
        <section id="experience" className="container mx-auto px-6 md:px-12 mb-32 scroll-mt-32">
          <div className="grid md:grid-cols-12 gap-12">
            <div className="md:col-span-4">
              <h2 className="heading-1 mb-6 sticky top-32">
                Career<br />Trajectory
              </h2>
              <p className="body-base mb-8">
                A timeline of increasing responsibility and technical complexity.
              </p>
            </div>
            <div className="md:col-span-8 border-l border-zinc-200 pl-0 md:pl-8">
              {PORTFOLIO_DATA.experience.map((item, index) => (
                <ExperienceItem
                  key={index}
                  item={item}
                  last={index === PORTFOLIO_DATA.experience.length - 1}
                />
              ))}
            </div>
          </div>
        </section>

        {/* PHILOSOPHY / ABOUT */}
        <section className="bg-zinc-900 text-zinc-50 py-24 mb-32 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
            aria-hidden="true"
          ></div>

          <div className="container mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <span className="label-mono text-orange-500 mb-4 block">Core Philosophy</span>
              <h2 className="font-sans text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
                Code as<br />Craftsmanship.
              </h2>
              <p className="body-large text-zinc-400 mb-8">
                I believe that software should be as beautiful internally as it is externally.
                Every function, every component, and every API endpoint is crafted with the same attention to detail as the visual interface.
                <br /><br />
                In an era of AI-generated code, human intent and architectural precision are the true differentiators.
              </p>
              <div className="grid grid-cols-2 gap-8 border-t border-zinc-800 pt-8">
                <div>
                  <span className="block font-sans text-4xl font-black text-white mb-2">0.1s</span>
                  <span className="label-mono text-zinc-500">Avg. Load Time</span>
                </div>
                <div>
                  <span className="block font-sans text-4xl font-black text-white mb-2">100%</span>
                  <span className="label-mono text-zinc-500">Type Safety</span>
                </div>
              </div>
            </div>
            <div className="h-full min-h-[400px] relative overflow-hidden flex items-center justify-center border border-zinc-700 bg-zinc-900">
              <img
                src={architectureDiagram}
                alt="System Architecture Diagram"
                className="w-full h-full object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent pointer-events-none" />

            </div>
          </div>
        </section>

        {/* SKILLS TICKER */}
        <div className="w-full overflow-hidden border-y border-zinc-200 py-12 mb-32 relative">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10"></div>

          <div className="animate-marquee flex whitespace-nowrap">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center">
                {PORTFOLIO_DATA.skills.flatMap(s => s.items).map((skill, idx) => (
                  <div key={`${i}-${idx}`} className="flex items-center gap-4 mx-8 group cursor-default">
                    <CheckCircle2 size={16} className="text-zinc-300 group-hover:text-orange-600 transition-colors" />
                    <span className="font-mono text-sm md:text-lg font-bold uppercase tracking-widest text-zinc-400 group-hover:text-zinc-900 transition-colors">
                      {skill}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER / CONTACT */}
        <footer className="bg-zinc-900 text-zinc-50 py-24 border-t border-zinc-800">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid md:grid-cols-2 gap-16 mb-16">
              <div>
                <h2 className="font-sans text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9] mb-8 text-white">
                  Let&apos;s Build<br />Something.
                </h2>
                <p className="body-large text-zinc-400 mb-8">
                  Available for select projects. If you&apos;re building something ambitious and need a technical partner who cares about craft, let&apos;s talk.
                </p>
                <Button
                  href={`mailto:${PORTFOLIO_DATA.profile.socials.email}`}
                  icon={Mail}
                  variant="minimal"
                >
                  Start Conversation
                </Button>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="label-mono text-zinc-500 mb-4">Contact</h3>
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${PORTFOLIO_DATA.profile.socials.email}`}
                      className="font-mono text-lg text-white hover:text-orange-500 transition-colors"
                    >
                      {PORTFOLIO_DATA.profile.socials.email}
                    </a>
                    <button
                      onClick={handleCopyEmail}
                      className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-orange-500 transition-colors"
                      title="Copy Email"
                    >
                      {emailCopied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="label-mono text-zinc-500 mb-4">Connect</h3>
                  <div className="flex flex-col gap-2">
                    <a
                      href={PORTFOLIO_DATA.profile.socials.github}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-zinc-400 hover:text-orange-500 transition-colors"
                    >
                      GitHub
                    </a>
                    <a
                      href={PORTFOLIO_DATA.profile.socials.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-zinc-400 hover:text-orange-500 transition-colors"
                    >
                      LinkedIn
                    </a>
                    <a
                      href={PORTFOLIO_DATA.profile.socials.twitter}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-zinc-400 hover:text-orange-500 transition-colors"
                    >
                      Twitter
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="label-mono text-zinc-500">
                © 2026 Raj Shah. All rights reserved.
              </p>
              <p className="label-mono text-zinc-500">
                Designed & Engineered with Precision
              </p>
            </div>
          </div>
        </footer>
      </main>

      <style>{`
        .text-outline-zinc {
          -webkit-text-stroke: 2px #27272a;
          -webkit-text-fill-color: transparent;
          text-stroke: 2px #27272a;
          text-fill-color: transparent;
        }
        
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
        
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
      <Analytics />
    </div>
  );
}
