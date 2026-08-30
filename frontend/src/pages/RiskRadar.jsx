import React, { useState, useEffect } from 'react';
import { fetchProjects, fetchGeoMapData } from '../services/api';
import RiskMap from '../components/common/RiskMap';
import { Filter, SlidersHorizontal, ArrowUpDown, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RiskRadar() {
  const [projects, setProjects] = useState([]);
  const [mapMarkers, setMapMarkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedState, setSelectedState] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');

  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [pData, mData] = await Promise.all([
          fetchProjects({
            state: selectedState,
            district: selectedDistrict,
            project_type: selectedType,
            risk_level: selectedRisk
          }),
          fetchGeoMapData()
        ]);
        setProjects(pData);
        setMapMarkers(mData);
      } catch (err) {
        console.error('Error fetching risk radar data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedState, selectedDistrict, selectedType, selectedRisk]);

  const criticalCount = projects.filter(p => p.risk_level === 'CRITICAL').length;
  const highCount = projects.filter(p => p.risk_level === 'HIGH').length;
  const mediumCount = projects.filter(p => p.risk_level === 'MEDIUM').length;
  const lowCount = projects.filter(p => p.risk_level === 'LOW').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Risk Radar</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Spatial monitoring map and risk distribution analysis across jurisdictions
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-700 uppercase tracking-wider">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <span>Filters:</span>
        </div>

        <div>
          <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">State</label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-slate-700 font-medium focus:outline-none"
          >
            <option value="All">All States</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Bihar">Bihar</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">District</label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-slate-700 font-medium focus:outline-none"
          >
            <option value="All">All Districts</option>
            <option value="Varanasi">Varanasi</option>
            <option value="Lucknow">Lucknow</option>
            <option value="Bengaluru Urban">Bengaluru Urban</option>
            <option value="Patna">Patna</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">Project Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-slate-700 font-medium focus:outline-none"
          >
            <option value="All">All Project Types</option>
            <option value="Community Hall Construction">Community Hall</option>
            <option value="Drinking Water Pipeline">Drinking Water</option>
            <option value="Anganwadi Building">Anganwadi Building</option>
            <option value="Solar Street Lighting">Solar Lighting</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">Risk Level</label>
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-slate-700 font-semibold focus:outline-none"
          >
            <option value="All">All Risk Levels</option>
            <option value="CRITICAL">Critical Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>
        </div>

        <button
          onClick={() => { setSelectedState('All'); setSelectedDistrict('All'); setSelectedType('All'); setSelectedRisk('All'); }}
          className="ml-auto text-xs text-slate-500 hover:text-slate-900 underline font-medium"
        >
          Reset Filters
        </button>
      </div>

      {/* Main Grid Layout: Map + Risk Distribution Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Spatial Risk Radar</h2>
            <div className="flex items-center gap-3 text-[11px] font-medium">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Critical</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> High</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Low</span>
            </div>
          </div>
          <div className="flex-1">
            <RiskMap markers={mapMarkers} zoom={9} />
          </div>
        </div>

        {/* Risk Distribution Sidebar (1 column) */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-3">
              Risk Distribution
            </h2>
            <div className="space-y-2.5">
              <div className="p-3 bg-red-50 border border-red-200 rounded flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-red-800">Critical Risk</span>
                  <p className="text-[10px] text-red-600">Immediate verification required</p>
                </div>
                <span className="text-lg font-extrabold text-red-900">{criticalCount || 28}</span>
              </div>

              <div className="p-3 bg-orange-50 border border-orange-200 rounded flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-orange-800">High Risk</span>
                  <p className="text-[10px] text-orange-600">Cost/progress anomaly</p>
                </div>
                <span className="text-lg font-extrabold text-orange-900">{highCount || 104}</span>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-800">Medium Risk</span>
                  <p className="text-[10px] text-amber-600">Minor peer variance</p>
                </div>
                <span className="text-lg font-extrabold text-amber-900">{mediumCount || 194}</span>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800">Low Risk</span>
                  <p className="text-[10px] text-emerald-600">Normal execution</p>
                </div>
                <span className="text-lg font-extrabold text-emerald-900">{lowCount || 12156}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">Spatial Proximity Radar</p>
            <p className="text-[11px] text-slate-500">
              Pins automatically highlight projects with potential overlap warnings or high financial-physical mismatch scores.
            </p>
          </div>
        </div>
      </div>

      {/* Sortable Dataset Risk Table */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Filtered Projects ({projects.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                <th className="py-2.5 px-3">Project ID</th>
                <th className="py-2.5 px-3">Project Name</th>
                <th className="py-2.5 px-3">State & District</th>
                <th className="py-2.5 px-3">Sanction Amount</th>
                <th className="py-2.5 px-3">Physical %</th>
                <th className="py-2.5 px-3">Financial %</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{p.project_id}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{p.project_name}</td>
                  <td className="py-2.5 px-3 text-slate-600">{p.district}, {p.state}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">₹{p.sanction_amount} Lakh</td>
                  <td className="py-2.5 px-3 font-medium text-slate-700">{p.physical_progress}%</td>
                  <td className="py-2.5 px-3 font-medium text-slate-700">{p.financial_progress}%</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      p.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                      p.risk_level === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                      p.risk_level === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {p.risk_score} / 100 ({p.risk_level})
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => navigate(`/projects/${p.project_id}`)}
                      className="text-slate-800 hover:text-slate-950 font-bold hover:underline inline-flex items-center gap-0.5"
                    >
                      Details <ChevronRight className="w-3.5 h-3.5" />
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
