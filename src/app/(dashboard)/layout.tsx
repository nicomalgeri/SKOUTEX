"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import { useAppStore } from "@/lib/store";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen } = useAppStore();

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#f6f6f6]">
      <ErrorBoundary>
        <Sidebar />
      </ErrorBoundary>
      <main
        className={`transition-all duration-300 min-h-screen ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        <div className="w-full max-w-[100vw] lg:max-w-none overflow-x-hidden">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
