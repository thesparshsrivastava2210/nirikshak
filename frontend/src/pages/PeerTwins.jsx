import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchPeerTwins, fetchProjects } from '../services/api';
import { GitCompare, CheckCircle2, AlertTriangle, ArrowRight, Layers } from 'lucide-react';

export default function PeerTwins() {
  const [searchParams] = useSearchParams();
  const projectParam = searchParams.get('project') || 'P1045';

  const [peerData, setPeerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allProjects, setAllProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(projectParam);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [pTwins, pList] = await Promise.all([
          fetchPeerTwins(selectedProjectId),
          fetchProjects()
        ]);
        setPeerData(pTwins);
        setAllProjects(pList);
      } catch (err) {
        console.error('Error fetching peer twin intelligence:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedProjectId]);

  if (loading || !peerData) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium animate-pulse">
        Calculating Peer Twin Similarity Matrices...
      </div>
    );
  }

  const { target_project, peer_twins, benchmarks } = peerData;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-slate-800" />
            Peer-Twin Intelligence Engine
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Multi-feature similarity scoring algorithm comparing target project against comparable historical works
          </p>
        </div>

        {/* Target Project Dropdown Switcher */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-600 uppercase">Select Target:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-white border border-slate-300 rounded-md px-3 py-1.5 font-semibold text-slate-900 focus:outline-none shadow-sm"
          >
            {allProjects.map(p => (
              <option key={p.id} value={p.project_id}>
                {p.project_id} - {p.project_name.substring(0, 30)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Project Header Card */}
      <div className="bg-slate-900 text-white rounded-lg p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject Project Under Analysis</span>
          <h2 className="text-lg font-bold text-white mt-0.5">{target_project.project_id} — {target_project.project_name}</h2>
          <p className="text-xs text-slate-400 mt-1">{target_project.district} • Cost: ₹{target_project.estimated_cost} Lakh • Progress: {target_project.physical_progress}%</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-md text-right min-w-[200px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Peer Benchmark Variance</span>
          <span className="text-xl font-extrabold text-amber-400">
            {benchmarks.cost_variance_pct > 0 ? `+${benchmarks.cost_variance_pct}%` : `${benchmarks.cost_variance_pct}%`}
          </span>
          <span className="text-[10px] text-slate-300 block font-medium">vs Peer Median Cost</span>
        </div>
      </div>

      {/* Benchmark Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Peer Median Cost</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">₹{benchmarks.peer_median_cost} Lakh</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Calculated across {peer_twins.length} twin works</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Peer Average Progress</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{benchmarks.peer_avg_progress}%</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Historical physical baseline</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Peer Average Finance</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{benchmarks.peer_avg_finance}%</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Historical financial baseline</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Current Project Cost</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">₹{target_project.estimated_cost} Lakh</h3>
          <p className="text-[10px] text-amber-700 font-semibold mt-0.5">{benchmarks.status_summary}</p>
        </div>
      </div>

      {/* Callout Notice */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-xs text-amber-900 font-semibold flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
        <span>
          <b>Peer Twin Insight:</b> {benchmarks.status_summary} Physical progress ({target_project.physical_progress}%) lags peer average ({benchmarks.peer_avg_progress}%) by {roundDelta(benchmarks.peer_avg_progress - target_project.physical_progress)} percentage points.
        </span>
      </div>

      {/* Peer Twin Comparison Table */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            TOP COMPARABLE PEER TWINS ({peer_twins.length})
          </h2>
          <span className="text-xs font-semibold text-slate-500">Feature Weights: Type 35% | Cost 25% | Geo 20% | Scale 20%</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                <th className="py-2.5 px-3">Project ID</th>
                <th className="py-2.5 px-3">Project Name</th>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">Sanction Cost</th>
                <th className="py-2.5 px-3">Physical %</th>
                <th className="py-2.5 px-3">Financial %</th>
                <th className="py-2.5 px-3">Similarity Score</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {/* Highlight target project row */}
              <tr className="bg-slate-900 text-white font-bold">
                <td className="py-3 px-3 text-emerald-400">{target_project.project_id} (Target)</td>
                <td className="py-3 px-3 text-white">{target_project.project_name}</td>
                <td className="py-3 px-3 text-slate-300">{target_project.district}</td>
                <td className="py-3 px-3 text-white">₹{target_project.estimated_cost}L</td>
                <td className="py-3 px-3 text-amber-300">{target_project.physical_progress}%</td>
                <td className="py-3 px-3 text-slate-300">{target_project.financial_progress}%</td>
                <td className="py-3 px-3 text-emerald-400">100% (Subject)</td>
                <td className="py-3 px-3 text-right text-slate-400 text-[10px]">Active Target</td>
              </tr>

              {/* Peer Twin rows */}
              {peer_twins.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 font-bold text-slate-900">{p.project_id}</td>
                  <td className="py-3 px-3 font-medium text-slate-800">{p.project_name}</td>
                  <td className="py-3 px-3 text-slate-600">{p.district}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">₹{p.estimated_cost}L</td>
                  <td className="py-3 px-3 font-medium text-slate-700">{p.physical_progress}%</td>
                  <td className="py-3 px-3 font-medium text-slate-700">{p.financial_progress}%</td>
                  <td className="py-3 px-3 font-extrabold text-emerald-700">
                    <span className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      {p.similarity_score}% Similar
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => navigate(`/projects/${p.project_id}`)}
                      className="text-slate-800 hover:text-slate-950 font-bold hover:underline"
                    >
                      Compare →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function roundDelta(val) {
  return Math.round(val * 10) / 10;
}
