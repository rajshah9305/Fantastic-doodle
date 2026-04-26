"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BrainCircuit, Cpu, Database, ExternalLink, Github,
  Zap, Layers, Code2, Bot, ArrowUpRight,
} from "lucide-react";
import { PROJECTS, PERSONAL_INFO, type Project } from "@/config/portfolio";
import { SectionHeader } from "./SectionHeader";
import { BrutalistButton } from "./BrutalistButton";

const EASE_OUT_EXPO: [number, number, number, number] = [0.33, 1, 0.68, 1];

function ProjectIcon({ icon }: { icon: Project["icon"] }) {
  const cls = "w-5 h-5";
  switch (icon) {
    case "brain":    return <BrainCircuit className={cls} />;
    case "cpu":      return <Cpu className={cls} />;
    case "database": return <Database className={cls} />;
    case "zap":      return <Zap className={cls} />;
    case "layers":   return <Layers className={cls} />;
    case "code":     return <Code2 className={cls} />;
    case "bot":      return <Bot className={cls} />;
  }
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const reduce = useReducedMotion();
  const isEven = index % 2 === 0;

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: index * 0.05 }}
      className="group grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] border-b-2 border-black last:border-b-0 hover:bg-accent transition-colors duration-300"
    >
      {/* Left panel */}
      <div className={`flex flex-col justify-between p-8 md:p-12 border-b-2 lg:border-b-0 lg:border-r-2 border-black ${isEven ? "lg:order-1" : "lg:order-2"}`}>
        <div>
          {/* Number + featured */}
          <div className="flex items-center justify-between mb-8">
            <span className="font-mono text-[11px] font-bold text-accent tracking-[0.25em]">
              {project.number.padStart(2, "0")}
            </span>
            {project.featured && (
              <span className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 bg-highlight text-black">
                FEATURED
              </span>
            )}
          </div>

          {/* Icon */}
          <div
            className="w-12 h-12 bg-accent group-hover:bg-black text-white flex items-center justify-center border-2 border-black group-hover:border-black mb-6 transform group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300"
            aria-hidden="true"
          >
            <ProjectIcon icon={project.icon} />
          </div>

          {/* Title */}
          <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-dark group-hover:text-black leading-tight mb-3 transition-colors duration-300">
            {project.title}
          </h3>

          {/* Stat */}
          <span className="font-mono text-[11px] font-bold text-accent tracking-[0.18em] uppercase">
            {project.stat}
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 mt-10">
          {project.links.live && (
            <a
              href={project.links.live}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase text-dark/40 group-hover:text-black/40 hover:!text-accent transition-colors focus:outline-none"
            >
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
              Live
            </a>
          )}
          {project.links.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase text-dark/40 group-hover:text-black/40 hover:!text-accent transition-colors focus:outline-none"
            >
              <Github className="w-4 h-4" aria-hidden="true" />
              Source
            </a>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className={`flex flex-col justify-between p-8 md:p-12 ${isEven ? "lg:order-2" : "lg:order-1"}`}>
        <p className="text-[16px] text-dark/75 group-hover:text-black/70 leading-[1.8] mb-8 transition-colors duration-300">
          {project.desc}
        </p>

        <div className="flex flex-wrap gap-2.5 mb-10" aria-label="Technologies used">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.15em] uppercase text-dark/50 group-hover:text-black/50 border border-black/20 group-hover:border-black/20 bg-transparent transition-colors duration-300"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex justify-end">
          <a
            href={project.links.live ?? project.links.github ?? "#"}
            target="_blank"
            rel="noreferrer"
            aria-label={`View ${project.title}`}
            className="w-12 h-12 bg-accent group-hover:bg-black text-white flex items-center justify-center border-2 border-black group-hover:border-black transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 hover:translate-x-1 hover:-translate-y-1"
          >
            <ArrowUpRight className="w-5 h-5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </motion.article>
  );
}

export function ProjectsSection() {
  return (
    <section id="work" className="w-full border-b-2 border-black scroll-mt-[72px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-48">
        <SectionHeader
          title="Selected Works"
          subtitle="Production-grade systems, AI orchestrations, and open-source contributions."
          index="// 02 — WORK"
        />

        <div className="border-2 border-black overflow-hidden">
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>

        <div className="mt-12 flex justify-start">
          <BrutalistButton href={PERSONAL_INFO.github}>
            <Github className="w-4 h-4" aria-hidden="true" />
            View All Repositories
          </BrutalistButton>
        </div>
      </div>
    </section>
  );
}
