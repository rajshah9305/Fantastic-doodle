"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Mail, Github, Linkedin, Copy, Check, ArrowRight } from "lucide-react";
import { PERSONAL_INFO } from "@/config/portfolio";

export function ContactSection() {
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(PERSONAL_INFO.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section id="contact" className="w-full bg-white border-t-4 border-black scroll-mt-[80px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">

          {/* Left — heading */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="font-mono text-[11px] font-bold tracking-[0.3em] uppercase text-accent mb-6 block">
              {`// 04 — CONTACT`}
            </span>
            <h2 className="text-6xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-black mb-8">
              Let&apos;s <span className="text-accent">Sync</span>
              <br />
              Systems
            </h2>
            <p className="font-mono text-[14px] text-black/80 uppercase tracking-[0.2em] leading-[1.8] max-w-sm">
              Currently open to technical leadership roles and high-impact AI engineering projects.
            </p>
          </motion.div>

          {/* Right — actions */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col gap-6"
          >
            {/* Email Link */}
            <a
              href={`mailto:${PERSONAL_INFO.email}`}
              className="group flex items-center justify-between px-8 py-8 bg-accent text-black border-4 border-black hover:bg-accent hover:border-black shadow-[8px_8px_0px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-300 focus:outline-none"
            >
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-black/50 group-hover:text-black/70">Send Message</span>
                <span className="font-mono text-[14px] sm:text-[18px] font-black uppercase tracking-[0.1em]">
                  {PERSONAL_INFO.email}
                </span>
              </div>
              <Mail className="w-8 h-8 shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true" />
            </a>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Copy Button */}
              <button
                onClick={copyEmail}
                className="flex items-center justify-between px-6 py-5 bg-white text-black border-4 border-black hover:bg-accent hover:border-black hover:text-white transition-all duration-300 focus:outline-none group shadow-[4px_4px_0px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.2em]">
                  {copied ? "Copied!" : "Copy Email"}
                </span>
                {copied ? <Check className="w-5 h-5 shrink-0 text-white" /> : <Copy className="w-5 h-5 shrink-0" />}
              </button>

              {/* GitHub Link */}
              <a
                href={PERSONAL_INFO.github}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-6 py-5 bg-white text-black border-4 border-black hover:bg-accent hover:text-white transition-all duration-300 focus:outline-none group shadow-[4px_4px_0px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.2em]">View GitHub</span>
                <Github className="w-5 h-5" />
              </a>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4 pt-4">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-black/30">Connect:</span>
              <a href={PERSONAL_INFO.linkedin} target="_blank" rel="noreferrer"
                 className="text-black hover:text-accent transition-colors font-mono text-[12px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                LinkedIn <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
