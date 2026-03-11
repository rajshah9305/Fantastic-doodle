import { useState, useEffect } from 'react';

export const useScrollProgress = () => {
  const [scrolled, setScrolled] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollProgress = height > 0 ? (winScroll / height) * 100 : 0;
      setScrolled(scrollProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrolled;
};
