import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

export default function StartupScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 3000; // 3.0 seconds total

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));

      setProgress(pct);

      if (pct >= 100) {
        clearInterval(timer);
        // Brief 300ms delay at 100% then initiate smooth fade-out transition
        setTimeout(() => {
          setFading(true);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 500); // 500ms fade duration
        }, 350);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [onComplete]);

  // Short dynamic status message based on percentage progression
  const getStatusText = (pct) => {
    if (pct < 20) return "Initializing NIRIKSHAK Intelligence Core...";
    if (pct < 40) return "Loading project intelligence & metrics...";
    if (pct < 60) return "Analyzing monitoring modules & peer twins...";
    if (pct < 80) return "Preparing risk intelligence & spatial data...";
    if (pct < 96) return "Initializing investigation centre queue...";
    return "Command Center ready";
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white select-none transition-opacity duration-500 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Subtle Gradient Glow */}
      <div className="absolute inset-0 bg-radial from-slate-900/60 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Main Center Composition */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-sm sm:max-w-md w-full">
        {/* Brand Logo Lettermark */}
        <div className="relative flex items-center justify-center mb-5">
          <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-emerald-400 font-black text-2xl shadow-2xl ring-4 ring-emerald-500/10 animate-pulse">
            N
          </div>
        </div>

        {/* Brand Name & Subtitle */}
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wider leading-tight">
          NIRIKSHAK
        </h1>
        <p className="text-xs sm:text-sm font-bold text-slate-400 tracking-widest uppercase mt-1">
          MPLADS Risk Intelligence
        </p>
        <p className="text-[11px] font-medium text-slate-500 mt-0.5">
          AI-Powered Monitoring & Investigation Intelligence
        </p>

        {/* Dynamic Percentage Counter */}
        <div className="my-6">
          <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
            {progress}%
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-64 sm:w-80 h-2 bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner mb-4">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-75 ease-out shadow-[0_0_12px_rgba(16,185,129,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Short Dynamic Status Message */}
        <div className="h-5 flex items-center justify-center">
          <p className="text-[11px] font-semibold text-slate-400 animate-pulse tracking-wide">
            {getStatusText(progress)}
          </p>
        </div>

        {/* Government Footer Badge */}
        <div className="mt-12 flex items-center gap-1.5 text-[10px] text-slate-400 font-medium px-3 py-1 rounded bg-slate-900/60 border border-slate-800/80">
          <Shield className="w-3 h-3 text-slate-400" />
          <span>Government of India • MPLADS Governance Portal</span>
        </div>
      </div>
    </div>
  );
}
