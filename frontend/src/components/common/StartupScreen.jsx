import React, { useState, useEffect, useRef } from 'react';
import { Shield, Activity, Database, MapPin, Zap, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

export default function StartupScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const canvasRef = useRef(null);

  // 1. Animated Progress Timer (0% to 100% over ~3.5 seconds)
  useEffect(() => {
    const startTime = Date.now();
    const duration = 3500;

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
          }, 600);
        }, 400);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [onComplete]);

  // 2. Dynamic Rotating Status Messages
  const getStatusText = (pct) => {
    if (pct < 20) return "Validating project data & sanction records...";
    if (pct < 40) return "Comparing peer projects & benchmark metrics...";
    if (pct < 60) return "Scanning spatial relationships & geo-overlaps...";
    if (pct < 80) return "Evaluating financial utilization signals...";
    if (pct < 95) return "Generating risk intelligence & priority queue...";
    return "Command Center ready";
  };

  // Active stage determination (COLLECT -> DETECT -> EXPLAIN -> PREDICT)
  const activeStage = progress < 25 ? 0 : progress < 50 ? 1 : progress < 75 ? 2 : 3;

  // 3. Canvas Background Animation (India Network Nodes & Data Particles)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Geographic network node points representing regions (Delhi, Lucknow, Varanasi, Patna, Kolkata, Mumbai, Bengaluru)
    const nodes = [
      { id: 'delhi', label: 'Delhi HQ', x: 0.42, y: 0.32, color: '#38bdf8', pulse: 0 },
      { id: 'lucknow', label: 'Lucknow', x: 0.49, y: 0.38, color: '#10b981', pulse: 1 },
      { id: 'varanasi', label: 'Varanasi', x: 0.54, y: 0.42, color: '#ef4444', pulse: 2 },
      { id: 'patna', label: 'Patna', x: 0.59, y: 0.41, color: '#f59e0b', pulse: 3 },
      { id: 'kolkata', label: 'Kolkata', x: 0.65, y: 0.48, color: '#38bdf8', pulse: 0 },
      { id: 'mumbai', label: 'Mumbai', x: 0.35, y: 0.58, color: '#10b981', pulse: 1 },
      { id: 'bengaluru', label: 'Bengaluru', x: 0.44, y: 0.72, color: '#38bdf8', pulse: 2 }
    ];

    // Connections between regional nodes
    const connections = [
      { from: 'delhi', to: 'lucknow' },
      { from: 'lucknow', to: 'varanasi' },
      { from: 'varanasi', to: 'patna' },
      { from: 'patna', to: 'kolkata' },
      { from: 'delhi', to: 'mumbai' },
      { from: 'mumbai', to: 'bengaluru' },
      { from: 'lucknow', to: 'bengaluru' },
      { from: 'varanasi', to: 'bengaluru' }
    ];

    // Particle packets flowing along connections
    const particles = connections.map((conn, idx) => ({
      ...conn,
      progress: (idx * 0.15) % 1,
      speed: 0.004 + (idx % 3) * 0.002
    }));

    let step = 0;

    const render = () => {
      step += 0.03;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Draw Grid Lines (Subtle HUD Background Grid)
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.3)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Connections (Network Data Lines)
      connections.forEach(conn => {
        const fromNode = nodes.find(n => n.id === conn.from);
        const toNode = nodes.find(n => n.id === conn.to);
        if (fromNode && toNode) {
          const x1 = fromNode.x * width;
          const y1 = fromNode.y * height;
          const x2 = toNode.x * width;
          const y2 = toNode.y * height;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
          ctx.lineWidth = 1.2;
          ctx.setLineDash([4, 6]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // Animate & Draw Data Particles
      particles.forEach(p => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;

        const fromNode = nodes.find(n => n.id === p.from);
        const toNode = nodes.find(n => n.id === p.to);
        if (fromNode && toNode) {
          const x1 = fromNode.x * width;
          const y1 = fromNode.y * height;
          const x2 = toNode.x * width;
          const y2 = toNode.y * height;

          const currX = x1 + (x2 - x1) * p.progress;
          const currY = y1 + (y2 - y1) * p.progress;

          ctx.beginPath();
          ctx.arc(currX, currY, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Draw Glowing Regional Nodes
      nodes.forEach(n => {
        const nx = n.x * width;
        const ny = n.y * height;
        const pulseRadius = 4 + Math.sin(step + n.pulse) * 3;

        // Outer Glow Ring
        ctx.beginPath();
        ctx.arc(nx, ny, pulseRadius + 6, 0, Math.PI * 2);
        ctx.fillStyle = `${n.color}22`;
        ctx.fill();

        // Inner Core Node
        ctx.beginPath();
        ctx.arc(nx, ny, 4, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Node Label
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(n.label, nx + 8, ny + 3);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', updateSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white select-none transition-opacity duration-600 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Interactive Background Canvas (India Intelligence Network Map) */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-60" />

      {/* Dark Blur Overlay Mask (Ensures 80% High Contrast for Foreground Readability) */}
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] z-0" />

      {/* SUBTLE FLOATING HUD PANELS (BACKGROUND UI ELEMENTS) */}
      {/* Left HUD Panel: Anomaly & Risk Trend */}
      <div className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 z-10 w-64 bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-[11px] backdrop-blur-md space-y-2 pointer-events-none">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" /> System Risk Scan
          </span>
          <span className="text-[9px] bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded font-mono">LIVE 60Hz</span>
        </div>
        <div className="space-y-1.5 text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">Financial Mismatch:</span>
            <span className="font-mono text-red-400 font-bold">+44.8% Delta</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Spatial Overlaps:</span>
            <span className="font-mono text-amber-400 font-bold">4 Flagged</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Peer Twin Progress Lag:</span>
            <span className="font-mono text-cyan-400 font-bold">-26.8%</span>
          </div>
        </div>
        {/* Animated Sparkline SVG */}
        <div className="pt-1">
          <span className="text-[9px] text-slate-500 font-bold block mb-1">REALTIME EXPOSURE DENSITY</span>
          <svg className="w-full h-8 stroke-cyan-400 fill-cyan-500/10" viewBox="0 0 100 30">
            <path d="M0,25 Q15,5 30,18 T60,8 T90,22 L100,20 L100,30 L0,30 Z" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* Right HUD Panel: Geographic Data Stream */}
      <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 z-10 w-64 bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-[11px] backdrop-blur-md space-y-2.5 pointer-events-none">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-400" /> Data Ingestion
          </span>
          <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-mono">12,482 Works</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
          <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
            <span className="text-slate-500 block">PROJECTS</span>
            <span className="font-mono font-bold text-white">50 Active</span>
          </div>
          <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
            <span className="text-slate-500 block">EXPENDITURE</span>
            <span className="font-mono font-bold text-emerald-400">₹9.86 Cr</span>
          </div>
          <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
            <span className="text-slate-500 block">GEO DATA</span>
            <span className="font-mono font-bold text-cyan-400">Haversine</span>
          </div>
          <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
            <span className="text-slate-500 block">AGENCY RISK</span>
            <span className="font-mono font-bold text-amber-400">87 / 100</span>
          </div>
        </div>
      </div>

      {/* FOREGROUND MAIN COMPOSITION */}
      <div className="relative z-20 flex flex-col items-center text-center px-4 max-w-lg w-full">
        {/* Central Intelligence Core with 4-Stage Ring (COLLECT -> DETECT -> EXPLAIN -> PREDICT) */}
        <div className="relative flex items-center justify-center mb-6">
          {/* Hexagonal Outer Stage Indicators */}
          <div className="w-32 h-32 rounded-full border border-slate-800 flex items-center justify-center relative animate-[spin_20s_linear_infinite]">
            <div className="absolute inset-0 rounded-full border-2 border-t-cyan-400 border-r-emerald-400 border-b-amber-400 border-l-purple-400 opacity-60" />
          </div>

          {/* Inner NIRIKSHAK AI Logo Core */}
          <div className="absolute w-20 h-20 rounded-2xl bg-slate-900 border border-slate-700/90 flex flex-col items-center justify-center shadow-2xl ring-4 ring-cyan-500/20 backdrop-blur-md">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-black text-xl shadow-sm mb-0.5">
              N
            </div>
            <span className="text-[9px] font-black text-cyan-400 tracking-wider">NIRIKSHAK</span>
          </div>
        </div>

        {/* Brand Header */}
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wider flex items-center justify-center gap-2">
          NIRIKSHAK <span className="text-cyan-400 font-extrabold text-xl sm:text-2xl bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/80">AI</span>
        </h1>
        <p className="text-xs sm:text-sm font-bold text-slate-400 tracking-widest uppercase mt-1">
          Intelligence Layer for MPLADS
        </p>

        {/* Subheader Status */}
        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-cyan-400 tracking-wider">
          <Zap className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
          <span>ANALYZING PROJECT ECOSYSTEM...</span>
        </div>

        {/* Percentage Counter */}
        <div className="my-3">
          <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight drop-shadow-md">
            {progress}%
          </span>
        </div>

        {/* Thin Elegant Progress Bar */}
        <div className="w-full max-w-xs sm:max-w-sm h-1.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner mb-4">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-emerald-500 rounded-full transition-all duration-75 ease-out shadow-[0_0_12px_rgba(56,189,248,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Rotating Status Messages */}
        <div className="h-6 flex items-center justify-center">
          <p className="text-xs font-semibold text-slate-300 animate-pulse tracking-wide font-mono">
            {getStatusText(progress)}
          </p>
        </div>

        {/* 4 Sequential Pipeline Stages (COLLECT -> DETECT -> EXPLAIN -> PREDICT -> RISK PRIORITY) */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <span className={`px-2 py-0.5 rounded transition-all ${activeStage === 0 ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm' : 'bg-slate-900/60 border border-slate-800'}`}>
            COLLECT
          </span>
          <span className="text-slate-600">→</span>
          <span className={`px-2 py-0.5 rounded transition-all ${activeStage === 1 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 shadow-sm' : 'bg-slate-900/60 border border-slate-800'}`}>
            DETECT
          </span>
          <span className="text-slate-600">→</span>
          <span className={`px-2 py-0.5 rounded transition-all ${activeStage === 2 ? 'bg-amber-950 text-amber-300 border border-amber-800 shadow-sm' : 'bg-slate-900/60 border border-slate-800'}`}>
            EXPLAIN
          </span>
          <span className="text-slate-600">→</span>
          <span className={`px-2 py-0.5 rounded transition-all ${activeStage === 3 ? 'bg-purple-950 text-purple-300 border border-purple-800 shadow-sm' : 'bg-slate-900/60 border border-slate-800'}`}>
            PREDICT
          </span>
          <span className="text-slate-600">→</span>
          <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800/90 font-black flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-red-400" /> RISK PRIORITY
          </span>
        </div>

        {/* Bottom Tagline */}
        <div className="mt-8 text-[11px] font-extrabold text-slate-500 tracking-widest uppercase flex items-center justify-center gap-2">
          <span>DETECT</span>
          <span className="text-slate-700">•</span>
          <span>EXPLAIN</span>
          <span className="text-slate-700">•</span>
          <span>PREDICT</span>
          <span className="text-slate-700">•</span>
          <span>PRIORITIZE</span>
        </div>

        {/* Government Authority Footer */}
        <div className="mt-6 flex items-center gap-1.5 text-[10px] text-slate-400 font-medium px-3 py-1 rounded bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm">
          <Shield className="w-3.5 h-3.5 text-slate-400" />
          <span>Ministry of Statistics & Programme Implementation (MoSPI)</span>
        </div>
      </div>
    </div>
  );
}
