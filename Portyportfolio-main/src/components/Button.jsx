import React from 'react';

export const Button = ({
  children,
  onClick,
  variant = 'primary',
  icon: Icon,
  href,
  className = '',
  ariaLabel
}) => {
  const baseClasses = "group relative flex items-center justify-center gap-3 overflow-hidden font-mono text-xs font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer z-20";

  const variants = {
    primary: "px-8 py-4 border shadow-sm hover:shadow-md border-zinc-900 bg-zinc-900 text-white hover:bg-orange-600 hover:border-orange-600",
    outline: "px-8 py-4 border shadow-sm hover:shadow-md border-zinc-300 bg-white text-zinc-900 hover:border-orange-600 hover:text-white",
    minimal: "px-0 py-2 border-none bg-transparent text-zinc-400 hover:text-white justify-start"
  };

  const content = (
    <>
      <span className="z-10 flex items-center gap-2 relative">
        {Icon && <Icon size={14} className="transition-transform duration-300 group-hover:rotate-12" />}
        {children}
      </span>
      <div className="absolute inset-0 -translate-x-full bg-orange-600 transition-transform duration-300 ease-out-expo group-hover:translate-x-0" />
    </>
  );

  const combinedClasses = `${baseClasses} ${variants[variant]} ${className}`;

  if (href) {
    const isExternal = href.startsWith('http') || href.startsWith('mailto:');
    const isAnchor = href.startsWith('#');

    const handleClick = (e) => {
      if (isAnchor) {
        e.preventDefault();
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    return (
      <a
        href={href}
        onClick={handleClick}
        target={isExternal && !href.startsWith('mailto:') ? "_blank" : undefined}
        rel={isExternal && !href.startsWith('mailto:') ? "noopener noreferrer" : undefined}
        className={combinedClasses}
        aria-label={ariaLabel || children}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      className={combinedClasses}
      aria-label={ariaLabel || children}
    >
      {content}
    </button>
  );
};
