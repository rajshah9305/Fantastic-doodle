import React, { useState, useEffect } from 'react';
import { Github, Linkedin, Menu, X } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolio';
import { useActiveSection } from '../hooks/useActiveSection';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

const NAV_ITEMS = [
  { name: 'SERVICES', href: '#services', id: 'services', num: '01' },
  { name: 'WORK', href: '#work', id: 'work', num: '02' },
  { name: 'EXPERIENCE', href: '#experience', id: 'experience', num: '03' }
];

export const Navigation = ({ onScrollToTop }) => {
  const [currentTime, setCurrentTime] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const activeSection = useActiveSection(['services', 'work', 'experience']);

  useLockBodyScroll(isMobileMenuOpen);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    setTimeout(() => {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, isMobileMenuOpen ? 300 : 0);
  };

  return (
    <>
      <nav className="fixed top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="flex h-16 md:h-20 items-center justify-between px-6 md:px-12 max-w-[1920px] mx-auto">
          {/* Logo */}
          <button
            className="flex items-center gap-4 group cursor-pointer"
            onClick={onScrollToTop}
            aria-label="Scroll to top"
          >
            <div className="flex h-8 w-8 items-center justify-center bg-orange-600 text-white font-black text-sm tracking-tighter shadow-md hover:scale-105 transition-transform">
              RS
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-wider text-sm text-zinc-900">
                {PORTFOLIO_DATA.profile.name}
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center p-1.5 bg-zinc-100/80 backdrop-blur-md border border-zinc-200/50 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`relative px-6 py-2.5 rounded-full font-mono text-[11px] font-bold tracking-widest transition-all duration-300 flex items-center gap-2 group ${isActive
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-white/50'
                    }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isActive
                      ? 'bg-orange-600 scale-125'
                      : 'bg-zinc-300 group-hover:bg-orange-400'
                      }`}
                  />
                  {item.name}
                </a>
              );
            })}
          </div>

          {/* Socials & Status */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end text-[10px] font-mono font-medium leading-tight text-zinc-400">
              <span>
                STATUS: <span className="text-orange-600 font-bold">ONLINE</span>
              </span>
              <span>UTC {currentTime}</span>
            </div>

            <div className="h-8 w-[1px] bg-zinc-200 hidden md:block"></div>

            <a
              href={PORTFOLIO_DATA.profile.socials.github}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-500 hover:text-zinc-900 transition-colors hidden sm:block"
              aria-label="GitHub Profile"
            >
              <Github size={20} />
            </a>

            <a
              href={PORTFOLIO_DATA.profile.socials.linkedin}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-500 hover:text-blue-700 transition-colors hidden sm:block"
              aria-label="LinkedIn Profile"
            >
              <Linkedin size={20} />
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-zinc-900 hover:bg-zinc-100 rounded-md z-50"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 bg-zinc-50/90 backdrop-blur-xl transition-transform duration-500 ease-out-expo lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsMobileMenuOpen(false);
          }
        }}
      >
        <div className="flex flex-col h-full justify-between p-8 pt-32">
          <div className="flex flex-col gap-6">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="group flex items-baseline gap-4 font-sans text-4xl sm:text-5xl font-black text-zinc-900 hover:text-orange-600 transition-colors tracking-tighter"
              >
                <span className="text-sm font-mono font-bold text-zinc-400 group-hover:text-orange-600">
                  {item.num}
                </span>
                {item.name}
              </a>
            ))}
          </div>

          <div className="flex gap-6 pt-8 border-t border-zinc-200">
            <a
              href={PORTFOLIO_DATA.profile.socials.github}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-500 hover:text-zinc-900 transition-colors"
              aria-label="GitHub Profile"
            >
              <Github size={32} />
            </a>
            <a
              href={PORTFOLIO_DATA.profile.socials.linkedin}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-500 hover:text-blue-700 transition-colors"
              aria-label="LinkedIn Profile"
            >
              <Linkedin size={32} />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};
