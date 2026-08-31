"use client";

import React, { createContext, useContext, type ReactNode } from "react";
import { useAuthStore, DEMO_ACCOUNTS, type DemoAccount } from "@/store/auth-store";

export type { DemoAccount };
export { DEMO_ACCOUNTS };

interface AuthContextType {
  currentUser: DemoAccount;
  switchUser: (email: string) => void;
  DEMO_ACCOUNTS: DemoAccount[];
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const switchUser = useAuthStore((s) => s.switchUser);

  return (
    <AuthContext.Provider value={{ currentUser, switchUser, DEMO_ACCOUNTS }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Graceful fallback to store directly if used outside provider
    const store = useAuthStore.getState();
    return {
      currentUser: store.currentUser,
      switchUser: store.switchUser,
      DEMO_ACCOUNTS,
    };
  }
  return ctx;
}
