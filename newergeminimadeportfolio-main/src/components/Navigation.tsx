"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Menu, X, ArrowRight, Github, Linkedin } from "lucide-react";
import { PERSONAL_INFO } from "@/config/portfolio";

const NAV_LINKS = [
  { href: "#expertise", label: "Expertise" },
  { href: "#work",      label: "Work"      },
  { href: "#experience", label: "Experience" },
];

export function Navigation() {
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) setProgress(window.scrollY / total);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      aria-label="Main Navigation"
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md h-[64px] border-b-2" : "bg-white h-[80px] border-b-4"
      } border-black`}
    >
      {/* Scroll progress bar */}
      <div
        className="absolute bottom-0 left-0 h-[4px] bg-accent transition-none z-[60]"
        style={{ width: `${progress * 100}%` }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">

        {/* Logo */}
        <a
          href="#top"
          aria-label="Back to top"
          className="flex items-center justify-center w-10 h-10 bg-black text-white font-black text-[12px] tracking-widest hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 shrink-0"
        >
          RS
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="nav-link font-mono text-[11px] font-bold tracking-[0.2em] uppercase text-black hover:text-accent transition-colors focus:outline-none"
              style={{ "--nav-underline": "var(--color-accent)" } as React.CSSProperties}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            className="ml-2 px-6 py-2.5 bg-accent text-black font-mono text-[11px] font-black uppercase tracking-[0.2em] border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all focus:outline-none"
          >
            Hire Me
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          aria-expanded={mobileOpen}
          aria-label="Toggle Navigation Menu"
          className="md:hidden p-2 text-black border-2 border-black hover:bg-accent hover:text-black transition-colors focus:outline-none"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <AnimatePresence mode="wait" initial={false}>
            {mobileOpen ? (
              <motion.span key="close"
                initial={reduce ? {} : { rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={reduce ? {} : { rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="block"
              >
                <X className="w-5 h-5" />
              </motion.span>
            ) : (
              <motion.span key="open"
                initial={reduce ? {} : { rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={reduce ? {} : { rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="block"
              >
                <Menu className="w-5 h-5" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={reduce ? {} : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? {} : { opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 w-full bg-white border-b-4 border-black flex flex-col px-6 pb-8 pt-4 md:hidden shadow-2xl"
          >
            {NAV_LINKS.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                initial={reduce ? {} : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="py-5 border-b-2 border-black/5 flex justify-between items-center font-mono text-[14px] font-bold uppercase tracking-[0.2em] text-black hover:text-accent transition-colors focus:outline-none"
              >
                {link.label}
                <ArrowRight className="w-4 h-4" />
              </motion.a>
            ))}
            <div className="pt-8 flex gap-4">
              {[
                { href: PERSONAL_INFO.github,   label: "GitHub",   Icon: Github },
                { href: PERSONAL_INFO.linkedin, label: "LinkedIn", Icon: Linkedin },
              ].map(({ href, label, Icon }) => (
                <a key={label} href={href} aria-label={label} target="_blank" rel="noreferrer"
                  className="flex-1 flex items-center justify-center py-4 bg-white text-black border-2 border-black hover:bg-accent hover:text-black transition-colors focus:outline-none">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
