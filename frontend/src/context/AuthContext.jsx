import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const DEMO_ACCOUNTS = [
  {
    name: "Central Nodal Officer",
    email: "ministry@nirikshak.demo",
    role: "Ministry",
    state: "All India",
    district: "National Center",
    constituency: "National",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200"
  },
  {
    name: "State Project Director (UP)",
    email: "state@nirikshak.demo",
    role: "State Authority",
    state: "Uttar Pradesh",
    district: "State HQ",
    constituency: "State Wide",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200"
  },
  {
    name: "District Magistrate / Nodal",
    email: "district@nirikshak.demo",
    role: "District Authority",
    state: "Uttar Pradesh",
    district: "Varanasi",
    constituency: "Varanasi Parliamentary",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200"
  },
  {
    name: "MP Office Varanasi",
    email: "mp@nirikshak.demo",
    role: "MP / Constituency",
    state: "Uttar Pradesh",
    district: "Varanasi",
    constituency: "Varanasi",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200"
  }
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(DEMO_ACCOUNTS[2]); // Default to District Authority (Varanasi)

  const switchUser = (email) => {
    const found = DEMO_ACCOUNTS.find(a => a.email === email);
    if (found) setCurrentUser(found);
  };

  return (
    <AuthContext.Provider value={{ currentUser, switchUser, DEMO_ACCOUNTS }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
