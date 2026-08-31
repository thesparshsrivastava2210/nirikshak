"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Bell, Shield, Building2, Menu, ChevronRight, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchProjects } from "@/lib/api";
import { useRouter } from "next/navigation";

interface HeaderProps {
  searchVal?: string;
  setSearchVal?: (val: string) => void;
  setMobileOpen?: (open: boolean) => void;
}

export default function Header({
  setMobileOpen = () => {},
}: HeaderProps) {
  const { currentUser } = useAuth();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Live autocomplete search matching against projects database
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    async function searchData() {
      try {
        const results = await fetchProjects({ search: query.trim() });
        setSearchResults(results.slice(0, 6)); // Display top 6 results
        setShowDropdown(true);
      } catch (err) {
        console.error("Error fetching search results:", err);
      }
    }

    const timer = setTimeout(searchData, 150);
    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setShowDropdown(false);
    router.push(`/projects?search=${encodeURIComponent(query.trim())}`);
  };

  const handleSelectProject = (projectId: string) => {
    setShowDropdown(false);
    setQuery("");
    router.push(`/projects/${projectId}`);
  };

  const mockNotifications = [
    {
      id: 1,
      title: "Critical Risk Alert",
      text: "Project P1045 financial mismatch delta reached +44.8%.",
      time: "10m ago",
    },
    {
      id: 2,
      title: "Overlap Signal Detected",
      text: "Potential duplicate work flagged between P1045 and P2098.",
      time: "1h ago",
    },
    {
      id: 3,
      title: "Inspection Assigned",
      text: "CAS-2024-001 assigned to District Magistrate Cell.",
      time: "3h ago",
    },
  ];

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm text-slate-200">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
          title="Open Navigation Menu"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Top Search Bar Container with Live Autocomplete Dropdown */}
        <div
          ref={searchContainerRef}
          className="relative w-full max-w-[170px] sm:max-w-xs md:w-96"
        >
          <form
            onSubmit={handleFormSubmit}
            className="relative flex items-center"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Project ID, Name, Location..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim() && setShowDropdown(true)}
              className="w-full bg-slate-800/90 text-xs text-slate-200 pl-9 pr-8 py-2 rounded-md border border-slate-700/80 focus:outline-none focus:border-slate-400 placeholder-slate-400 font-medium"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setShowDropdown(false);
                }}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Autocomplete Results Dropdown Panel */}
          {showDropdown && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden text-xs">
              <div className="p-2 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {searchResults.length > 0
                    ? `Matched Projects (${searchResults.length})`
                    : "No Results"}
                </span>
                <span className="text-[9px] text-slate-500">
                  Press Enter for full database list
                </span>
              </div>

              {searchResults.length > 0 ? (
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-800">
                  {searchResults.map((proj) => (
                    <div
                      key={proj.project_id}
                      onClick={() => handleSelectProject(proj.project_id)}
                      className="p-2.5 hover:bg-slate-800 cursor-pointer transition flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">
                            {proj.project_id}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                              proj.risk_level === "CRITICAL"
                                ? "bg-red-950 text-red-400 border border-red-800"
                                : proj.risk_level === "HIGH"
                                ? "bg-amber-950 text-amber-400 border border-amber-800"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {proj.risk_level} {proj.risk_score}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-300 truncate mt-0.5 group-hover:text-white">
                          {proj.project_name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {proj.district} • ₹{proj.sanction_amount} Lakh •{" "}
                          {proj.physical_progress}% Progress
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-slate-400 text-xs">
                  No project matching &quot;{query}&quot;
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded border border-slate-700/80 text-xs">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium text-slate-300">
            {currentUser?.role}:
          </span>
          <span className="font-semibold text-white">
            {currentUser?.district}
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700/80 flex items-center justify-center relative transition cursor-pointer"
            title="Notifications"
            aria-label="Toggle notifications"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            <span className="w-2 h-2 rounded-full bg-red-500 absolute top-2 right-2 ring-2 ring-slate-900" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-3 z-50">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <span className="text-xs font-bold text-white">
                  Risk Notifications
                </span>
                <span className="text-[10px] bg-red-950 text-red-400 px-1.5 py-0.5 rounded border border-red-800">
                  3 New
                </span>
              </div>
              <div className="space-y-2">
                {mockNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2 rounded bg-slate-800/60 hover:bg-slate-800 text-xs border border-slate-700/50"
                  >
                    <p className="font-semibold text-slate-200 text-[11px]">
                      {n.title}
                    </p>
                    <p className="text-slate-400 text-[10px] mt-0.5">
                      {n.text}
                    </p>
                    <span className="text-[9px] text-slate-500 mt-1 block">
                      {n.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 font-medium pl-2 border-l border-slate-800">
          <Shield className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px]">MPLADS Governance Portal</span>
        </div>
      </div>
    </header>
  );
}
