import React, { useEffect, useState } from 'react';
import { fetchPotentialOverlaps } from '../services/api';
import { MapPin, AlertTriangle, ChevronRight, Sliders, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GeoIntelligence() {
  const [overlaps, setOverlaps] = useState([]);
  const [radius, setRadius] = useState(5000); // meters
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchPotentialOverlaps(radius);
        setOverlaps(data);
      } catch (err) {
        console.error('Error loading potential overlaps:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [radius]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-5 h-5 text-slate-800" />
            Geo-Evidence & Duplicate Overlap Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Proximity scanning and semantic text analysis identifying potentially overlapping public works
          </p>
        </div>
      </div>

      {/* Proximity Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 font-semibold text-slate-700">
          <Sliders className="w-4 h-4 text-slate-500" />
          <span>Proximity Scanning Distance Radius:</span>
        </div>

        <div className="flex items-center gap-2">
          {[500, 1000, 2000, 5000].map(dist => (
            <button
              key={dist}
              onClick={() => setRadius(dist)}
              className={`px-3 py-1.5 rounded text-xs font-bold transition ${
                radius === dist
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {dist >= 1000 ? `${dist / 1000} km` : `${dist} m`}
            </button>
          ))}
        </div>
      </div>

      {/* Flagged Overlap Cases Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            POTENTIALLY OVERLAPPING WORKS DETECTED ({overlaps.length})
          </h2>
          <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded font-semibold border border-amber-200">
            Action: Verification Required
          </span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-500 text-xs animate-pulse">Scanning spatial proximity & descriptions...</div>
        ) : (
          <div className="space-y-4">
            {overlaps.map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
                {/* Status Bar */}
                <div className="flex flex-wrap items-center justify-between bg-amber-50 border border-amber-200 p-3 rounded-md text-xs">
                  <div className="flex items-center gap-2 text-amber-900 font-bold">
                    <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>{item.status_note}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-semibold text-amber-900">
                    <span>Distance: <b>{item.distance_meters} metres</b></span>
                    <span>Similarity Score: <b>{item.similarity_score}%</b></span>
                  </div>
                </div>

                {/* Side-by-Side Project Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Project A */}
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="font-extrabold text-slate-900">{item.project_a.project_id} (Project A)</span>
                      <span className="text-[10px] font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                        ₹{item.project_a.estimated_cost} Lakh
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.project_a.project_name}</h4>
                    <p className="text-[11px] text-slate-600 leading-snug">{item.project_a.description}</p>
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px] font-medium text-slate-500">
                      <span>District: {item.project_a.district}</span>
                      <span>Phys Progress: {item.project_a.physical_progress}%</span>
                    </div>
                    <button
                      onClick={() => navigate(`/projects/${item.project_a.project_id}`)}
                      className="w-full bg-slate-900 text-white text-[11px] font-semibold py-1.5 rounded hover:bg-slate-800 text-center block mt-2"
                    >
                      View Intelligence for Project A →
                    </button>
                  </div>

                  {/* Project B */}
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="font-extrabold text-slate-900">{item.project_b.project_id} (Project B)</span>
                      <span className="text-[10px] font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                        ₹{item.project_b.estimated_cost} Lakh
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.project_b.project_name}</h4>
                    <p className="text-[11px] text-slate-600 leading-snug">{item.project_b.project_name}</p>
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px] font-medium text-slate-500">
                      <span>District: {item.project_b.district}</span>
                      <span>Phys Progress: {item.project_b.physical_progress}%</span>
                    </div>
                    <button
                      onClick={() => navigate(`/projects/${item.project_b.project_id}`)}
                      className="w-full bg-slate-900 text-white text-[11px] font-semibold py-1.5 rounded hover:bg-slate-800 text-center block mt-2"
                    >
                      View Intelligence for Project B →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
