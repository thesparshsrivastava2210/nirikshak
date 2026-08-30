"use client";

import React, { useState, type ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileTabsBar from "@/components/layout/MobileTabsBar";
import StartupScreen from "@/components/common/StartupScreen";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [searchVal, setSearchVal] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loadingStartup, setLoadingStartup] = useState(true);

  return (
    <>
      {loadingStartup && (
        <StartupScreen onComplete={() => setLoadingStartup(false)} />
      )}

      <div className="flex h-screen w-full bg-slate-900 text-slate-900 font-sans overflow-hidden">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        <div className="flex-1 flex flex-col min-w-0 h-screen bg-slate-50 overflow-hidden">
          <Header
            searchVal={searchVal}
            setSearchVal={setSearchVal}
            setMobileOpen={setMobileOpen}
          />

          <MobileTabsBar />

          <main className="flex-1 overflow-y-auto pb-12 w-full min-w-0">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
