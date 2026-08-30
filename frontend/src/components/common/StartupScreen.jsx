import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

export default function StartupScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2800; // 2.8s clean smooth loading

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));

      setProgress(pct);

      if (pct >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          setFading(true);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 450);
        }, 300);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [onComplete]);

  const getStatusText = (pct) => {
    if (pct < 25) return "Initializing NIRIKSHAK...";
    if (pct < 50) return "Loading project intelligence...";
    if (pct < 75) return "Preparing monitoring modules...";
    if (pct < 95) return "Preparing risk intelligence...";
    return "Command Center ready";
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white select-none transition-opacity duration-500 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-sm sm:max-w-md w-full">
        {/* Brand Logo Lettermark */}
        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-emerald-400 font-black text-2xl shadow-xl mb-4">
          N
        </div>

        {/* Brand Name & Subtitle */}
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wider">
          NIRIKSHAK
        </h1>
        <p className="text-xs sm:text-sm font-bold text-slate-400 tracking-widest uppercase mt-1">
          MPLADS Risk Intelligence
        </p>
        <p className="text-[11px] font-medium text-slate-500 mt-0.5">
          AI-Powered Monitoring & Investigation Intelligence
        </p>

        {/* Percentage Counter */}
        <div className="my-5">
          <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
            {progress}%
          </span>
        </div>

        {/* Simple Clean Progress Bar */}
        <div className="w-64 sm:w-72 h-1.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-75 ease-out shadow-[0_0_10px_rgba(16,185,129,0.4)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Short Dynamic Status Message */}
        <div className="h-5 flex items-center justify-center">
          <p className="text-[11px] font-semibold text-slate-400 tracking-wide font-mono">
            {getStatusText(progress)}
          </p>
        </div>

        {/* Government Badge */}
        <div className="mt-10 flex items-center gap-1.5 text-[10px] text-slate-400 font-medium px-3 py-1 rounded bg-slate-900/80 border border-slate-800">
          <Shield className="w-3 h-3 text-slate-400" />
          <span>Government of India • MPLADS Governance Portal</span>
        </div>
      </div>
    </div>
  );
}
