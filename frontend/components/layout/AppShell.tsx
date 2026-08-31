"use client";

import React, { useState, type ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileTabsBar from "@/components/layout/MobileTabsBar";
import StartupScreen from "@/components/common/StartupScreen";
import { useUIStore } from "@/store/ui-store";
import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { mobileOpen, setMobileOpen, globalSearch, setGlobalSearch } = useUIStore();
  const [loadingStartup, setLoadingStartup] = useState(true);
  const pathname = usePathname();

  return (
    <>
      <AnimatePresence>
        {loadingStartup && (
          <StartupScreen onComplete={() => setLoadingStartup(false)} />
        )}
      </AnimatePresence>

      <div className="flex h-screen w-full bg-slate-900 text-slate-900 font-sans overflow-hidden">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        <div className="flex-1 flex flex-col min-w-0 h-screen bg-slate-50 overflow-hidden">
          <Header
            searchVal={globalSearch}
            setSearchVal={setGlobalSearch}
            setMobileOpen={setMobileOpen}
          />

          <MobileTabsBar />

          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex-1 overflow-y-auto pb-12 w-full min-w-0"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </>
  );
}
