import { useState, useEffect, useRef } from 'react';

export const useDecrypt = (text, trigger = true) => {
  const [display, setDisplay] = useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#$%&";
  const hasRun = useRef(false);
  
  useEffect(() => {
    if (!trigger || hasRun.current) return;
    
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((letter, index) => {
            if (index < iteration) return letter;
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );
      
      if (iteration >= text.length) {
        clearInterval(interval);
        hasRun.current = true;
      }
      
      iteration += 1 / 3;
    }, 30);
    
    return () => clearInterval(interval);
  }, [text, trigger, chars]);
  
  return display;
};
