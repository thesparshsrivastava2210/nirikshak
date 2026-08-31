import { useQuery } from "@tanstack/react-query";
import {
  fetchDashboardStats,
  fetchGeoMapData,
  fetchProjects,
  fetchProjectIntelligence,
  fetchInvestigations,
  fetchAgencyPatterns,
  fetchPeerTwins,
  fetchReportSummary,
  askNirikshakAssistant,
  type Project,
  type ProjectFilters,
} from "@/lib/api";

// ── Dashboard ──────────────────────────────────────────────────────────────

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: fetchDashboardStats,
  });
}

export function useGeoMapData() {
  return useQuery({
    queryKey: ["geo", "map-markers"],
    queryFn: fetchGeoMapData,
    staleTime: 2 * 60 * 1000,
  });
}

// ── Projects ────────────────────────────────────────────────────────────────

export function useProjects(filters: ProjectFilters = {}) {
  return useQuery({
    queryKey: ["projects", filters],
    queryFn: () => fetchProjects(filters),
  });
}

export function useProjectDetail(projectId: string) {
  return useQuery({
    queryKey: ["projects", projectId],
    queryFn: () => fetchProjectIntelligence(projectId),
    enabled: !!projectId,
  });
}

// ── Investigations ──────────────────────────────────────────────────────────

export function useInvestigations() {
  return useQuery({
    queryKey: ["investigations"],
    queryFn: () => fetchInvestigations(),
  });
}

// ── Patterns ────────────────────────────────────────────────────────────────

export function usePatterns() {
  return useQuery({
    queryKey: ["patterns"],
    queryFn: () => fetchAgencyPatterns(),
  });
}

// ── Peer Twins ──────────────────────────────────────────────────────────────

export function usePeerComparison(projectId: string) {
  return useQuery({
    queryKey: ["peers", projectId],
    queryFn: () => fetchPeerTwins(projectId),
    enabled: !!projectId,
  });
}

// ── Reports ─────────────────────────────────────────────────────────────────

export function useReportSummary(state: string, district: string, riskLevel: string) {
  return useQuery({
    queryKey: ["reports", state, district, riskLevel],
    queryFn: () => fetchReportSummary(state, district, riskLevel),
  });
}

// ── Assistant ───────────────────────────────────────────────────────────────

export function useAssistantQuery(query: string, enabled: boolean) {
  return useQuery({
    queryKey: ["assistant", query],
    queryFn: () => askNirikshakAssistant(query),
    enabled: enabled && !!query.trim(),
    staleTime: 5 * 60 * 1000,
  });
}

// Re-export types for convenience
export type { Project, ProjectFilters };
