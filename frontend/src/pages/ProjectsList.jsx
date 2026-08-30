import React, { useEffect, useState } from 'react';
import { fetchProjects } from '../services/api';
import { Search, Filter, ArrowUpDown, ChevronRight, Download } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search') || '';

  const [search, setSearch] = useState(searchFromUrl);
  const [stateFilter, setStateFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');

  const [sortField, setSortField] = useState('risk_score');
  const [sortOrder, setSortOrder] = useState('desc');

  const navigate = useNavigate();

  useEffect(() => {
    if (searchFromUrl !== search) {
      setSearch(searchFromUrl);
    }
  }, [searchFromUrl]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchProjects({
          state: stateFilter,
          district: districtFilter,
          risk_level: riskFilter,
          search: search
        });
        setProjects(data);
      } catch (err) {
        console.error('Error loading projects list:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [search, stateFilter, districtFilter, riskFilter]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedProjects = [...projects].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">MPLADS Projects Database</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Centralized registry of sanctioned works across jurisdictions with multi-factor risk scores
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Registry</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Project ID, Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-md pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-500 font-medium placeholder-slate-400"
            />
          </div>

          {/* State Filter */}
          <div>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-500 font-medium cursor-pointer"
            >
              <option value="All">All States</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Bihar">Bihar</option>
            </select>
          </div>

          {/* District Filter */}
          <div>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-500 font-medium cursor-pointer"
            >
              <option value="All">All Districts</option>
              <option value="Varanasi">Varanasi</option>
              <option value="Lucknow">Lucknow</option>
              <option value="Patna">Patna</option>
              <option value="Bengaluru Urban">Bengaluru Urban</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-500 font-medium cursor-pointer"
            >
              <option value="All">All Risk Levels</option>
              <option value="CRITICAL">Critical Risk (80-100)</option>
              <option value="HIGH">High Risk (60-79)</option>
              <option value="MEDIUM">Medium Risk (30-59)</option>
              <option value="LOW">Low Risk (&lt;30)</option>
            </select>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-2 border-t border-slate-100">
          <span>Showing <strong className="text-slate-900">{sortedProjects.length}</strong> sanctioned works</span>
          {(search || stateFilter !== 'All' || districtFilter !== 'All' || riskFilter !== 'All') && (
            <button
              onClick={() => { setSearch(''); setStateFilter('All'); setDistrictFilter('All'); setRiskFilter('All'); }}
              className="text-slate-600 hover:text-slate-900 underline text-xs font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Projects Table Container */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs font-medium animate-pulse">
            Loading MPLADS projects registry...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200 select-none">
                  <th onClick={() => handleSort('project_id')} className="py-3 px-4 cursor-pointer hover:bg-slate-200">
                    <div className="flex items-center gap-1">
                      <span>Project ID</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('project_name')} className="py-3 px-4 cursor-pointer hover:bg-slate-200">
                    <div className="flex items-center gap-1">
                      <span>Project Name</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('district')} className="py-3 px-4 cursor-pointer hover:bg-slate-200">
                    <div className="flex items-center gap-1">
                      <span>Location</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('sanction_amount')} className="py-3 px-4 cursor-pointer hover:bg-slate-200 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span>Sanction Cost</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('physical_progress')} className="py-3 px-4 cursor-pointer hover:bg-slate-200 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span>Physical %</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('financial_progress')} className="py-3 px-4 cursor-pointer hover:bg-slate-200 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span>Financial %</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('risk_score')} className="py-3 px-4 cursor-pointer hover:bg-slate-200 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span>Risk Score</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 text-xs">
                {sortedProjects.map((p) => {
                  const isCritical = p.risk_level === 'CRITICAL';
                  const isHigh = p.risk_level === 'HIGH';
                  const isMedium = p.risk_level === 'MEDIUM';

                  return (
                    <tr
                      key={p.id || p.project_id}
                      onClick={() => navigate(`/projects/${p.project_id}`)}
                      className="hover:bg-slate-50 transition cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                        {p.project_id}
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs">
                        <p className="truncate text-slate-900 group-hover:text-emerald-700">{p.project_name}</p>
                        <p className="text-[10px] text-slate-500 font-normal truncate mt-0.5">{p.agency_name}</p>
                      </td>

                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {p.district}, {p.state}
                        <span className="block text-[10px] text-slate-400">{p.village}</span>
                      </td>

                      <td className="py-3 px-4 text-slate-900 font-bold text-right">
                        ₹{p.sanction_amount} Lakh
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-semibold text-slate-800">{p.physical_progress}%</span>
                          <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden hidden sm:block">
                            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${p.physical_progress}%` }} />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-semibold text-slate-800">{p.financial_progress}%</span>
                          <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden hidden sm:block">
                            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${p.financial_progress}%` }} />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          isCritical ? 'bg-red-100 text-red-700 border border-red-200' :
                          isHigh ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          isMedium ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                          'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {p.risk_score} / 100
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/projects/${p.project_id}`);
                          }}
                          className="inline-flex items-center gap-1 text-slate-900 hover:text-slate-700 font-bold text-xs"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {sortedProjects.length === 0 && (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-500 text-xs font-medium">
                      No project found matching the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
