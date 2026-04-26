interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  index?: string;
}

export function SectionHeader({ title, subtitle, index }: SectionHeaderProps) {
  return (
    <header className="mb-20 md:mb-32 flex flex-col gap-3">
      {index && (
        <span className="font-mono text-[11px] font-bold tracking-[0.25em] uppercase text-accent">
          {index}
        </span>
      )}
      <div className="flex items-center gap-5">
        <div className="w-1.5 h-14 bg-accent shrink-0" aria-hidden="true" />
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter leading-[0.92] text-dark">
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="mt-1 text-[14px] text-dark/50 max-w-xl font-mono uppercase tracking-[0.12em] leading-relaxed pl-6">
          {subtitle}
        </p>
      )}
    </header>
  );
}
