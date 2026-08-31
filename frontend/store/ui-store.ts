import { create } from "zustand";

interface UIStore {
  /** Whether the mobile sidebar drawer is open */
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  toggleMobile: () => void;

  /** Global search value (synced from header) */
  globalSearch: string;
  setGlobalSearch: (val: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  mobileOpen: false,
  setMobileOpen: (open) => set({ mobileOpen: open }),
  toggleMobile: () => set((s) => ({ mobileOpen: !s.mobileOpen })),

  globalSearch: "",
  setGlobalSearch: (val) => set({ globalSearch: val }),
}));
