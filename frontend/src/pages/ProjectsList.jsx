import React, { useEffect, useState } from 'react';
import { fetchProjects } from '../services/api';
import { Search, Filter, ArrowUpDown, ChevronRight, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');

  const [sortField, setSortField] = useState('risk_score');
  const [sortOrder, setSortOrder] = useState('desc');

  const navigate = useNavigate();

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
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (typeof aVal === 'string') {
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">MPLADS Projects Database</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Searchable project records, financial utilization, and physical progress metrics
          </p>
        </div>
        <button
          onClick={() => {
            if (!sortedProjects.length) return;
            const headers = ["Project ID", "Project Name", "Project Type", "State", "District", "Sanction (Lakh)", "Expenditure (Lakh)", "Physical Progress %", "Financial Progress %", "Risk Score", "Risk Level", "Agency Name"];
            const rows = sortedProjects.map(p => [
              `"${p.project_id}"`,
              `"${p.project_name.replace(/"/g, '""')}"`,
              `"${p.project_type}"`,
              `"${p.state}"`,
              `"${p.district}"`,
              p.sanction_amount,
              p.expenditure,
              p.physical_progress,
              p.financial_progress,
              p.risk_score,
              `"${p.risk_level}"`,
              `"${p.agency_name.replace(/"/g, '""')}"`
            ]);
            const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `NIRISHAK_Projects_Export_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold px-3 py-2 rounded flex items-center gap-1.5 transition shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV Data
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Project ID, Name, District, Agency..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-md pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:border-slate-500 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
          >
            <option value="All">All States</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Bihar">Bihar</option>
          </select>

          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
          >
            <option value="All">All Districts</option>
            <option value="Varanasi">Varanasi</option>
            <option value="Lucknow">Lucknow</option>
            <option value="Bengaluru Urban">Bengaluru Urban</option>
            <option value="Patna">Patna</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none"
          >
            <option value="All">All Risk Scores</option>
            <option value="CRITICAL">Critical Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Displaying {sortedProjects.length} Projects
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Click column headers to sort</span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-500 text-xs animate-pulse">Loading database records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3 cursor-pointer select-none" onClick={() => handleSort('project_id')}>
                    <span className="flex items-center gap-1">ID <ArrowUpDown className="w-3 h-3 text-slate-400" /></span>
                  </th>
                  <th className="py-2.5 px-3 cursor-pointer select-none" onClick={() => handleSort('project_name')}>
                    <span className="flex items-center gap-1">Project Name & Type <ArrowUpDown className="w-3 h-3 text-slate-400" /></span>
                  </th>
                  <th className="py-2.5 px-3">State & District</th>
                  <th className="py-2.5 px-3 cursor-pointer select-none" onClick={() => handleSort('sanction_amount')}>
                    <span className="flex items-center gap-1">Sanction <ArrowUpDown className="w-3 h-3 text-slate-400" /></span>
                  </th>
                  <th className="py-2.5 px-3 cursor-pointer select-none" onClick={() => handleSort('expenditure')}>
                    <span className="flex items-center gap-1">Expenditure <ArrowUpDown className="w-3 h-3 text-slate-400" /></span>
                  </th>
                  <th className="py-2.5 px-3">Phys %</th>
                  <th className="py-2.5 px-3">Fin %</th>
                  <th className="py-2.5 px-3 cursor-pointer select-none" onClick={() => handleSort('risk_score')}>
                    <span className="flex items-center gap-1">Risk Score <ArrowUpDown className="w-3 h-3 text-slate-400" /></span>
                  </th>
                  <th className="py-2.5 px-3">Agency</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {sortedProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-bold text-slate-900">{p.project_id}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{p.project_name}</div>
                      <div className="text-[10px] text-slate-500">{p.project_type}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">{p.district}, {p.state}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">₹{p.sanction_amount}L</td>
                    <td className="py-3 px-3 font-bold text-slate-900">₹{p.expenditure}L</td>
                    <td className="py-3 px-3 font-medium text-slate-700">{p.physical_progress}%</td>
                    <td className="py-3 px-3 font-medium text-slate-700">{p.financial_progress}%</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        p.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                        p.risk_level === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        p.risk_level === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {p.risk_score} / 100 ({p.risk_level})
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-[11px] truncate max-w-[140px]">{p.agency_name}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigate(`/projects/${p.project_id}`)}
                        className="bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded hover:bg-slate-800 inline-flex items-center gap-0.5"
                      >
                        Intelligence <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
