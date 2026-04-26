import { ReactNode } from "react";

interface BrutalistButtonProps {
  children: ReactNode;
  primary?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
  download?: string | boolean;
}

const BTN =
  "inline-flex items-center justify-center gap-2 font-mono text-[11px] sm:text-[12px] font-black uppercase tracking-[0.16em] px-6 py-4 bg-black text-white border-2 border-black shadow-[4px_4px_0px_0px_#FF6600] hover:bg-accent hover:border-accent hover:shadow-[6px_6px_0px_0px_#000000] hover:-translate-y-[2px] hover:-translate-x-[2px] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 cursor-pointer";

export function BrutalistButton({
  children,
  href,
  onClick,
  className = "",
  ariaLabel,
  download,
}: BrutalistButtonProps) {
  const cls = `${BTN} ${className}`;

  if (href) {
    return (
      <a
        href={href}
        download={download}
        aria-label={ariaLabel}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className={cls}
      >
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel} className={cls}>
      {children}
    </button>
  );
}
