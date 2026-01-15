"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import { useAppStore } from "@/lib/store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen } = useAppStore();

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#f6f6f6]">
      <Sidebar />
      <main
        className={`transition-all duration-300 min-h-screen ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        <div className="w-full max-w-[100vw] lg:max-w-none overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
