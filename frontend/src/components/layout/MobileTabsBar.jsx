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
  Bot 
} from 'lucide-react';

export default function MobileTabsBar() {
  const tabs = [
    { path: '/', label: 'Overview', icon: LayoutDashboard },
    { path: '/risk-radar', label: 'Risk Radar', icon: Radar },
    { path: '/projects', label: 'Projects', icon: FolderKanban },
    { path: '/peer-twins', label: 'Peer Twins', icon: GitCompare },
    { path: '/pattern-intelligence', label: 'Pattern', icon: Network },
    { path: '/geo-intelligence', label: 'Geo Overlaps', icon: MapPin },
    { path: '/investigation-centre', label: 'Cases', icon: ShieldAlert },
    { path: '/reports', label: 'Reports', icon: FileText },
    { path: '/ask-nirikshak', label: 'Ask AI', icon: Bot },
  ];

  return (
    <div className="md:hidden bg-slate-900 border-b border-slate-800 px-2 py-2 sticky top-16 z-20 overflow-x-auto whitespace-nowrap shadow-sm scrollbar-none">
      <div className="flex items-center gap-1.5 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-slate-950 shadow-md font-bold'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
