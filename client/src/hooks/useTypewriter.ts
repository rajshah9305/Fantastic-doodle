import { useState, useEffect } from 'react';

export function useTypewriter(text: string, speed: number = 30) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!text) {
      setDisplayedText("");
      return;
    }

    const lines = text.split('\n');
    let currentLine = 0;
    setDisplayedText("");

    const timer = setInterval(() => {
      if (currentLine < lines.length) {
        setDisplayedText((prev) => {
          const newLine = lines[currentLine];
          if (newLine === undefined) return prev;
          return prev + (prev ? '\n' : '') + newLine;
        });
        currentLine++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return displayedText;
}
