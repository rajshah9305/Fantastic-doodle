"use client";

import { Github, Mail } from "lucide-react";
import { PERSONAL_INFO } from "@/config/portfolio";
import { BrutalistButton } from "./BrutalistButton";
import { Marquee } from "./Marquee";
import { GLSLHills } from "./GLSLHills";

const CODE_LINES = [
  { indent: 0, tokens: [{ t: "class",       c: "text-accent font-bold" }, { t: " Engineer", c: "text-dark"   }, { t: " {",  c: "text-dark/40" }] },
  { indent: 1, tokens: [{ t: "constructor", c: "text-accent font-bold" }, { t: "() {",      c: "text-dark/40"  }] },
  { indent: 2, tokens: [{ t: "this",        c: "text-accent"    }, { t: ".name ",    c: "text-dark"  }, { t: "=",   c: "text-accent" }, { t: ' "Raj Shah"', c: "text-accent" }, { t: ";", c: "text-dark/40" }] },
  { indent: 2, tokens: [{ t: "this",        c: "text-accent"    }, { t: ".focus ",   c: "text-dark"  }, { t: "=",   c: "text-accent" }, { t: " [",          c: "text-dark/40" }, { t: '"AI"',     c: "text-accent" }, { t: ", ", c: "text-dark/40" }, { t: '"Systems"', c: "text-accent" }, { t: "];", c: "text-dark/40" }] },
  { indent: 1, tokens: [{ t: "}",           c: "text-dark/40"  }] },
  { indent: 0, tokens: [] },
  { indent: 1, tokens: [{ t: "async",       c: "text-accent font-bold" }, { t: " deploy",   c: "text-dark"   }, { t: "(",   c: "text-dark/40"  }, { t: "app",         c: "text-accent" }, { t: ") {", c: "text-dark/40" }] },
  { indent: 2, tokens: [{ t: "await",       c: "text-accent font-bold" }, { t: " app",      c: "text-dark"   }, { t: ".",   c: "text-dark/40"  }, { t: "scale",       c: "text-accent" }, { t: "({ edge: ", c: "text-dark/40" }, { t: "true", c: "text-accent" }, { t: " });", c: "text-dark/40" }] },
];

const STATS = [
  { value: "8+",    label: "Yrs" },
  { value: "40+",   label: "Systems" },
  { value: "10K+",  label: "AI/Day" },
  { value: "99.9%", label: "Uptime" },
];

const MARQUEE_ITEMS = [
  "FastAPI", "Docker", "React", "Next.js", "Python",
  "TypeScript", "LangChain", "AWS", "PostgreSQL", "Rust",
];

