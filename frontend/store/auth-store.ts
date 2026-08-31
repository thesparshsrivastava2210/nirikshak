import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DemoAccount {
  name: string;
  email: string;
  role: string;
  state: string;
  district: string;
  constituency: string;
  badgeColor: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    name: "Central Nodal Officer",
    email: "ministry@nirikshak.demo",
    role: "Ministry",
    state: "All India",
    district: "National Center",
    constituency: "National",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
  },
  {
    name: "State Project Director (UP)",
    email: "state@nirikshak.demo",
    role: "State Authority",
    state: "Uttar Pradesh",
    district: "State HQ",
    constituency: "State Wide",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    name: "District Magistrate / Nodal",
    email: "district@nirikshak.demo",
    role: "District Authority",
    state: "Uttar Pradesh",
    district: "Varanasi",
    constituency: "Varanasi Parliamentary",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    name: "MP Office Varanasi",
    email: "mp@nirikshak.demo",
    role: "MP / Constituency",
    state: "Uttar Pradesh",
    district: "Varanasi",
    constituency: "Varanasi",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
];

interface AuthStore {
  currentUser: DemoAccount;
  switchUser: (email: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      currentUser: DEMO_ACCOUNTS[2], // Default: District Magistrate
      switchUser: (email: string) => {
        const found = DEMO_ACCOUNTS.find((a) => a.email === email);
        if (found) set({ currentUser: found });
      },
    }),
    {
      name: "nirikshak-auth",
    }
  )
);
