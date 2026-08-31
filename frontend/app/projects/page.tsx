"use client";

import React, { useEffect, useState } from "react";
import { useProjects } from "@/hooks/use-queries";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge, getRiskVariant } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ArrowUpDown, ChevronRight, Download } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ProjectsList() {
  return (
    <React.Suspense
      fallback={
        <div className="p-12 space-y-4 max-w-7xl mx-auto">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <ProjectsListContent />
    </React.Suspense>
  );
}

function ProjectsListContent() {
  const searchParams = useSearchParams();
  const searchFromUrl = searchParams.get("search") || "";

  const [search, setSearch] = useState(searchFromUrl);
  const [stateFilter, setStateFilter] = useState("All");
  const [districtFilter, setDistrictFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");

  const [sortField, setSortField] = useState("risk_score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const router = useRouter();

  useEffect(() => {
    if (searchFromUrl !== search) {
      setSearch(searchFromUrl);
    }
  }, [searchFromUrl]);

  // TanStack Query handles fetching, caching, loading, and error states automatically
  const { data: projects = [], isLoading } = useProjects({
    state: stateFilter,
    district: districtFilter,
    risk_level: riskFilter,
    search: search,
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const sortedProjects = [...projects].sort((a: any, b: any) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            MPLADS Projects Database
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Centralized registry of sanctioned works across jurisdictions with multi-factor risk scores
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (!sortedProjects.length) return;
              const headers = [
                "Project ID",
                "Project Name",
                "Project Type",
                "State",
                "District",
                "Sanction (Lakh)",
                "Expenditure (Lakh)",
                "Physical Progress %",
                "Financial Progress %",
                "Risk Score",
                "Risk Level",
                "Agency Name",
              ];
              const rows = sortedProjects.map((p: any) => [
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
                `"${p.agency_name.replace(/"/g, '""')}"`,
              ]);
              const csvContent =
                "data:text/csv;charset=utf-8," +
                [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute(
                "download",
                `NIRIKSHAK_Projects_Export_${new Date().toISOString().slice(0, 10)}.csv`
              );
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Data</span>
          </Button>

          <Button
            size="sm"
            onClick={() => window.print()}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Print Registry</span>
          </Button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 z-10 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search Project ID, Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
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
          <span>
            Showing <strong className="text-slate-900">{sortedProjects.length}</strong> sanctioned works
          </span>
          {(search ||
            stateFilter !== "All" ||
            districtFilter !== "All" ||
            riskFilter !== "All") && (
            <Button
              variant="link"
              size="sm"
              onClick={() => {
                setSearch("");
                setStateFilter("All");
                setDistrictFilter("All");
                setRiskFilter("All");
              }}
              className="text-slate-600 hover:text-slate-900 p-0"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Projects Table Container */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200 select-none">
                  <th
                    onClick={() => handleSort("project_id")}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-200"
                  >
                    <div className="flex items-center gap-1">
                      <span>Project ID</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("project_name")}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-200"
                  >
                    <div className="flex items-center gap-1">
                      <span>Project Name</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("district")}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-200"
                  >
                    <div className="flex items-center gap-1">
                      <span>Location</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("sanction_amount")}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-200 text-right"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Sanction Cost</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("physical_progress")}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-200 text-right"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Physical %</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("financial_progress")}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-200 text-right"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Financial %</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("risk_score")}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-200 text-center"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Risk Score</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 text-xs">
                {sortedProjects.map((p: any) => (
                  <tr
                    key={p.id || p.project_id}
                    onClick={() => router.push(`/projects/${p.project_id}`)}
                    className="hover:bg-slate-50 transition cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                      {p.project_id}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs">
                      <p className="truncate text-slate-900 group-hover:text-emerald-700">
                        {p.project_name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-normal truncate mt-0.5">
                        {p.agency_name}
                      </p>
                    </td>

                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {p.district}, {p.state}
                      <span className="block text-[10px] text-slate-400">
                        {p.village}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-900 font-bold text-right">
                      ₹{p.sanction_amount} Lakh
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-semibold text-slate-800">
                          {p.physical_progress}%
                        </span>
                        <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="bg-emerald-600 h-full rounded-full"
                            style={{ width: `${p.physical_progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-semibold text-slate-800">
                          {p.financial_progress}%
                        </span>
                        <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${p.financial_progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <Badge variant={getRiskVariant(p.risk_level)}>
                        {p.risk_score} / 100
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/projects/${p.project_id}`);
                        }}
                        className="font-bold text-xs"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </Button>
                    </td>
                  </tr>
                ))}

                {sortedProjects.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-8 text-center text-slate-500 text-xs font-medium"
                    >
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