export function HeroSection() {
  return (
    <>
      <section
        aria-label="Introduction"
        className="relative w-full overflow-hidden bg-white"
        style={{ minHeight: "calc(100vh - 72px)" }}
      >

        {/* ── GLSL hills — fills section, clipped ── */}
        <div className="absolute inset-0 z-0" aria-hidden="true">
          <GLSLHills speed={0.4} cameraZ={115} planeSize={256} contained />
        </div>

        {/* ── Vignette: transparent sides, white center band ── */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 12%, rgba(255,255,255,0.85) 26%, white 38%, white 62%, rgba(255,255,255,0.85) 74%, rgba(255,255,255,0.1) 88%, transparent 100%)",
          }}
        />
        {/* top + bottom white fades */}
        <div className="absolute inset-x-0 top-0 h-20 z-[2] pointer-events-none"
          style={{ background: "linear-gradient(to bottom, white 0%, transparent 100%)" }}
          aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-32 z-[2] pointer-events-none"
          style={{ background: "linear-gradient(to top, white 0%, transparent 100%)" }}
          aria-hidden="true" />

        {/* ══════════════════════════════════════════
            LAYOUT: 3-row stack
        ══════════════════════════════════════════ */}
        <div className="relative z-10 w-full h-full flex flex-col"
          style={{ minHeight: "calc(100vh - 72px)" }}>

          {/* ── ROW 1: top meta bar ── */}
          <div className="flex items-center justify-between px-6 sm:px-10 lg:px-16 pt-10 pb-0">
            <div className="flex items-center gap-3">
              <span className="inline-block w-2 h-2 bg-accent" aria-hidden="true" />
              <span className="font-mono text-[10px] font-bold tracking-[0.28em] uppercase text-dark/40">
                AI &amp; Full-Stack Engineer
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-highlight animate-pulse" aria-hidden="true" />
              <span className="font-mono text-[10px] font-bold tracking-[0.22em] uppercase text-dark/40">
                Available
              </span>
            </div>
          </div>

          {/* ── ROW 2: giant name + terminal ── */}
          <div className="flex-1 flex flex-col lg:flex-row items-end lg:items-center
                          px-6 sm:px-10 lg:px-16 pt-6 pb-0 gap-8 lg:gap-0">

            {/* NAME — full-bleed typographic anchor */}
            <div className="flex-1 min-w-0 flex flex-col justify-end lg:justify-center">
              <h1
                className="hero-name font-black uppercase select-none"
                aria-label={PERSONAL_INFO.name}
              >
                {/* RAJ — solid fill */}
                <span className="block text-dark leading-[0.82]">
                  RAJ
                </span>
                {/* SHAH — outline, offset right for asymmetry */}
                <span
                  className="block text-outline leading-[0.82]"
                  style={{ paddingLeft: "clamp(1rem, 4vw, 5rem)" }}
                >
                  SHAH
                </span>
              </h1>

              {/* Accent rule under name */}
              <div className="flex items-center gap-3 mt-5">
                <div className="h-[3px] bg-accent" style={{ width: "clamp(3rem, 8vw, 7rem)" }} />
                <div className="h-[3px] bg-dark/10 flex-1" />
              </div>
            </div>

            {/* TERMINAL — Light Theme IDE style */}
            <div
              className="w-full lg:w-[440px] xl:w-[480px] shrink-0 lg:ml-12 xl:ml-20
                         lg:-translate-y-6"
              aria-hidden="true"
            >
              {/* Corner accent */}
              <div className="flex justify-end mb-2 pr-1">
                <span className="font-mono text-[9px] font-bold tracking-[0.24em] uppercase text-dark/40">
                  engineer.ts
                </span>
              </div>

              <div className="border-2 border-accent bg-[#FAFAFA]"
                style={{ boxShadow: "6px 6px 0 0 #FF6600, 12px 12px 0 0 rgba(0,0,0,0.05)" }}>

                {/* Titlebar */}
                <div className="flex items-center gap-1.5 px-4 py-2.5 bg-white border-b-2 border-accent/10">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                  <div className="ml-auto flex items-center gap-3">
                    <span className="font-mono text-[10px] text-dark/30 tracking-widest">TS</span>
                    <span className="w-px h-3 bg-dark/10" />
                    <span className="font-mono text-[10px] text-dark/40 tracking-[0.14em]">engineer.ts</span>
                  </div>
                </div>

                {/* Code body */}
                <div className="px-4 pt-4 pb-3 font-mono text-[12.5px] leading-[1.85] select-none text-dark">
                  {CODE_LINES.map((line, i) => (
                    <div key={i} className="flex gap-3.5">
                      <span className="text-dark/20 w-4 shrink-0 text-right text-[11px] leading-[1.85] select-none">
                        {i + 1}
                      </span>
                      <span className="whitespace-pre">
                        {line.tokens.length === 0 ? "\u00A0" : (
                          <>
                            {"  ".repeat(line.indent)}
                            {line.tokens.map((tok, j) => (
                              <span key={j} className={tok.c}>{tok.t}</span>
                            ))}
                          </>
                        )}
                      </span>
                    </div>
                  ))}
                  {/* cursor */}
                  <div className="flex gap-3.5">
                    <span className="text-dark/20 w-4 shrink-0 text-right text-[11px] leading-[1.85]">
                      {CODE_LINES.length + 1}
                    </span>
                    <span className="cursor-blink inline-block w-[6px] h-[13px] bg-accent align-middle mt-[5px]" />
                  </div>
                </div>

                {/* Status bar */}
                <div className="border-t-2 border-accent/10 bg-white px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span className="font-mono text-[10px] text-dark/40 tracking-[0.16em] uppercase">TypeScript</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-dark/20">UTF-8</span>
                    <span className="font-mono text-[10px] text-accent font-bold tracking-[0.12em]">● LIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── ROW 3: bio + CTAs + stats ── */}
          <div className="px-6 sm:px-10 lg:px-16 pt-8 pb-10">
            <div className="flex flex-col lg:flex-row lg:items-end gap-8 lg:gap-16">

              {/* Bio + CTAs */}
              <div className="flex flex-col gap-6 max-w-[480px]">
                <p className="text-[14px] sm:text-[15px] text-dark/70 leading-[1.85]">
                  {PERSONAL_INFO.bio}
                </p>
                <div className="flex flex-wrap gap-3">
                  <BrutalistButton primary href="#contact">
                    <Mail className="w-4 h-4" aria-hidden="true" />
                    Initialize Contact
                  </BrutalistButton>
                  <BrutalistButton href={PERSONAL_INFO.github}>
                    <Github className="w-4 h-4" aria-hidden="true" />
                    View GitHub
                  </BrutalistButton>
                </div>
              </div>

              {/* Stats — pushed to the right on desktop */}
              <div className="lg:ml-auto flex items-end gap-0">
                {STATS.map((s, i) => (
                  <div
                    key={s.label}
                    className={`flex flex-col items-center px-4 py-3 sm:px-6 sm:py-4 ${
                      i < STATS.length - 1 ? "border-r-2 border-accent/10" : ""
                    }`}
                  >
                    <span className="font-black text-[1.5rem] sm:text-[2rem] leading-none tracking-tighter text-dark tabular-nums">
                      {s.value}
                    </span>
                    <span className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase text-dark/35 mt-1">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>

        {/* ── Scroll cue — bottom center ── */}
        <a
          href="#expertise"
          aria-label="Scroll to expertise"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 group focus:outline-none"
        >
          <span className="font-mono text-[8px] font-bold tracking-[0.3em] uppercase text-dark/25 group-hover:text-accent transition-colors">
            scroll
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-dark/20 to-transparent animate-bob" />
        </a>

      </section>

      {/* ── Marquee ── */}
      <Marquee items={MARQUEE_ITEMS} />
    </>
  );
}
