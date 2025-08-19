// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import OnlineBadge from "@/components/OnlineBadge"; // 👈 new
import Precache from "@/components/PreCache";

export const metadata: Metadata = {
  title: "Dealer App",
  description: "Dealer inventory & trade",
  manifest: "/manifest.json",         // 👈 lets next-pwa + browser find your manifest
  themeColor: "#000000",              // status bar / PWA color
  applicationName: "Dealer",
  appleWebApp: { capable: true, statusBarStyle: "black" }, // nice-to-have for iOS
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Precache />
            {children}
          </main>
        </div>

        {/* Small offline indicator (optional) */}
        <OnlineBadge />
      </body>
    </html>
  );
}
