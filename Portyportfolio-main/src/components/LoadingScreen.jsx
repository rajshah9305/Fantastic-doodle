import React, { useState, useEffect } from 'react';

const BOOT_LOGS = [
  "IDENTITY_VERIFIED...",
  "INITIALIZING_RS_CORE...",
  "LOADING_ASSETS...",
  "SYSTEM_READY"
];

export const LoadingScreen = ({ onComplete }) => {
  const [bootLog, setBootLog] = useState([]);

  useEffect(() => {
    let delay = 0;

    BOOT_LOGS.forEach((log) => {
      delay += 300;
      setTimeout(() => setBootLog(prev => [...prev, log]), delay);
    });

    const finishTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, delay + 500);

    return () => clearTimeout(finishTimer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white font-mono text-xs text-zinc-900">
      <div className="w-80 space-y-6">
        <div className="flex justify-between border-b border-zinc-200 pb-2">
          <span className="font-bold">BOOT_LOADER</span>
          <span className="text-orange-600 animate-pulse">RS.SYS</span>
        </div>

        <div className="h-48 font-mono font-medium text-zinc-500 space-y-2 overflow-hidden flex flex-col justify-end pb-2" role="status" aria-live="polite">
          {bootLog.map((log, i) => (
            <div key={i}>&gt; {log}</div>
          ))}
        </div>

        <div className="h-1 w-full bg-zinc-200" role="progressbar" aria-valuenow={(bootLog.length / BOOT_LOGS.length) * 100} aria-valuemin="0" aria-valuemax="100">
          <div
            className="h-full bg-orange-600 transition-all duration-300 ease-out"
            style={{ width: `${(bootLog.length / BOOT_LOGS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
