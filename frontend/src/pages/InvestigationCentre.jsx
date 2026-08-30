import React, { useEffect, useState } from 'react';
import { 
  fetchInvestigations, 
  fetchInvestigationBrief, 
  createInspectionCase, 
  updateCaseStatus, 
  fetchProjects 
} from '../services/api';
import { 
  ShieldAlert, 
  FileText, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  X, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function InvestigationCentre() {
  const [investigations, setInvestigations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [briefModalData, setBriefModalData] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Case Form state
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [priority, setPriority] = useState(1);
  const [reason, setReason] = useState('');
  const [recommendedAction, setRecommendedAction] = useState('Field Verification & Measurement Book Audit');
  const [assignedTo, setAssignedTo] = useState('Shri Rajesh Kumar (District Nodal Officer)');
  const [assignedRole, setAssignedRole] = useState('District Authority Cell');
  const [dueDate, setDueDate] = useState('2024-11-30');
  const [notes, setNotes] = useState('');

  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const [invData, pData] = await Promise.all([
        fetchInvestigations(),
        fetchProjects()
      ]);
      setInvestigations(invData);
      setProjects(pData);
      if (pData.length > 0) setSelectedProjectId(pData[0].id);
    } catch (err) {
      console.error('Error loading investigation centre:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleViewBrief = async (invId) => {
    try {
      const brief = await fetchInvestigationBrief(invId);
      setBriefModalData(brief);
    } catch (err) {
      console.error('Error fetching brief:', err);
    }
  };

  const handleStatusChange = async (invId, newStatus) => {
    try {
      await updateCaseStatus(invId, newStatus);
      loadData();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleCreateCaseSubmit = async (e) => {
    e.preventDefault();
    try {
      await createInspectionCase({
        project_id: parseInt(selectedProjectId),
        priority: parseInt(priority),
        reason: reason || 'Risk Intelligence Engine Flag',
        recommended_action: recommendedAction,
        assigned_to: assignedTo,
        assigned_role: assignedRole,
        due_date: dueDate,
        notes: notes
      });
      setShowCreateModal(false);
      loadData();
    } catch (err) {
      console.error('Error creating inspection case:', err);
    }
  };

  const openCases = investigations.filter(i => i.status === 'Open').length;
  const assignedCases = investigations.filter(i => i.status === 'Assigned').length;
  const reviewCases = investigations.filter(i => i.status === 'In Review').length;
  const verifiedCases = investigations.filter(i => i.status === 'Verified' || i.status === 'Closed').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-slate-900" />
            Investigation Centre
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Actionable case management, field inspection briefs, and lifecycle tracking for authorities
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-slate-800 transition flex items-center gap-1.5 shadow-sm"
        >
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          Create Inspection Case
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Total Risk Flags</span>
          <h3 className="text-xl font-extrabold text-slate-900 mt-1">{investigations.length}</h3>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-red-700 uppercase">Open Cases</span>
          <h3 className="text-xl font-extrabold text-red-900 mt-1">{openCases}</h3>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-amber-700 uppercase">Assigned</span>
          <h3 className="text-xl font-extrabold text-amber-900 mt-1">{assignedCases}</h3>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-blue-700 uppercase">In Review</span>
          <h3 className="text-xl font-extrabold text-blue-900 mt-1">{reviewCases}</h3>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm col-span-2 md:col-span-1">
          <span className="text-[10px] font-bold text-emerald-700 uppercase">Verified / Closed</span>
          <h3 className="text-xl font-extrabold text-emerald-900 mt-1">{verifiedCases}</h3>
        </div>
      </div>

      {/* Main Investigation Queue Table */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            AUTHORITY INSPECTION CASES ({investigations.length})
          </h2>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-500 text-xs animate-pulse">Loading inspection queue...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Case ID & Project</th>
                  <th className="py-2.5 px-3">Risk</th>
                  <th className="py-2.5 px-3">Exposure</th>
                  <th className="py-2.5 px-3">Primary Reason</th>
                  <th className="py-2.5 px-3">Assigned Authority</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {investigations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        inv.priority === 1 ? 'bg-red-100 text-red-900 font-extrabold' :
                        inv.priority === 2 ? 'bg-orange-100 text-orange-900' : 'bg-amber-100 text-amber-900'
                      }`}>
                        Priority {inv.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <div className="font-mono text-[11px] text-slate-500">{inv.case_id}</div>
                      <div>{inv.project_name}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{inv.district}</div>
                    </td>
                    <td className="py-3 px-3 font-bold text-red-700">{inv.risk_score} / 100</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">₹{inv.sanction_amount}L</td>
                    <td className="py-3 px-3 text-slate-700 text-[11px] max-w-xs">{inv.reason}</td>
                    <td className="py-3 px-3 text-slate-700 font-medium">{inv.assigned_to || 'Unassigned'}</td>
                    <td className="py-3 px-3">
                      <select
                        value={inv.status}
                        onChange={(e) => handleStatusChange(inv.id, e.target.value)}
                        className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-[11px] font-semibold text-slate-800 focus:outline-none cursor-pointer"
                      >
                        <option value="Open">Open</option>
                        <option value="Assigned">Assigned</option>
                        <option value="In Review">In Review</option>
                        <option value="Verified">Verified</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button
                        onClick={() => handleViewBrief(inv.id)}
                        className="bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded hover:bg-slate-800"
                      >
                        View Brief
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AI-ASSISTED INVESTIGATION BRIEF MODAL */}
      {briefModalData && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 my-8 relative">
            <button
              onClick={() => setBriefModalData(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-200 pb-3">
              <span className="bg-red-100 text-red-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded border border-red-200 uppercase">
                OFFICIAL INSPECTION BRIEF
              </span>
              <h3 className="font-extrabold text-slate-900 text-base mt-1">{briefModalData.brief_title}</h3>
              <p className="text-xs text-slate-500">{briefModalData.project_details.district}, {briefModalData.project_details.state} • Sanction: {briefModalData.project_details.sanction_amount}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Executive Rationale:</span>
                <p className="text-xs leading-relaxed">{briefModalData.executive_summary}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px]">Primary Risk Signals Flagged:</h4>
                <div className="space-y-1 mt-1">
                  {briefModalData.primary_signals.map((sig, i) => (
                    <p key={i} className="bg-red-50 text-red-900 p-2 rounded border border-red-200 text-[11px]">
                      • {sig}
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px]">Evidence Audit Trail:</h4>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                    <b className="block text-[10px] text-slate-500 uppercase">Financial Audit</b>
                    <span>{briefModalData.evidence.financial}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                    <b className="block text-[10px] text-slate-500 uppercase">Physical Progress Audit</b>
                    <span>{briefModalData.evidence.progress}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px]">Recommended Inspection Checklist:</h4>
                <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1 mt-1">
                  {briefModalData.recommended_checklist.map((chk, i) => (
                    <p key={i} className="text-slate-800 font-medium text-[11px]">{chk}</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setBriefModalData(null)}
                className="bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded hover:bg-slate-800"
              >
                Close Brief
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE INSPECTION CASE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateCaseSubmit} className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 relative">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-200 pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase">Create New Inspection Case</h3>
              <p className="text-xs text-slate-500">Assign project to district nodal authority for field verification</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-medium text-slate-900"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.project_id} - {p.project_name} ({p.district})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-semibold text-slate-900"
                  >
                    <option value={1}>Priority 1 (Critical)</option>
                    <option value={2}>Priority 2 (High)</option>
                    <option value={3}>Priority 3 (Medium)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Primary Rationale / Reason</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for inspection..."
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Nodal Authority</label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="bg-slate-100 text-slate-700 font-semibold text-xs px-4 py-2 rounded hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded hover:bg-slate-800"
              >
                Submit Inspection Case
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
