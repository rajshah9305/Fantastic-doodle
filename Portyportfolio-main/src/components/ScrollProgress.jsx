import React from 'react';
import { useScrollProgress } from '../hooks/useScrollProgress';

export const ScrollProgress = () => {
  const scrolled = useScrollProgress();

  return (
    <div 
      className="fixed right-0 top-0 z-50 h-full w-1.5 hidden md:block bg-zinc-200/30 backdrop-blur-sm"
      role="progressbar"
      aria-valuenow={Math.round(scrolled)}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label="Page scroll progress"
    >
      <div 
        className="w-full bg-orange-600 transition-all duration-150 ease-out" 
        style={{ height: `${scrolled}%` }} 
      />
    </div>
  );
};
