import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import MobileTabsBar from './components/layout/MobileTabsBar';
import StartupScreen from './components/common/StartupScreen';

import CommandCenter from './pages/CommandCenter';
import RiskRadar from './pages/RiskRadar';
import ProjectsList from './pages/ProjectsList';
import ProjectIntelligence from './pages/ProjectIntelligence';
import PeerTwins from './pages/PeerTwins';
import PatternIntelligence from './pages/PatternIntelligence';
import GeoIntelligence from './pages/GeoIntelligence';
import InvestigationCentre from './pages/InvestigationCentre';
import ReportsPage from './pages/ReportsPage';
import AskNirikshak from './pages/AskNirikshak';

export default function App() {
  const [searchVal, setSearchVal] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loadingStartup, setLoadingStartup] = useState(true);

  return (
    <AuthProvider>
      {/* Government-Grade Startup Screen */}
      {loadingStartup && (
        <StartupScreen onComplete={() => setLoadingStartup(false)} />
      )}

      <BrowserRouter>
        {/* Fixed Viewport Height Layout Container */}
        <div className="flex h-screen w-full bg-slate-900 text-slate-900 font-sans overflow-hidden">
          {/* Responsive Left Sidebar (Fixed 100vh) */}
          <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

          {/* Main Workspace Area (Clean Workspace background, scroll constrained to main) */}
          <div className="flex-1 flex flex-col min-w-0 h-screen bg-slate-50 overflow-hidden">
            {/* Top Header */}
            <Header searchVal={searchVal} setSearchVal={setSearchVal} setMobileOpen={setMobileOpen} />

            {/* Touch Horizontal Mobile Tabs Bar */}
            <MobileTabsBar />

            {/* Router Page Container - ONLY THIS MAIN CONTAINER SCROLLS VERTICALLY */}
            <main className="flex-1 overflow-y-auto pb-12 w-full min-w-0">
              <Routes>
                <Route path="/" element={<CommandCenter />} />
                <Route path="/risk-radar" element={<RiskRadar />} />
                <Route path="/projects" element={<ProjectsList />} />
                <Route path="/projects/:projectId" element={<ProjectIntelligence />} />
                <Route path="/peer-twins" element={<PeerTwins />} />
                <Route path="/pattern-intelligence" element={<PatternIntelligence />} />
                <Route path="/geo-intelligence" element={<GeoIntelligence />} />
                <Route path="/investigation-centre" element={<InvestigationCentre />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/ask-nirikshak" element={<AskNirikshak />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
