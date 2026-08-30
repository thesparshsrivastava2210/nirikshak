"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";

interface MapMarker {
  id: number;
  project_id: string;
  project_name: string;
  district: string;
  state?: string;
  latitude: number;
  longitude: number;
  risk_score: number;
  risk_level: string;
  sanction_amount: number;
  physical_progress: number;
  financial_progress?: number;
}

const createRiskIcon = (riskLevel: string) => {
  let color = "#10B981";
  if (riskLevel === "CRITICAL") color = "#EF4444";
  else if (riskLevel === "HIGH") color = "#F97316";
  else if (riskLevel === "MEDIUM") color = "#F59E0B";

  const svgHtml = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" fill="${color}" fill-opacity="0.25" stroke="${color}" stroke-width="2"/>
      <circle cx="12" cy="12" r="4" fill="${color}"/>
    </svg>
  `;

  return L.divIcon({
    className: "custom-risk-marker",
    html: svgHtml,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

interface RiskMapProps {
  markers?: MapMarker[];
  center?: [number, number];
  zoom?: number;
}

export default function RiskMap({
  markers = [],
  center = [25.3176, 82.9739],
  zoom = 9,
}: RiskMapProps) {
  const router = useRouter();

  return (
    <div className="w-full h-full min-h-[360px] rounded-lg overflow-hidden border border-slate-700/80 shadow-sm relative">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m) => (
          <Marker
            key={m.id}
            position={[m.latitude, m.longitude]}
            icon={createRiskIcon(m.risk_level)}
          >
            <Popup>
              <div className="p-1 max-w-xs font-sans">
                <div className="flex items-center justify-between gap-2 border-b pb-1 mb-1.5">
                  <span className="font-bold text-xs text-slate-900">
                    {m.project_id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      m.risk_level === "CRITICAL"
                        ? "bg-red-100 text-red-800"
                        : m.risk_level === "HIGH"
                          ? "bg-orange-100 text-orange-800"
                          : m.risk_level === "MEDIUM"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-green-100 text-green-800"
                    }`}
                  >
                    {m.risk_level} ({m.risk_score})
                  </span>
                </div>
                <h4 className="font-semibold text-xs text-slate-800 leading-tight mb-1">
                  {m.project_name}
                </h4>
                <p className="text-[10px] text-slate-500 mb-2">
                  {m.district}, {m.state} • ₹{m.sanction_amount}L
                </p>
                <div className="grid grid-cols-2 gap-1 text-[10px] bg-slate-50 p-1.5 rounded mb-2 border border-slate-200">
                  <div>
                    Phys Prog: <b>{m.physical_progress}%</b>
                  </div>
                  <div>
                    Fin Prog: <b>{m.financial_progress}%</b>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/projects/${m.project_id}`)}
                  className="w-full bg-slate-900 text-white text-[10px] font-semibold py-1 rounded hover:bg-slate-800 transition text-center block cursor-pointer"
                >
                  View Project Intelligence →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
