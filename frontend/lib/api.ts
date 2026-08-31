/* eslint-disable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// API service — TypeScript port of services/api.js
// Keeps all fallback data and logic intact for offline resilience.
// ---------------------------------------------------------------------------

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1") &&
  window.location.port === "3000"
    ? "http://127.0.0.1:8000/api"
    : "/api");

// ── Shared fallback dataset ──────────────────────────────────────────────
export interface Project {
  id: number;
  project_id: string;
  project_name: string;
  project_type: string;
  state: string;
  district: string;
  village: string;
  sanction_amount: number;
  expenditure: number;
  physical_progress: number;
  financial_progress: number;
  estimated_cost: number;
  status: string;
  sanction_date: string;
  risk_score: number;
  risk_level: string;
  agency_name: string;
}

const FALLBACK_PROJECTS: Project[] = [
  { id: 1, project_id: "P1045", project_name: "Construction of Community Hall & Skill Center", project_type: "Community Hall Construction", state: "Uttar Pradesh", district: "Varanasi", village: "Shivpur Ward 14", sanction_amount: 68.0, expenditure: 62.4, physical_progress: 47.0, financial_progress: 91.8, estimated_cost: 68.0, status: "Under Implementation", sanction_date: "2024-03-15", risk_score: 92.0, risk_level: "CRITICAL", agency_name: "UP Public Works Department (PWD) Division II" },
  { id: 2, project_id: "P2098", project_name: "Construction of Public Community Centre Building", project_type: "Community Hall Construction", state: "Uttar Pradesh", district: "Varanasi", village: "Shivpur Ward 12", sanction_amount: 72.0, expenditure: 45.0, physical_progress: 42.0, financial_progress: 62.5, estimated_cost: 72.0, status: "Under Implementation", sanction_date: "2024-04-10", risk_score: 36.5, risk_level: "MEDIUM", agency_name: "UP Public Works Department (PWD) Division II" },
  { id: 3, project_id: "P3812", project_name: "Construction of District Trauma Care & Multi-Specialty Block", project_type: "Healthcare Infrastructure", state: "Uttar Pradesh", district: "Lucknow", village: "Chinhat Sector 4", sanction_amount: 145.0, expenditure: 138.0, physical_progress: 45.0, financial_progress: 95.2, estimated_cost: 145.0, status: "Under Implementation", sanction_date: "2024-01-20", risk_score: 88.5, risk_level: "CRITICAL", agency_name: "UP State Construction Corporation" },
  { id: 4, project_id: "P3901", project_name: "Upgradation of Government Intermediate College Science Labs", project_type: "Educational Infrastructure", state: "Uttar Pradesh", district: "Lucknow", village: "Alambagh Ward 8", sanction_amount: 42.0, expenditure: 31.5, physical_progress: 52.0, financial_progress: 75.0, estimated_cost: 42.0, status: "Under Implementation", sanction_date: "2024-02-14", risk_score: 64.2, risk_level: "HIGH", agency_name: "UP Rural Engineering Services (RES)" },
  { id: 5, project_id: "P4021", project_name: "Installation of High-Mast Solar Street Lighting System", project_type: "Solar Street Lighting System", state: "Uttar Pradesh", district: "Varanasi", village: "Sarnath", sanction_amount: 35.0, expenditure: 12.0, physical_progress: 35.0, financial_progress: 34.3, estimated_cost: 35.0, status: "Under Implementation", sanction_date: "2024-06-01", risk_score: 12.0, risk_level: "LOW", agency_name: "UP New & Renewable Energy Development Agency" },
  { id: 6, project_id: "P5190", project_name: "Construction of Rural Water Supply Pipeline & Overhead Tank", project_type: "Rural Water Supply Pipeline", state: "Karnataka", district: "Bengaluru Urban", village: "Kengeri", sanction_amount: 85.0, expenditure: 80.0, physical_progress: 88.0, financial_progress: 94.1, estimated_cost: 85.0, status: "Completed", sanction_date: "2023-11-10", risk_score: 18.0, risk_level: "LOW", agency_name: "Karnataka Urban Water Supply Board" },
  { id: 7, project_id: "P5310", project_name: "Construction of Storm Water Drain & Culvert Network", project_type: "Drainage Infrastructure", state: "Karnataka", district: "Bengaluru Urban", village: "Mahadevapura", sanction_amount: 110.0, expenditure: 102.0, physical_progress: 58.0, financial_progress: 92.7, estimated_cost: 110.0, status: "Under Implementation", sanction_date: "2024-03-01", risk_score: 84.0, risk_level: "CRITICAL", agency_name: "BBMP Infrastructure Division" },
  { id: 8, project_id: "P6104", project_name: "Construction of Flood Protection Embankment & Canal Wall", project_type: "Flood Protection Embankment", state: "Bihar", district: "Patna", village: "Phulwari Sharif", sanction_amount: 95.0, expenditure: 89.0, physical_progress: 49.0, financial_progress: 93.6, estimated_cost: 95.0, status: "Under Implementation", sanction_date: "2024-02-10", risk_score: 91.2, risk_level: "CRITICAL", agency_name: "Bihar Water Resources Department" },
];

const STOP_WORDS = new Set([
  "tell", "me", "about", "project", "projects", "work", "works", "show", "give",
  "details", "info", "information", "what", "is", "the", "for", "with", "and",
  "find", "search", "list", "please", "can", "you", "view", "check", "get", "any",
  "some", "all", "does", "have", "there"
]);

// ── Dashboard Stats ──────────────────────────────────────────────────────
export async function fetchDashboardStats() {
  try {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    if (res.ok) return await res.json();
  } catch { console.warn("Backend API unreachable, using resilient client fallback"); }
  return {
    summary: { total_works: 20, total_expenditure_cr: 9.86, total_expenditure_lakh: 986.2, avg_completion: 64.6, risk_flags: 7, critical_projects: 1, high_risk_projects: 1, medium_risk_projects: 5, low_risk_projects: 13 },
    priority_queue: [
      { rank: 1, investigation_id: 1, project_id: "P1045", project_name: "Construction of Community Hall & Skill Center", district: "Varanasi", risk_score: 92.0, risk_level: "CRITICAL", primary_signal: "Financial utilization (91.8%) far outpaces physical progress (47.0%)...", financial_exposure: "₹68.0 Lakh", recommended_action: "Field Measurement Audit & Site Inspection", status: "Open" },
      { rank: 2, investigation_id: 2, project_id: "P2098", project_name: "Construction of Public Community Centre Building", district: "Varanasi", risk_score: 36.5, risk_level: "MEDIUM", primary_signal: "Potential work duplication with P1045 (850m distance)...", financial_exposure: "₹72.0 Lakh", recommended_action: "Financial Review & Cross-Verification", status: "Assigned" },
    ],
    risk_trend: [
      { month: "May 2024", critical: 2, high: 5, medium: 8 },
      { month: "Jun 2024", critical: 2, high: 7, medium: 11 },
      { month: "Jul 2024", critical: 3, high: 9, medium: 14 },
      { month: "Aug 2024", critical: 4, high: 12, medium: 18 },
      { month: "Sep 2024", critical: 5, high: 15, medium: 22 },
      { month: "Oct 2024", critical: 6, high: 18, medium: 25 },
    ],
    detected_patterns: [
      { id: 1, text: "7 projects linked to UP PWD Division II show similar cost deviation exceeding peer baseline." },
      { id: 2, text: "4 potentially overlapping works detected in Varanasi Shivpur block within 1km radius." },
      { id: 3, text: "12 projects show financial expenditure disbursements exceeding physical progress by >20%." },
    ],
  };
}

// ── Projects ─────────────────────────────────────────────────────────────
// ── ProjectFilters type ─────────────────────────────────────────────────
export interface ProjectFilters {
  state?: string;
  district?: string;
  risk_level?: string;
  project_type?: string;
  search?: string;
}

export async function fetchProjects(filters: ProjectFilters = {}) {
  try {
    const query = new URLSearchParams();
    if (filters.state && filters.state !== "All") query.append("state", filters.state);
    if (filters.district && filters.district !== "All") query.append("district", filters.district);
    if (filters.risk_level && filters.risk_level !== "All") query.append("risk_level", filters.risk_level);
    if (filters.search) query.append("search", filters.search);
    const res = await fetch(`${API_BASE}/projects?${query.toString()}`);
    if (res.ok) return (await res.json()) as Project[];
  } catch { console.warn("Backend API unreachable, using resilient client fallback"); }

  let list = [...FALLBACK_PROJECTS];
  if (filters.state && filters.state !== "All") list = list.filter((p) => p.state === filters.state);
  if (filters.district && filters.district !== "All") list = list.filter((p) => p.district === filters.district);
  if (filters.risk_level && filters.risk_level !== "All") list = list.filter((p) => p.risk_level === filters.risk_level);
  if (filters.search) { const s = filters.search.toLowerCase(); list = list.filter((p) => p.project_name.toLowerCase().includes(s) || p.project_id.toLowerCase().includes(s)); }
  return list;
}

// ── Project Intelligence ─────────────────────────────────────────────────
export async function fetchProjectIntelligence(projectId: string) {
  try {
    const res = await fetch(`${API_BASE}/projects/${projectId}`);
    if (res.ok) return await res.json();
  } catch { console.warn("Backend API unreachable, using resilient client fallback"); }

  const proj = FALLBACK_PROJECTS.find((p) => p.project_id === projectId) || FALLBACK_PROJECTS[0];
  return {
    project: proj,
    risk_summary: { total_score: proj.risk_score, risk_level: proj.risk_level, breakdown: { financial_score: 22.4, cost_score: 18.0, delay_score: 17.0, peer_score: 13.0, duplicate_score: 10.0, agency_score: 11.6 } },
    ai_insight: "Financial utilization is significantly ahead of reported physical ground progress. Physical verification is strongly recommended.",
    risk_factors: [
      { id: 1, factor_type: "Financial-Physical Mismatch", score_contribution: 22.4, title: "Expenditure Disparity", description: `${proj.financial_progress}% of sanctioned funds disbursed while physical execution stands at only ${proj.physical_progress}%.`, evidence: `Financial Progress: ${proj.financial_progress}% | Physical Progress: ${proj.physical_progress}%` },
      { id: 2, factor_type: "Completion Deviation", score_contribution: 17.0, title: "Timeline Slippage", description: `Physical ground progress (${proj.physical_progress}%) lags benchmark expected completion target (75.0%).`, evidence: `Actual Progress: ${proj.physical_progress}% | Expected: 75.0%` },
      { id: 3, factor_type: "Peer Deviation", score_contribution: 13.0, title: "Peer Twin Progress Lag", description: `Project ground execution (${proj.physical_progress}%) lags behind peer twin average (73.8%).`, evidence: `Project Progress: ${proj.physical_progress}% | Peer Twin Average: 73.8%` },
    ],
    trajectory: [
      { milestone: "Sanction (Mar 2024)", expected_progress: 0, actual_progress: 0, expenditure: 0 },
      { milestone: "Q1 (May 2024)", expected_progress: 25, actual_progress: 15, expenditure: 20 },
      { milestone: "Q2 (Jul 2024)", expected_progress: 50, actual_progress: 35, expenditure: 55 },
      { milestone: "Q3 Current (Oct 2024)", expected_progress: 74, actual_progress: proj.physical_progress, expenditure: proj.financial_progress },
      { milestone: "Target (Jan 2025)", expected_progress: 100, actual_progress: null, expenditure: null },
    ],
    predicted_delay_days: 63,
    evidences: [
      { id: 1, file_url: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=600&auto=format&fit=crop&q=80", latitude: 25.3582, longitude: 82.9731, capture_date: "2024-04-15", evidence_type: "Foundation Inspection", reported_progress: 15.0, description: "Excavation and brick masonry foundation laid." },
      { id: 2, file_url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&auto=format&fit=crop&q=80", latitude: 25.3582, longitude: 82.9731, capture_date: "2024-07-20", evidence_type: "Superstructure Slab", reported_progress: 35.0, description: "RCC column casting completed. Formwork erected for roof slab." },
      { id: 3, file_url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&auto=format&fit=crop&q=80", latitude: 25.3582, longitude: 82.9731, capture_date: "2024-10-10", evidence_type: "Wall Masonry & Plaster", reported_progress: proj.physical_progress, description: `Outer wall masonry complete. Interior wiring pending. Physical progress ${proj.physical_progress}%.` },
    ],
  };
}

// ── Peer Twins ───────────────────────────────────────────────────────────
export async function fetchPeerTwins(projectId: string) {
  try {
    const res = await fetch(`${API_BASE}/peers/${projectId}`);
    if (res.ok) return await res.json();
  } catch { console.warn("Backend API unreachable, using resilient client fallback"); }

  const proj = FALLBACK_PROJECTS.find((p) => p.project_id === projectId) || FALLBACK_PROJECTS[0];
  const peers = FALLBACK_PROJECTS.filter((p) => p.project_id !== proj.project_id && (p.district === proj.district || p.state === proj.state)).slice(0, 3);
  return {
    target_project: proj,
    peer_twins: peers.map((p, idx) => ({ id: p.id, project_id: p.project_id, project_name: p.project_name, district: p.district, estimated_cost: p.estimated_cost, physical_progress: p.physical_progress, financial_progress: p.financial_progress, similarity_score: 91.0 - idx * 3, distance_meters: 850.0 + idx * 400 })),
    benchmarks: { peer_median_cost: 52.0, peer_avg_progress: 73.8, peer_avg_finance: 72.0, cost_variance_pct: 30.8, cost_ratio_vs_peer: 1.31, status_summary: `Cost exceeds peer median by 30.8%.` },
    insight: `Current project cost (₹${proj.estimated_cost}L) is compared against peer twin benchmark median cost (₹52.0L).`,
  };
}

// ── Agency Patterns ──────────────────────────────────────────────────────
export async function fetchAgencyPatterns() {
  try {
    const res = await fetch(`${API_BASE}/patterns/agencies`);
    if (res.ok) return await res.json();
  } catch { console.warn("Backend API unreachable, using resilient client fallback"); }
  return [
    { agency_id: 1, agency_name: "UP Public Works Department (PWD) Division II", agency_type: "Public Works Department", total_projects: 24, high_risk_projects: 8, cost_deviation_cases: 6, delay_cases: 9, mismatch_cases: 5, pattern_risk_score: 87.0, findings: ["8 out of 24 projects show significant financial-physical progress mismatch.", "9 projects exhibit execution schedule delays.", "6 projects show cost estimates exceeding peer benchmark median by >20%."] },
    { agency_id: 2, agency_name: "UP State Construction Corporation", agency_type: "State Corporation", total_projects: 18, high_risk_projects: 5, cost_deviation_cases: 4, delay_cases: 6, mismatch_cases: 4, pattern_risk_score: 76.5, findings: ["5 out of 18 projects show timeline delays exceeding 60 days.", "4 projects show financial utilization >90% while physical progress is <50%."] },
  ];
}

// ── Relationship Graph ───────────────────────────────────────────────────
export async function fetchRelationshipGraph() {
  try {
    const res = await fetch(`${API_BASE}/patterns/graph`);
    if (res.ok) return await res.json();
  } catch { console.warn("Backend API unreachable, using resilient client fallback"); }
  return {
    nodes: [
      { id: "agency_1", label: "UP PWD Division II\n(Agency Risk: 87/100)", group: "AGENCY", color: "#ef4444" },
      { id: "project_1", label: "P1045: Community Hall\n(Risk: 92/100)", group: "PROJECT", color: "#dc2626" },
      { id: "project_2", label: "P2098: Community Centre\n(Risk: 36.5/100)", group: "PROJECT", color: "#f59e0b" },
      { id: "project_3", label: "P3812: Trauma Care\n(Risk: 88.5/100)", group: "PROJECT", color: "#dc2626" },
    ],
    edges: [
      { from: "agency_1", to: "project_1", label: "Executed By" },
      { from: "agency_1", to: "project_2", label: "Executed By" },
      { from: "project_1", to: "project_2", label: "Overlap 91%" },
    ],
  };
}

// ── Geo Overlaps ─────────────────────────────────────────────────────────
export async function fetchPotentialOverlaps(radiusMeters = 5000) {
  try {
    const res = await fetch(`${API_BASE}/geo/overlaps?radius_meters=${radiusMeters}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map((item: any) => {
          if (item.project_a && item.project_b) return item;
          return {
            status_note: item.status_note || `Distance: ${item.distance_meters || 850}m | Description Similarity: ${item.similarity_score || 91}% — Verification Required`,
            distance_meters: item.distance_meters || 850,
            similarity_score: item.similarity_score || 91,
            project_a: { project_id: "P1045", project_name: "Construction of Community Hall & Skill Center", description: "Construction of RCC multipurpose community hall with sanitary fittings and solar lighting system at Shivpur ward.", district: item.district || "Varanasi", estimated_cost: 68.0, physical_progress: 47.0 },
            project_b: { project_id: item.project_id || "P2098", project_name: item.project_name || "Construction of Public Community Centre Building", description: "Construction of public community center building with multipurpose hall and sanitary fittings.", district: item.district || "Varanasi", estimated_cost: item.estimated_cost || 72.0, physical_progress: item.physical_progress || 42.0 },
          };
        });
      }
    }
  } catch { console.warn("Backend API unreachable, using resilient client fallback"); }
  return [{
    status_note: "Distance: 850m | Description Similarity: 91% — Verification Required",
    distance_meters: 850, similarity_score: 91,
    project_a: { project_id: "P1045", project_name: "Construction of Community Hall & Skill Center", description: "Construction of RCC multipurpose community hall with sanitary fittings and solar lighting system at Shivpur ward.", district: "Varanasi", estimated_cost: 68.0, physical_progress: 47.0 },
    project_b: { project_id: "P2098", project_name: "Construction of Public Community Centre Building", description: "Construction of public community center building with multipurpose hall and sanitary fittings.", district: "Varanasi", estimated_cost: 72.0, physical_progress: 42.0 },
  }];
}

// ── Geo Map Data ─────────────────────────────────────────────────────────
export async function fetchGeoMapData() {
  try {
    const res = await fetch(`${API_BASE}/geo/map-data`);
    if (res.ok) return await res.json();
  } catch { console.warn("Backend API unreachable, using resilient client fallback"); }
  return FALLBACK_PROJECTS.map((p) => ({
    id: p.id, project_id: p.project_id, project_name: p.project_name, district: p.district,
    latitude: p.district === "Varanasi" ? 25.3582 : p.district === "Lucknow" ? 26.8467 : p.district === "Patna" ? 25.5941 : 12.9716,
    longitude: p.district === "Varanasi" ? 82.9731 : p.district === "Lucknow" ? 80.9462 : p.district === "Patna" ? 85.1376 : 77.5946,
    risk_score: p.risk_score, risk_level: p.risk_level, sanction_amount: p.sanction_amount, physical_progress: p.physical_progress, financial_progress: p.financial_progress,
  }));
}

// ── Investigations ───────────────────────────────────────────────────────
export async function fetchInvestigations() {
  try {
    const res = await fetch(`${API_BASE}/investigations`);
    if (res.ok) return await res.json();
  } catch { console.warn("Backend API unreachable, using resilient client fallback"); }
  return [
    { id: 1, case_id: "CAS-2024-001", priority: 1, project_id: "P1045", project_name: "Construction of Community Hall & Skill Center", district: "Varanasi", risk_score: 92.0, sanction_amount: 68.0, financial_exposure: 68.0, evidence_strength: "High", reason: "Financial utilization (91.8%) far outpaces physical progress (47.0%).", primary_reason: "Financial utilization (91.8%) far outpaces physical progress (47.0%).", recommended_action: "Field Measurement Audit & Site Inspection", assigned_to: "Shri Rajesh Kumar (District Nodal Officer)", status: "Open", due_date: "2024-11-30" },
    { id: 2, case_id: "CAS-2024-002", priority: 2, project_id: "P3812", project_name: "Construction of District Trauma Care & Multi-Specialty Block", district: "Lucknow", risk_score: 88.5, sanction_amount: 145.0, financial_exposure: 145.0, evidence_strength: "High", reason: "95.2% financial progress vs 45.0% physical completion.", primary_reason: "95.2% financial progress vs 45.0% physical completion.", recommended_action: "Physical Verification & Ledger Voucher Inspection", assigned_to: "Smt. Priya Sharma (State Audit Cell)", status: "Open", due_date: "2024-12-05" },
  ];
}

// ── Investigation Brief ──────────────────────────────────────────────────
export async function fetchInvestigationBrief(investigationId: number) {
  try {
    const res = await fetch(`${API_BASE}/investigations/${investigationId}/brief`);
    if (res.ok) return await res.json();
  } catch { console.warn("Backend API unreachable, using resilient client fallback"); }
  return {
    investigation_id: investigationId,
    brief_title: "Investigation Brief — P1045: Community Hall & Skill Center",
    project_details: { district: "Varanasi", state: "Uttar Pradesh", sanction_amount: "₹68.0 Lakh" },
    executive_summary: "Project P1045 has been flagged for critical risk. Financial utilization (91.8%) far outpaces physical ground progress (47.0%). Delta of +44.8% indicates potential financial irregularity. Multi-factor scoring engine ranked this project Priority 1 for field verification.",
    primary_signals: [
      "Financial-Physical mismatch delta of +44.8 percentage points",
      "Cost estimate exceeds peer twin median by 30.8%",
      "Physical progress lags benchmark by 27 percentage points",
    ],
    evidence: { financial: "₹62.4L disbursed out of ₹68.0L sanctioned (91.8%)", progress: "Physical completion at 47.0% vs 74% expected benchmark" },
    recommended_checklist: [
      "1. Verify reported physical progress ground logs",
      "2. Review expenditure disbursement vouchers against measurement book",
      "3. Compare on-site construction measurements with BoQ estimates",
      "4. Verify geo-tagged photo evidence timestamps and coordinates",
      "5. Cross-check agency billing statements with actual material procurement",
    ],
  };
}

// ── Create Inspection Case ───────────────────────────────────────────────
export async function createInspectionCase(caseData: Record<string, any>) {
  try {
    const res = await fetch(`${API_BASE}/investigations/create`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(caseData) });
    if (res.ok) return await res.json();
  } catch { console.warn("Backend API unreachable, using resilient client fallback"); }
  return { status: "created", case_id: `CAS-2024-00${Math.floor(Math.random() * 90) + 10}` };
}

// ── Update Case Status ───────────────────────────────────────────────────
export async function updateCaseStatus(investigationId: number, status: string) {
  try {
    const res = await fetch(`${API_BASE}/investigations/${investigationId}/status?status=${encodeURIComponent(status)}`, { method: "PATCH" });
    if (res.ok) return await res.json();
  } catch { console.warn("Backend API unreachable, using resilient client fallback"); }
  return { status: "updated", new_status: status };
}

// ── Report Summary ───────────────────────────────────────────────────────
export async function fetchReportSummary(state = "All", district = "All", risk_level = "All") {
  try {
    const res = await fetch(`${API_BASE}/reports/summary?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}&risk_level=${encodeURIComponent(risk_level)}`);
    if (res.ok) return await res.json();
  } catch { console.warn("Backend API unreachable, using resilient client fallback"); }

  let filtered = [...FALLBACK_PROJECTS];
  if (state && state !== "All") filtered = filtered.filter((p) => p.state === state);
  if (district && district !== "All") filtered = filtered.filter((p) => p.district === district);
  if (risk_level && risk_level !== "All") filtered = filtered.filter((p) => p.risk_level === risk_level);

  const critical = filtered.filter((p) => p.risk_level === "CRITICAL" || p.risk_score >= 80);
  const high = filtered.filter((p) => p.risk_level === "HIGH" || (p.risk_score >= 50 && p.risk_score < 80));
  const totalSanctions = filtered.length;
  const totalVal = filtered.reduce((acc, p) => acc + (p.estimated_cost || p.sanction_amount || 0), 0);
  const avgPhys = totalSanctions > 0 ? filtered.reduce((acc, p) => acc + p.physical_progress, 0) / totalSanctions : 0;

  return {
    report_title: `MPLADS Governance Risk & Audit Report (${district !== "All" ? district : state !== "All" ? state : "National Summary"})`,
    authority_scope: `Ministry of Statistics & Programme Implementation (MoSPI) — ${district !== "All" ? district : state}`,
    generated_date: new Date().toISOString().slice(0, 10),
    executive_summary: `Multi-factor audit scanning identifies ${critical.length + high.length} projects in ${district !== "All" ? district : "the selected jurisdiction"} with irregularity signals requiring field verification.`,
    metrics: { total_projects: totalSanctions, total_sanctioned_cr: (totalVal / 100).toFixed(2), total_expenditure_cr: ((totalVal * 0.75) / 100).toFixed(2), avg_physical_progress: avgPhys.toFixed(1), critical_risk_count: critical.length, high_risk_count: high.length },
    critical_projects: critical.map((p) => ({ project_id: p.project_id, project_name: p.project_name, district: p.district, sanction_amount: p.sanction_amount, expenditure: p.expenditure, physical_progress: p.physical_progress, financial_progress: p.financial_progress, risk_score: p.risk_score, risk_level: p.risk_level })),
    high_risk_projects: high.map((p) => ({ project_id: p.project_id, project_name: p.project_name, district: p.district, sanction_amount: p.sanction_amount, expenditure: p.expenditure, physical_progress: p.physical_progress, financial_progress: p.financial_progress, risk_score: p.risk_score, risk_level: p.risk_level })),
  };
}

// ── Ask NIRIKSHAK Assistant ──────────────────────────────────────────────
export async function askNirikshakAssistant(query: string) {
  try {
    const res = await fetch(`${API_BASE}/assistant/query`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) });
    if (res.ok) return await res.json();
  } catch { console.warn("Backend API unreachable, using resilient client fallback"); }

  const qRaw = query || "";
  const qLower = qRaw.toLowerCase().trim();

  if (!qLower) {
    return {
      answer_text: "Please enter a question or select one of the suggested queries below.",
      query_type: "text",
      suggested_followups: [
        "Which projects should I inspect first?",
        "Why is P1045 high risk?",
        "Show projects with high expenditure but low physical progress"
      ]
    };
  }

  // 0. Greetings & Role
  if (["hi", "hello", "hey", "help", "who are you"].includes(qLower)) {
    return {
      answer_text: "Hello! I am the **NIRIKSHAK AI Assistant**. I can help you search project records, analyze financial-physical progress disparities, inspect high-risk works, check implementing agency performance, or explain risk scoring methodology. Try asking 'Which projects should I inspect first?' or 'Why is P1045 high risk?'.",
      query_type: "text",
      suggested_followups: [
        "Which projects should I inspect first?",
        "Why is P1045 high risk?",
        "Show projects with high expenditure but low physical progress"
      ]
    };
  }

  // 1. General Knowledge / Scheme Information Queries
  if (["what is mplads", "mplad scheme", "about mplads", "explain mplads"].some((k) => qLower.includes(k))) {
    return { answer_text: "**MPLADS (Member of Parliament Local Area Development Scheme)** allows Members of Parliament to recommend development works of developmental nature with emphasis on creation of durable community assets (drinking water, primary education, public health, sanitation, and roads) in their constituencies. NIRIKSHAK provides AI-driven risk intelligence and audit oversight across all MPLADS funds.", query_type: "key_value", details: [{ label: "Scheme Focus", value: "Durable community assets & public infrastructure" }, { label: "Annual Entitlement", value: "₹5 Crore per Member of Parliament per year" }, { label: "Nodal Ministry", value: "Ministry of Statistics & Programme Implementation (MoSPI)" }, { label: "NIRIKSHAK Role", value: "Automated anomaly detection, risk scoring & field audit prioritization" }], suggested_followups: ["How does NIRIKSHAK calculate risk scores?", "Which projects should I inspect first?", "Show projects with high expenditure but low physical progress"] };
  }

  if (["how risk score", "risk engine", "risk formula", "how do you calculate risk", "risk calculation"].some((k) => qLower.includes(k))) {
    return { answer_text: "NIRIKSHAK's Risk Engine calculates project risk scores from **0 to 100** using a 6-factor composite weighting algorithm:", query_type: "key_value", details: [{ label: "1. Expenditure Disparity (24.4%)", value: "Gap between financial disbursement % and reported physical ground progress" }, { label: "2. Cost vs Peer Median (18.0%)", value: "Sanctioned cost deviation compared against similar peer twin works" }, { label: "3. Completion Delay (17.0%)", value: "Actual physical execution lagging behind benchmark target schedule" }, { label: "4. Peer Execution Lag (13.0%)", value: "Progress lagging behind peer twin benchmark average" }, { label: "5. Spatial Overlap Signal (10.0%)", value: "GIS proximity (<1km radius) and work description similarity (>85%)" }, { label: "6. Agency Risk Density (10.0%)", value: "Historical anomaly density of the implementing agency" }], suggested_followups: ["Which projects should I inspect first?", "Why is P1045 high risk?", "Which agency has the highest risk flags?"] };
  }

  // 2. Priority / Inspection Queue Queries
  if (["inspect", "priority", "queue", "urgent", "first"].some((k) => qLower.includes(k))) {
    const criticals = FALLBACK_PROJECTS.filter((p) => p.risk_level === "CRITICAL" || p.risk_score >= 60).sort((a, b) => b.risk_score - a.risk_score);
    return { answer_text: "Based on multi-factor exposure weighting (Financial Mismatch + Timeline Slippage + Peer Twin Progress Lag), here are the top high-priority projects requiring immediate field verification:", query_type: "table", table_columns: ["project_id", "project_name", "district", "financial_progress", "physical_progress", "risk_score"], table_data: criticals.map((p) => ({ project_id: p.project_id, project_name: p.project_name, district: p.district, financial_progress: `${p.financial_progress}%`, physical_progress: `${p.physical_progress}%`, risk_score: `${p.risk_score} / 100` })), suggested_followups: ["Why is P1045 high risk?", "Show projects with high expenditure but low physical progress", "Which agency has the highest number of risk flags?"] };
  }

  // 3. Specific Project Query (Matching ID pattern like P1045, P2098, P3812, P3901, P4021, P5190, P5310, P6104)
  const pidMatch = qRaw.match(/\b[pP]\d{4}\b/);
  let matchedProj = null;
  if (pidMatch) {
    const pidTarget = pidMatch[0].toUpperCase();
    matchedProj = FALLBACK_PROJECTS.find(p => p.project_id.toUpperCase() === pidTarget);
  }

  if (matchedProj || (qLower.includes("why") && FALLBACK_PROJECTS.some(p => qLower.includes(p.project_id.toLowerCase())))) {
    const proj = matchedProj || FALLBACK_PROJECTS.find(p => qLower.includes(p.project_id.toLowerCase())) || FALLBACK_PROJECTS[0];
    const finDelta = (proj.financial_progress - proj.physical_progress).toFixed(1);
    return { answer_text: `Project **${proj.project_id} (${proj.project_name})** in **${proj.district}** has a Risk Score of **${proj.risk_score}/100** (${proj.risk_level} Risk). Here is the evidence breakdown:`, query_type: "key_value", details: [{ label: "Financial-Physical Disparity", value: `+24.4 pts (${proj.financial_progress}% funds disbursed vs ${proj.physical_progress}% physical execution — Delta +${finDelta}%)` }, { label: "Sanction Amount vs Peer Median", value: `+18.0 pts (Sanctioned ₹${proj.sanction_amount}L vs Peer Twin Median ₹52.0L)` }, { label: "Completion Timeline Slippage", value: `+17.0 pts (Physical execution lags target benchmark by 28%)` }, { label: "Peer Twin Execution Lag", value: `+13.0 pts (Ground progress is 26.8% below peer benchmark)` }, { label: "Spatial Proximity Overlap Signal", value: `+10.0 pts (91% description overlap with project P2098 850m away)` }, { label: "Implementing Agency Density", value: `+10.0 pts (${proj.agency_name} flagged for 8 district anomalies)` }], suggested_followups: ["Which projects should I inspect first?", "Show projects with high expenditure but low physical progress", "Show nearby overlapping works for this project"] };
  }

  // 4. Expenditure / Disbursement / Financial Mismatch
  if (["expenditure", "disbursement", "mismatch", "funds", "money"].some((k) => qLower.includes(k))) {
    const mismatched = [...FALLBACK_PROJECTS].map((p) => ({ ...p, delta: (p.financial_progress - p.physical_progress).toFixed(1) })).sort((a, b) => parseFloat(b.delta) - parseFloat(a.delta));
    return { answer_text: "Identified projects where financial expenditure disbursements significantly outpace reported physical ground progress:", query_type: "table", table_columns: ["project_id", "project_name", "district", "financial_progress", "physical_progress", "mismatch_delta", "risk_score"], table_data: mismatched.map((p) => ({ project_id: p.project_id, project_name: p.project_name, district: p.district, financial_progress: `${p.financial_progress}%`, physical_progress: `${p.physical_progress}%`, mismatch_delta: `+${p.delta}%`, risk_score: `${p.risk_score} / 100` })), suggested_followups: ["Which projects should I inspect first?", "Which agency has the highest number of risk flags?"] };
  }

  // 5. Agency / Contractor Queries
  if (["agency", "contractor", "vendor", "pwd", "res"].some((k) => qLower.includes(k))) {
    return { answer_text: "Systemic risk density overview across implementing agencies and contractors in the jurisdiction:", query_type: "table", table_columns: ["agency_name", "agency_type", "total_projects", "high_risk_cases", "pattern_risk_score"], table_data: [{ agency_name: "UP Public Works Department (PWD) Division II", agency_type: "State PWD", total_projects: 24, high_risk_cases: 8, pattern_risk_score: "87.0 / 100" }, { agency_name: "UP State Construction Corporation", agency_type: "State Corporation", total_projects: 18, high_risk_cases: 5, pattern_risk_score: "76.5 / 100" }, { agency_name: "UP Rural Engineering Services (RES)", agency_type: "Rural Engineering", total_projects: 15, high_risk_cases: 3, pattern_risk_score: "53.1 / 100" }], suggested_followups: ["Which projects should I inspect first?", "Why is P1045 high risk?"] };
  }

  // 6. District / Location Queries
  const matchedDistrict = ["Varanasi", "Lucknow", "Patna", "Bengaluru Urban"].find((d) => qLower.includes(d.toLowerCase()));
  if (matchedDistrict || ["district", "location", "city", "state"].some((k) => qLower.includes(k))) {
    const targetDistrict = matchedDistrict || "Varanasi";
    const distProjects = FALLBACK_PROJECTS.filter((p) => p.district.toLowerCase() === targetDistrict.toLowerCase());
    const displayList = distProjects.length > 0 ? distProjects : FALLBACK_PROJECTS;
    return { answer_text: `Found **${displayList.length} project records** matching geographical region **${targetDistrict}**:`, query_type: "table", table_columns: ["project_id", "project_name", "district", "sanction_amount", "physical_progress", "risk_score"], table_data: displayList.map((p) => ({ project_id: p.project_id, project_name: p.project_name, district: p.district, sanction_amount: `₹${p.sanction_amount}L`, physical_progress: `${p.physical_progress}%`, risk_score: `${p.risk_score} / 100` })), suggested_followups: ["Which projects should I inspect first?", "Show projects with high expenditure but low physical progress"] };
  }

  // 7. Delay / Progress Queries
  if (["delay", "stuck", "slow", "lagging", "pending"].some((k) => qLower.includes(k))) {
    const delayed = [...FALLBACK_PROJECTS].sort((a, b) => a.physical_progress - b.physical_progress);
    return { answer_text: "Projects exhibiting physical execution delays lag behind scheduled completion benchmarks:", query_type: "table", table_columns: ["project_id", "project_name", "district", "physical_progress", "financial_progress", "risk_score"], table_data: delayed.map((p) => ({ project_id: p.project_id, project_name: p.project_name, district: p.district, physical_progress: `${p.physical_progress}%`, financial_progress: `${p.financial_progress}%`, risk_score: `${p.risk_score} / 100` })), suggested_followups: ["Which projects should I inspect first?", "Why is P1045 high risk?"] };
  }

  // 8. Tokenized Keyword Search with Stop Word Filtering
  const rawTokens = qLower.split(/\W+/);
  const keywords = rawTokens.filter(t => t.length > 2 && !STOP_WORDS.has(t));

  if (keywords.length === 0) {
    return {
      answer_text: `No project or entity matching **"${query}"** was found in the NIRIKSHAK database.`,
      query_type: "text",
      suggested_followups: [
        "Which projects should I inspect first?",
        "Why is P1045 high risk?",
        "Show projects with high expenditure but low physical progress"
      ]
    };
  }

  const searchResults = FALLBACK_PROJECTS.filter((p) => {
    const pText = `${p.project_id} ${p.project_name} ${p.district} ${p.project_type} ${p.agency_name}`.toLowerCase();
    return keywords.some((kw) => pText.includes(kw));
  });

  if (searchResults.length === 0) {
    return {
      answer_text: `No project or entity matching **"${query}"** was found in the NIRIKSHAK database. Try searching by project ID (e.g. P1045, P3812), location (Varanasi, Lucknow), or work category (Community Hall, Trauma Care, Solar).`,
      query_type: "text",
      suggested_followups: [
        "Which projects should I inspect first?",
        "Why is P1045 high risk?",
        "Show projects with high expenditure but low physical progress"
      ]
    };
  }

  return {
    answer_text: `Found **${searchResults.length} project record(s)** matching your query **"${query}"**:`,
    query_type: "table",
    table_columns: ["project_id", "project_name", "district", "financial_progress", "physical_progress", "risk_score"],
    table_data: searchResults.map((p) => ({ project_id: p.project_id, project_name: p.project_name, district: p.district, financial_progress: `${p.financial_progress}%`, physical_progress: `${p.physical_progress}%`, risk_score: `${p.risk_score} / 100` })),
    suggested_followups: ["Which projects should I inspect first?", "Why is P1045 high risk?", "Which agency has the highest number of risk flags?"]
  };
}

// ── Exported aliases for hook convenience ──────────────────────────────────
export const fetchProjectDetail = fetchProjectIntelligence;
export const fetchPeerComparison = fetchPeerTwins;

