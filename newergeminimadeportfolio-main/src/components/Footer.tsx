import { PERSONAL_INFO } from "@/config/portfolio";

export function Footer() {
  return (
    <footer className="bg-white border-t-4 border-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-accent text-black font-black flex items-center justify-center text-[12px] tracking-widest shrink-0" aria-hidden="true">
            RS
          </div>
          <div className="flex flex-col">
            <span className="font-black text-black uppercase tracking-tighter text-lg leading-none">Raj Shah</span>
            <span className="font-mono text-[10px] text-black/40 uppercase tracking-[0.2em] mt-1">AI & Full-Stack Engineer</span>
          </div>
        </div>

        <p className="font-mono text-[10px] text-black/50 tracking-[0.2em] uppercase text-center md:text-right max-w-md leading-relaxed">
          SYSTEM_STATUS: ONLINE | VERSION 0.4.2 | © {new Date().getFullYear()}{" "}
          {PERSONAL_INFO.name.toUpperCase()} | ALL RIGHTS RESERVED
        </p>
      </div>
    </footer>
  );
}
