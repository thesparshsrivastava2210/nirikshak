const API_BASE = import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && window.location.port === "5173"
    ? "http://127.0.0.1:8000/api"
    : "/api");

export async function fetchDashboardStats() {
  const res = await fetch(`${API_BASE}/dashboard/stats`);
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json();
}

export async function fetchProjects(filters = {}) {
  const query = new URLSearchParams();
  if (filters.state && filters.state !== "All") query.append("state", filters.state);
  if (filters.district && filters.district !== "All") query.append("district", filters.district);
  if (filters.constituency && filters.constituency !== "All") query.append("constituency", filters.constituency);
  if (filters.project_type && filters.project_type !== "All") query.append("project_type", filters.project_type);
  if (filters.risk_level && filters.risk_level !== "All") query.append("risk_level", filters.risk_level);
  if (filters.search) query.append("search", filters.search);

  const res = await fetch(`${API_BASE}/projects?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

export async function fetchProjectIntelligence(projectId) {
  const res = await fetch(`${API_BASE}/projects/${projectId}`);
  if (!res.ok) throw new Error(`Failed to fetch intelligence for project ${projectId}`);
  return res.json();
}

export async function fetchPeerTwins(projectId) {
  const res = await fetch(`${API_BASE}/peers/${projectId}`);
  if (!res.ok) throw new Error(`Failed to fetch peer twins for project ${projectId}`);
  return res.json();
}

export async function fetchAgencyPatterns() {
  const res = await fetch(`${API_BASE}/patterns/agencies`);
  if (!res.ok) throw new Error("Failed to fetch agency patterns");
  return res.json();
}

export async function fetchRelationshipGraph() {
  const res = await fetch(`${API_BASE}/patterns/graph`);
  if (!res.ok) throw new Error("Failed to fetch relationship graph");
  return res.json();
}

export async function fetchPotentialOverlaps(radiusMeters = 5000) {
  const res = await fetch(`${API_BASE}/geo/overlaps?radius_meters=${radiusMeters}`);
  if (!res.ok) throw new Error("Failed to fetch potential overlaps");
  return res.json();
}

export async function fetchGeoMapData() {
  const res = await fetch(`${API_BASE}/geo/map-data`);
  if (!res.ok) throw new Error("Failed to fetch geo map data");
  return res.json();
}

export async function fetchInvestigations() {
  const res = await fetch(`${API_BASE}/investigations`);
  if (!res.ok) throw new Error("Failed to fetch investigations");
  return res.json();
}

export async function fetchInvestigationBrief(investigationId) {
  const res = await fetch(`${API_BASE}/investigations/${investigationId}/brief`);
  if (!res.ok) throw new Error("Failed to fetch investigation brief");
  return res.json();
}

export async function createInspectionCase(caseData) {
  const res = await fetch(`${API_BASE}/investigations/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(caseData)
  });
  if (!res.ok) throw new Error("Failed to create inspection case");
  return res.json();
}

export async function updateCaseStatus(investigationId, status) {
  const res = await fetch(`${API_BASE}/investigations/${investigationId}/status?status=${encodeURIComponent(status)}`, {
    method: "PATCH"
  });
  if (!res.ok) throw new Error("Failed to update case status");
  return res.json();
}

export async function fetchReportSummary(state = "All", district = "All", risk_level = "All") {
  const res = await fetch(`${API_BASE}/reports/summary?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}&risk_level=${encodeURIComponent(risk_level)}`);
  if (!res.ok) throw new Error("Failed to fetch report summary");
  return res.json();
}

export async function askNirikshakAssistant(query) {
  const res = await fetch(`${API_BASE}/assistant/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });
  if (!res.ok) throw new Error("Failed to process assistant query");
  return res.json();
}

export async function loginDemoUser(email, password = "demo123") {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error("Authentication failed");
  return res.json();
}
