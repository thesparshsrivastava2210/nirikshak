import React, { useState } from 'react';
import { Search, Bell, Shield, Building2, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header({ searchVal, setSearchVal, setMobileOpen = () => {} }) {
  const { currentUser } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const mockNotifications = [
    { id: 1, title: 'Critical Risk Alert', text: 'Project P1045 financial mismatch delta reached +44.8%.', time: '10m ago' },
    { id: 2, title: 'Overlap Signal Detected', text: 'Potential duplicate work flagged between P1045 and P2098.', time: '1h ago' },
    { id: 3, title: 'Inspection Assigned', text: 'CAS-2024-001 assigned to District Magistrate Cell.', time: '3h ago' }
  ];

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm text-slate-200">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          title="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Input */}
        <div className="relative w-full max-w-[170px] sm:max-w-xs md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search Project ID, Name..."
            value={searchVal || ''}
            onChange={(e) => setSearchVal && setSearchVal(e.target.value)}
            className="w-full bg-slate-800/80 text-xs text-slate-200 pl-9 pr-3 py-2 rounded-md border border-slate-700/80 focus:outline-none focus:border-slate-500 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Right Header Metadata */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Authority Scope Badge */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded border border-slate-700/80 text-xs">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium text-slate-300">{currentUser.role}:</span>
          <span className="font-semibold text-white">{currentUser.district}</span>
        </div>

        {/* Notifications Icon Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700/80 flex items-center justify-center relative transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            <span className="w-2 h-2 rounded-full bg-red-500 absolute top-2 right-2 ring-2 ring-slate-900" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-3 z-50">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <span className="text-xs font-bold text-white">Risk Notifications</span>
                <span className="text-[10px] bg-red-950 text-red-400 px-1.5 py-0.5 rounded border border-red-800">3 New</span>
              </div>
              <div className="space-y-2">
                {mockNotifications.map(n => (
                  <div key={n.id} className="p-2 rounded bg-slate-800/60 hover:bg-slate-800 text-xs border border-slate-700/50">
                    <p className="font-semibold text-slate-200 text-[11px]">{n.title}</p>
                    <p className="text-slate-400 text-[10px] mt-0.5">{n.text}</p>
                    <span className="text-[9px] text-slate-500 mt-1 block">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Government Portal Badge */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 font-medium pl-2 border-l border-slate-800">
          <Shield className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px]">MPLADS Governance Portal</span>
        </div>
      </div>
    </header>
  );
}
