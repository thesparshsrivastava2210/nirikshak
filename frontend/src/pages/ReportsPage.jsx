import React, { useEffect, useState, useRef } from 'react';
import { fetchReportSummary } from '../services/api';
import { FileText, Download, Printer, Filter, CheckCircle2, ShieldAlert } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [stateFilter, setStateFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('Varanasi');
  const [riskFilter, setRiskFilter] = useState('All');

  const reportRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchReportSummary(stateFilter, districtFilter, riskFilter);
        setReport(data);
      } catch (err) {
        console.error('Error fetching report summary:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [stateFilter, districtFilter, riskFilter]);

  const handleDownloadPDF = () => {
    if (!reportRef.current) return;
    html2canvas(reportRef.current, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`NIRISHAK_Risk_Report_${districtFilter}_2024.pdf`);
    });
  };

  if (loading || !report) {
    return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Generating Governance Risk Report...</div>;
  }

  const { metrics, critical_projects, high_risk_projects } = report;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-800" />
            Executive Risk Reports & PDF Export
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Generate printable public-sector audit reports and executive risk summaries
          </p>
        </div>

        <button
          onClick={handleDownloadPDF}
          className="bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-slate-800 transition flex items-center gap-2 shadow-sm"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          Download Official PDF Report
        </button>
      </div>

      {/* Report Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-700 uppercase">
          <Filter className="w-4 h-4 text-slate-500" />
          <span>Report Scope:</span>
        </div>

        <div>
          <label className="text-[10px] font-semibold text-slate-400 block">State</label>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-medium focus:outline-none"
          >
            <option value="All">All India</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Bihar">Bihar</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-semibold text-slate-400 block">District</label>
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-medium focus:outline-none"
          >
            <option value="All">All Districts</option>
            <option value="Varanasi">Varanasi</option>
            <option value="Lucknow">Lucknow</option>
            <option value="Bengaluru Urban">Bengaluru Urban</option>
            <option value="Patna">Patna</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-semibold text-slate-400 block">Risk Filter</label>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-bold focus:outline-none"
          >
            <option value="All">All Risk Levels</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Risk Only</option>
          </select>
        </div>
      </div>

      {/* Printable Report Canvas Area */}
      <div ref={reportRef} className="bg-white rounded-lg border border-slate-300 p-8 shadow-sm space-y-6">
        {/* Report Official Banner */}
        <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
          <div>
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">GOVERNMENT OF INDIA • MPLADS MONITORING PORTAL</span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">{report.report_title}</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{report.authority_scope} • Date: {report.generated_date}</p>
          </div>
          <div className="text-right font-mono text-[10px] text-slate-500">
            <div>DOC REF: NIR-RPT-2024-089</div>
            <div>STATUS: OFFICIAL AUDIT</div>
          </div>
        </div>

        {/* Executive Summary Rationale */}
        <div className="bg-slate-50 p-4 rounded border border-slate-200 text-xs space-y-1">
          <h4 className="font-bold text-slate-900 uppercase text-[11px]">Executive Summary</h4>
          <p className="text-slate-700 leading-relaxed">{report.executive_summary}</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-100 rounded border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Total Sanctions</span>
            <p className="text-lg font-black text-slate-900 mt-0.5">{metrics.total_projects} Works</p>
          </div>
          <div className="p-3 bg-slate-100 rounded border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Total Value</span>
            <p className="text-lg font-black text-slate-900 mt-0.5">₹{metrics.total_sanctioned_cr} Cr</p>
          </div>
          <div className="p-3 bg-slate-100 rounded border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Avg Physical Progress</span>
            <p className="text-lg font-black text-slate-900 mt-0.5">{metrics.avg_physical_progress}%</p>
          </div>
          <div className="p-3 bg-red-50 rounded border border-red-200">
            <span className="text-[10px] font-bold text-red-700 uppercase">Critical Flags</span>
            <p className="text-lg font-black text-red-900 mt-0.5">{metrics.critical_risk_count} Works</p>
          </div>
        </div>

        {/* Critical Projects Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Critical Risk Projects Requiring Field Inspection ({critical_projects.length})
          </h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold border-b border-slate-300">
                <th className="py-2 px-2">Project ID</th>
                <th className="py-2 px-2">Name</th>
                <th className="py-2 px-2">District</th>
                <th className="py-2 px-2">Sanction</th>
                <th className="py-2 px-2">Expenditure</th>
                <th className="py-2 px-2">Phys %</th>
                <th className="py-2 px-2">Fin %</th>
                <th className="py-2 px-2">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs font-medium">
              {critical_projects.map(p => (
                <tr key={p.project_id}>
                  <td className="py-2 px-2 font-bold text-slate-900">{p.project_id}</td>
                  <td className="py-2 px-2 text-slate-800">{p.project_name}</td>
                  <td className="py-2 px-2 text-slate-600">{p.district}</td>
                  <td className="py-2 px-2 text-slate-900 font-bold">{p.sanction_amount}</td>
                  <td className="py-2 px-2 text-slate-900 font-bold">{p.expenditure}</td>
                  <td className="py-2 px-2">{p.physical_progress}</td>
                  <td className="py-2 px-2">{p.financial_progress}</td>
                  <td className="py-2 px-2 font-extrabold text-red-700">{p.risk_score} / 100</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Audit Stamp */}
        <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-mono">
          <span>Generated by NIRISHAK Intelligence Core</span>
          <span>Authenticity Verified • Ministry of Statistics & Programme Implementation (MoSPI)</span>
        </div>
      </div>
    </div>
  );
}
