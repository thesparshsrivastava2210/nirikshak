"use client";

import React from "react";
import RiskMap from "@/components/common/RiskMapDynamic";
import { useDashboardStats, useGeoMapData } from "@/hooks/use-queries";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge, getRiskVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import {
  Building2,
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
  Network,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useRouter } from "next/navigation";

export default function CommandCenter() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: mapMarkers = [], isLoading: mapLoading } = useGeoMapData();
  const router = useRouter();

  if (statsLoading || !stats) {
    return (
      <div className="p-3 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const { summary, priority_queue, risk_trend, detected_patterns } = stats;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full overflow-x-hidden">
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            MPLADS Command Center
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-medium">
            Project monitoring, risk intelligence and investigation prioritization platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Live System Active
          </span>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-start justify-between"
        >
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Works
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">12,482</h3>
            <p className="text-[10px] text-slate-400 mt-1">
              Active & Completed MPLADS Sanctions
            </p>
          </div>
          <div className="p-2.5 bg-slate-100 rounded text-slate-700">
            <Building2 className="w-5 h-5" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-start justify-between"
        >
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Expenditure
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              ₹482.6 Cr
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">
              ₹{summary.total_expenditure_lakh} Lakh Disbursed
            </p>
          </div>
          <div className="p-2.5 bg-slate-100 rounded text-slate-700">
            <IndianRupee className="w-5 h-5" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-start justify-between"
        >
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Average Completion
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">86.4%</h3>
            <p className="text-[10px] text-emerald-600 mt-1 font-semibold">
              On-ground Physical Benchmark
            </p>
          </div>
          <div className="p-2.5 bg-emerald-50 rounded text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
          className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-start justify-between"
        >
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Risk Flags
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">347</h3>
            <p className="text-[10px] text-red-600 mt-1 font-semibold">
              {summary.critical_projects} Critical • {summary.high_risk_projects} High Risk
            </p>
          </div>
          <div className="p-2.5 bg-red-50 rounded text-red-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </motion.div>
      </div>

      {/* SECTION 1: WHAT NEEDS ATTENTION? */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-700" />
            WHAT NEEDS ATTENTION?
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/risk-radar")}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Open Risk Radar <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded border border-red-200 bg-red-50/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-red-700 uppercase">
                Critical Risk
              </span>
              <p className="text-xl font-extrabold text-red-900 mt-0.5">
                {summary.critical_projects}
              </p>
            </div>
            <Badge variant="critical">Action Req</Badge>
          </div>

          <div className="p-3 rounded border border-orange-200 bg-orange-50/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-orange-700 uppercase">
                High Risk
              </span>
              <p className="text-xl font-extrabold text-orange-900 mt-0.5">
                {summary.high_risk_projects}
              </p>
            </div>
            <Badge variant="high">Inspection</Badge>
          </div>

          <div className="p-3 rounded border border-amber-200 bg-amber-50/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-700 uppercase">
                Medium Risk
              </span>
              <p className="text-xl font-extrabold text-amber-900 mt-0.5">194</p>
            </div>
            <Badge variant="medium">Watchlist</Badge>
          </div>

          <div className="p-3 rounded border border-emerald-200 bg-emerald-50/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase">
                Low Risk
              </span>
              <p className="text-xl font-extrabold text-emerald-900 mt-0.5">
                11,941
              </p>
            </div>
            <Badge variant="low">Normal</Badge>
          </div>
        </div>
      </div>

      {/* SECTION 2: PRIORITY INVESTIGATION QUEUE */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              PRIORITY INVESTIGATION QUEUE
            </h2>
            <p className="text-xs text-slate-500">
              Automated multi-factor exposure ranking for district authorities
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/investigation-centre")}
          >
            View Full Queue →
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Project ID & Name</th>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">Risk Score</th>
                <th className="py-2.5 px-3">Primary Signal</th>
                <th className="py-2.5 px-3">Financial Exposure</th>
                <th className="py-2.5 px-3">Recommended Action</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {priority_queue.map((row: any) => (
                <tr
                  key={row.investigation_id}
                  className="hover:bg-slate-50/80 transition"
                >
                  <td className="py-3 px-3 font-bold text-slate-700">
                    #{row.rank}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    <div>{row.project_id}</div>
                    <div className="text-[11px] text-slate-500 font-normal truncate max-w-xs">
                      {row.project_name}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {row.district}
                  </td>
                  <td className="py-3 px-3 font-bold">
                    <Badge variant={getRiskVariant(row.risk_level)}>
                      {row.risk_score} / 100 ({row.risk_level})
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-slate-600 text-[11px]">
                    {row.primary_signal}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {row.financial_exposure}
                  </td>
                  <td className="py-3 px-3 text-slate-800 font-medium">
                    {row.recommended_action}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Button
                      size="sm"
                      onClick={() => router.push(`/projects/${row.project_id}`)}
                    >
                      Inspect <ArrowUpRight className="w-3 h-3 ml-1" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3 & 4: MAP & RISK TREND */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Map Widget */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              PROJECT RISK MAP
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">
              District Spatial Risk Overlay
            </span>
          </div>
          <div className="flex-1 min-h-[300px]">
            {mapLoading ? (
              <Skeleton className="w-full h-full min-h-[300px]" />
            ) : (
              <RiskMap markers={mapMarkers} />
            )}
          </div>
        </div>

        {/* Risk Trend Chart */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              RISK TREND OVER TIME
            </h2>
            <span className="text-[11px] font-semibold text-slate-500">
              Monthly Risk Signals
            </span>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={risk_trend}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="critical"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  name="Critical Risk"
                />
                <Line
                  type="monotone"
                  dataKey="high"
                  stroke="#f97316"
                  strokeWidth={2}
                  name="High Risk"
                />
                <Line
                  type="monotone"
                  dataKey="medium"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  name="Medium Risk"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 5: DETECTED PATTERNS */}
      <div className="bg-slate-900 text-white rounded-lg p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Network className="w-4 h-4 text-emerald-400" />
            DETECTED RECURRING PATTERNS
          </h2>
          <Button
            variant="link"
            size="sm"
            onClick={() => router.push("/pattern-intelligence")}
            className="text-emerald-400 hover:text-emerald-300"
          >
            Open Pattern Intelligence →
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {detected_patterns.map((item: any) => (
            <div
              key={item.id}
              className="bg-slate-800/90 border border-slate-700 p-3.5 rounded text-xs leading-relaxed space-y-2"
            >
              <span className="inline-block px-2 py-0.5 bg-slate-700 text-slate-200 text-[10px] font-bold rounded">
                Pattern #{item.id}
              </span>
              <p className="text-slate-300 font-medium">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
