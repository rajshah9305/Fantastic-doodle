"use client";

import { motion } from "framer-motion";

interface MarqueeProps {
  items: string[];
  reverse?: boolean;
}

export function Marquee({ items, reverse = false }: MarqueeProps) {
  const doubled = [...items, ...items];

  return (
    <div className="w-full overflow-hidden bg-white select-none border-y-2 border-black">
      <div className="flex whitespace-nowrap py-4">
        <motion.div
          animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
          className="flex items-center"
        >
          {doubled.map((item, i) => (
            <div key={i} className="flex items-center">
              <span className="font-mono font-black text-[13px] tracking-[0.3em] uppercase text-dark px-6">
                {item}
              </span>
              <span className="text-accent font-black text-[10px]" aria-hidden="true">◆</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
