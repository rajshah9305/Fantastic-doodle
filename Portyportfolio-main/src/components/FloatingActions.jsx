import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowUp } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolio';

export const FloatingActions = ({ onScrollToTop }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PORTFOLIO_DATA.profile.socials.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-40 flex flex-col gap-2">
      <button
        onClick={handleCopyEmail}
        className="h-10 w-10 bg-zinc-900 text-white flex items-center justify-center shadow-lg hover:bg-orange-600 transition-colors relative group rounded-sm"
        title="Copy Email"
        aria-label={copied ? "Email copied" : "Copy email address"}
      >
        {copied ? <CheckCircle2 size={18} /> : <Mail size={18} />}
        <span className="absolute right-full mr-2 bg-zinc-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-mono pointer-events-none">
          {copied ? "COPIED" : "COPY EMAIL"}
        </span>
      </button>

      <button
        onClick={onScrollToTop}
        className="h-10 w-10 bg-white border border-zinc-200 text-zinc-900 flex items-center justify-center shadow-lg hover:border-orange-600 hover:text-orange-600 transition-colors rounded-sm"
        title="Back to Top"
        aria-label="Back to top"
      >
        <ArrowUp size={18} />
      </button>
    </div>
  );
};
