import React, { useState, useEffect } from 'react';

export const ParallaxGrid = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const moveX = (mousePos.x / window.innerWidth) * 20;
  const moveY = (mousePos.y / window.innerHeight) * 20;

  return (
    <div
      className="fixed inset-0 z-0 h-full w-full pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="absolute inset-[-50px] transition-transform duration-100 ease-out will-change-transform"
        style={{ transform: `translate(${-moveX}px, ${-moveY}px)` }}
      >
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: 'linear-gradient(#e4e4e7 1px, transparent 1px), linear-gradient(90deg, #e4e4e7 1px, transparent 1px)',
            backgroundSize: '80px 80px'
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: 'linear-gradient(#e4e4e7 1px, transparent 1px), linear-gradient(90deg, #e4e4e7 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />
      </div>
    </div>
  );
};
