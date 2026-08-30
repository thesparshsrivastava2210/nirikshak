"use client";

import dynamic from "next/dynamic";

// Leaflet requires browser APIs (window, document) — cannot SSR
const RiskMap = dynamic(() => import("@/components/common/RiskMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[360px] rounded-lg border border-slate-700/80 bg-slate-100 flex items-center justify-center text-xs text-slate-500 font-medium animate-pulse">
      Loading Risk Map...
    </div>
  ),
});

export default RiskMap;
