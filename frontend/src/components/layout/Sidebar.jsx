import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Radar, 
  FolderKanban, 
  GitCompare, 
  Network, 
  MapPin, 
  ShieldAlert, 
  FileText, 
  Bot, 
  UserCheck, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { currentUser, switchUser, DEMO_ACCOUNTS } = useAuth();

  const navItems = [
    { path: '/', label: 'Command Center', icon: LayoutDashboard },
    { path: '/risk-radar', label: 'Risk Radar', icon: Radar },
    { path: '/projects', label: 'Projects Database', icon: FolderKanban },
    { path: '/peer-twins', label: 'Peer Twins', icon: GitCompare },
    { path: '/pattern-intelligence', label: 'Pattern Intelligence', icon: Network },
    { path: '/geo-intelligence', label: 'Geo Intelligence', icon: MapPin },
    { path: '/investigation-centre', label: 'Investigation Centre', icon: ShieldAlert },
    { path: '/reports', label: 'Reports & Export', icon: FileText },
    { path: '/ask-nirikshak', label: 'Ask NIRIKSHAK', icon: Bot },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/60">
        <div className="w-9 h-9 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold text-lg shadow-sm">
          N
        </div>
        <div>
          <h1 className="font-bold text-white tracking-wide text-base leading-tight">NIRIKSHAK</h1>
          <p className="text-[10px] text-slate-400 font-medium tracking-tight">MPLADS Risk Intelligence</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Monitoring Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold border-l-2 border-slate-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Demo Account & User Profile */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80">
        <div className="mb-2 px-1">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Demo Authority Scope
          </label>
          <div className="relative">
            <select
              value={currentUser.email}
              onChange={(e) => switchUser(e.target.value)}
              className="w-full bg-slate-800 text-slate-200 text-xs rounded border border-slate-700 px-2 py-1.5 focus:outline-none focus:border-slate-500 cursor-pointer pr-6 appearance-none"
            >
              {DEMO_ACCOUNTS.map((acc) => (
                <option key={acc.email} value={acc.email}>
                  {acc.role} ({acc.district})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 bg-slate-900 rounded border border-slate-800">
          <div className="w-7 h-7 rounded bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs">
            {currentUser.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{currentUser.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{currentUser.role} • {currentUser.district}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
