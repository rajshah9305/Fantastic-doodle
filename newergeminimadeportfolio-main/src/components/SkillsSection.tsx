"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SKILLS } from "@/config/portfolio";
import { SectionHeader } from "./SectionHeader";

const EASE_OUT_CUBIC: [number, number, number, number] = [0.33, 1, 0.68, 1];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: EASE_OUT_CUBIC,
    },
  },
};

/**
 * Returns border classes for a grid item at position `idx` in a `total`-item grid
 * that reflows from 1-col (mobile) → 2-col (sm) → 4-col (lg).
 *
 * The outer wrapper already carries `border-2 border-black`, so we only need
 * interior dividing borders.
 */
function getGridBorderClass(idx: number, total: number): string {
  const classes: string[] = [];

  // ── Mobile (1-col): bottom border on every item except the last ──
  if (idx < total - 1) {
    classes.push("border-b-2 border-black");
  }

  // ── SM (2-col): right border on left column (even indices) ──
  if (idx % 2 === 0) {
    classes.push("sm:border-r-2");
  }

  // ── SM (2-col): bottom border only on the first row (indices 0 & 1) ──
  //    Override mobile bottom-border removal for second row items.
  if (idx < 2) {
    classes.push("sm:border-b-2");
  } else {
    classes.push("sm:border-b-0");
  }

  // ── LG (4-col): right border on all items except the last ──
  //    Also remove any residual bottom borders from narrower breakpoints.
  if (idx < total - 1) {
    classes.push("lg:border-r-2");
  } else {
    classes.push("lg:border-r-0");
  }
  classes.push("lg:border-b-0");

  return classes.join(" ");
}

export function SkillsSection() {
  const reduce = useReducedMotion();

  return (
    <section id="expertise" className="w-full border-b-2 border-black scroll-mt-[72px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-48">
        <SectionHeader
          title="Technical Arsenal"
          subtitle="Deep expertise across the modern full-stack and AI landscape."
          index="// 01 — EXPERTISE"
        />

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-2 border-black overflow-hidden"
          variants={containerVariants}
          initial={reduce ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {SKILLS.map((group, idx) => (
            <motion.article
              key={idx}
              variants={itemVariants}
              className={`flex flex-col p-8 bg-white hover:bg-accent group transition-colors duration-300 ${getGridBorderClass(idx, SKILLS.length)}`}
            >
              <h3 className="font-mono text-[10px] font-bold text-accent mb-6 tracking-[0.22em] uppercase">
                {`// ${group.category}`}
              </h3>
              <ul className="flex flex-col gap-3.5 flex-1">
                {group.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span
                      className="w-1.5 h-1.5 bg-accent shrink-0 rotate-45 group-hover:rotate-0 transition-transform duration-300"
                      aria-hidden="true"
                    />
                    <span className="text-[14px] font-bold text-dark group-hover:text-black transition-colors duration-300 tracking-tight">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
