"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

/** Singleton QueryClient factory — keeps same instance across HMR */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data stays fresh for 60 s before being refetched in background
        staleTime: 60 * 1000,
        // Unused queries removed from cache after 5 min
        gcTime: 5 * 60 * 1000,
        // Only retry once on failure (backend may be cold on Vercel)
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

/** Top-level provider — rendered once in app/layout.tsx */
export function ReactQueryProvider({ children }: { children: ReactNode }) {
  // useState ensures the client is not re-created on every render
  const [queryClient] = useState(() => makeQueryClient());
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
