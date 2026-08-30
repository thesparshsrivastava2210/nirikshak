import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import AppShell from "@/components/layout/AppShell";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NIRIKSHAK — MPLADS Project Monitoring & Risk Intelligence",
  description:
    "AI-Powered MPLADS Risk Intelligence Platform for project monitoring, investigation prioritization, and governance audit oversight across India.",
  openGraph: {
    title: "NIRIKSHAK — MPLADS Risk Intelligence",
    description:
      "AI-Powered project monitoring, risk scoring, and investigation intelligence for MPLADS governance.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-slate-800 selection:text-white font-sans">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
