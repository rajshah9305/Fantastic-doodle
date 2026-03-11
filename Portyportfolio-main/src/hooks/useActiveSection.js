import { useState, useEffect } from 'react';

export const useActiveSection = (sectionIds = []) => {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      for (const sectionId of sectionIds) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Section is considered active when it's in the top 30% of viewport
          if (rect.top >= 0 && rect.top <= window.innerHeight * 0.3) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionIds]);

  return activeSection;
};
