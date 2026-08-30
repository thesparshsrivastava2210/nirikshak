"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchProjectIntelligence } from "@/lib/api";
import {
  AlertTriangle,
  CheckCircle2,
  Calendar,
  IndianRupee,
  TrendingUp,
  Building2,
  MapPin,
  Clock,
  Info,
  X,
  Camera,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
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
import Image from "next/image";

export default function ProjectIntelligence() {
  const params = useParams();
  const projectId = typeof params?.projectId === "string" ? params.projectId : undefined;
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFactor, setSelectedFactor] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const idToFetch = projectId || "P1045";
        const res = await fetchProjectIntelligence(idToFetch);
        setData(res);
      } catch (err) {
        console.error("Error fetching project intelligence:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [projectId]);

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium animate-pulse">
        Loading Project Risk Intelligence...
      </div>
    );
  }

  const {
    project,
    risk_summary,
    ai_insight,
    risk_factors,
    trajectory,
    predicted_delay_days,
    evidences,
  } = data;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <button
            onClick={() => router.push("/projects")}
            className="hover:text-slate-900 cursor-pointer"
          >
            Projects
          </button>
          <span>/</span>
          <span className="text-slate-900 font-semibold">
            {project.project_id}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              router.push(`/peer-twins?project=${project.project_id}`)
            }
            className="bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold px-3 py-1.5 rounded border border-slate-300 transition cursor-pointer"
          >
            View Peer Twins →
          </button>
          <button
            onClick={() => router.push(`/investigation-centre`)}
            className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold px-3 py-1.5 rounded transition cursor-pointer"
          >
            Create Investigation Case
          </button>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-slate-900 text-white text-xs font-bold px-2.5 py-0.5 rounded">
              PROJECT {project.project_id}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
              {project.status}
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {project.project_name}
          </h1>
          <p className="text-xs text-slate-500 font-medium flex items-center gap-3">
            <span className="flex items-center">
              <MapPin className="w-3.5 h-3.5 inline mr-1" />
              {project.village}, {project.district}, {project.state}
            </span>
            <span>•</span>
            <span className="flex items-center">
              <Building2 className="w-3.5 h-3.5 inline mr-1" />
              {project.agency_name}
            </span>
          </p>
        </div>

        {/* Risk Score Gauge Badge */}
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-center gap-4 min-w-[220px]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 block">
              System Risk Index
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-black text-red-900">
                {risk_summary.total_score}
              </span>
              <span className="text-xs font-semibold text-red-700">/ 100</span>
            </div>
            <span className="text-[10px] font-bold bg-red-200 text-red-900 px-2 py-0.5 rounded inline-block mt-1">
              {risk_summary.risk_level} IRREGULARITY RISK
            </span>
          </div>
          <ShieldAlert className="w-10 h-10 text-red-600 shrink-0 opacity-80" />
        </div>
      </div>

      {/* Overview Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase">
            Sanction Amount
          </span>
          <p className="text-base font-extrabold text-slate-900 mt-1">
            ₹{project.sanction_amount} Lakh
          </p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase">
            Expenditure
          </span>
          <p className="text-base font-extrabold text-slate-900 mt-1">
            ₹{project.expenditure} Lakh
          </p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase">
            Physical Progress
          </span>
          <p className="text-base font-extrabold text-slate-900 mt-1">
            {project.physical_progress}%
          </p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase">
            Financial Progress
          </span>
          <p className="text-base font-extrabold text-slate-900 mt-1">
            {project.financial_progress}%
          </p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase">
            Expected Progress
          </span>
          <p className="text-base font-extrabold text-slate-700 mt-1">74%</p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase">
            Predicted Delay
          </span>
          <p className="text-base font-extrabold text-red-600 mt-1">
            {predicted_delay_days} Days
          </p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm col-span-2 lg:col-span-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase">
            Sanction Date
          </span>
          <p className="text-xs font-bold text-slate-800 mt-1">
            {project.sanction_date}
          </p>
        </div>
      </div>

      {/* SECTION: WHAT IS HAPPENING? */}
      <div className="bg-slate-900 text-white rounded-lg p-5 shadow-sm space-y-2 border-l-4 border-amber-500">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400" />
          WHAT IS HAPPENING?
        </h2>
        <p className="text-sm font-semibold text-slate-100 leading-relaxed">
          &quot;{ai_insight}&quot;
        </p>
      </div>

      {/* SECTION: WHY IS THIS PROJECT HIGH RISK? */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              WHY IS THIS PROJECT HIGH RISK?
            </h2>
            <p className="text-xs text-slate-500">
              Click any contributing factor to view detailed proof and baseline evidence
            </p>
          </div>
          <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded border border-red-200">
            Total Score Contribution: +{risk_summary.total_score} pts
          </span>
        </div>

        {/* Horizontal Contribution Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {risk_factors.map((rf: any) => (
            <div
              key={rf.id}
              onClick={() => setSelectedFactor(rf)}
              className="p-4 rounded-lg border border-slate-200 hover:border-slate-400 bg-slate-50/70 hover:bg-slate-100 cursor-pointer transition space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  {rf.factor_type}
                </span>
                <span className="text-xs font-extrabold bg-red-100 text-red-800 px-2 py-0.5 rounded border border-red-200">
                  +{rf.score_contribution}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">{rf.title}</h4>
              <p className="text-[11px] text-slate-600 line-clamp-2">
                {rf.description}
              </p>
              <div className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 pt-1">
                View detailed explanation{" "}
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ACTUAL VS EXPECTED PROJECT TRAJECTORY */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              ACTUAL VS EXPECTED PROJECT TRAJECTORY
            </h2>
            <p className="text-xs text-slate-500">
              Physical progress timeline vs benchmark completion baseline
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded border border-red-200">
              Deviation: -27 percentage points
            </span>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trajectory}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="milestone" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} unit="%" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="expected_progress"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Expected Progress %"
              />
              <Line
                type="monotone"
                dataKey="actual_progress"
                stroke="#ef4444"
                strokeWidth={3}
                name="Actual Progress %"
              />
              <Line
                type="monotone"
                dataKey="expenditure"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Financial Disbursement %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GEO-TAGGED EVIDENCE TIMELINE */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Camera className="w-4 h-4 text-slate-700" />
              GEO-TAGGED PROJECT EVIDENCE
            </h2>
            <p className="text-xs text-slate-500">
              Chronological ground site photographic inspection log with verified metadata
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
            {evidences.length} Verified Photos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {evidences.map((e: any) => (
            <div
              key={e.id}
              className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 flex flex-col justify-between"
            >
              <div className="h-44 bg-slate-200 relative overflow-hidden">
                <Image
                  src={e.file_url}
                  alt={e.evidence_type}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
                <span className="absolute top-2 left-2 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded z-10">
                  {e.capture_date}
                </span>
                <span className="absolute bottom-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded z-10">
                  Phys: {e.reported_progress}%
                </span>
              </div>
              <div className="p-3 space-y-1.5 text-xs">
                <h4 className="font-bold text-slate-900">{e.evidence_type}</h4>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {e.description}
                </p>
                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between font-mono">
                  <span>LAT: {e.latitude}</span>
                  <span>LON: {e.longitude}</span>
                </div>
                <div className="bg-amber-50 text-amber-800 text-[10px] font-semibold p-1.5 rounded border border-amber-200 text-center">
                  Visual consistency signal — Requires Verification
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CLICKABLE EXPLANATION MODAL */}
      {selectedFactor && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 relative">
            <button
              onClick={() => setSelectedFactor(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-0.5 rounded border border-red-200">
                +{selectedFactor.score_contribution} PTS
              </span>
              <h3 className="font-extrabold text-slate-900 text-sm uppercase">
                {selectedFactor.factor_type}
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">
                  {selectedFactor.title}
                </h4>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  {selectedFactor.description}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 text-[11px] block uppercase">
                  Mathematical Evidence Proof:
                </span>
                <p className="font-mono text-slate-800 text-[11px]">
                  {selectedFactor.evidence}
                </p>
              </div>

              <div className="bg-amber-50 text-amber-900 p-3 rounded border border-amber-200 text-[11px] font-medium leading-normal">
                <b>Governance Classification:</b> Flagged as High Irregularity
                Risk. Requires field measurement book verification before final
                fund disbursement approval.
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedFactor(null)}
                className="bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded hover:bg-slate-800 cursor-pointer"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
