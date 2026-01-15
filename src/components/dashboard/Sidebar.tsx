"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Users,
  MessageSquare,
  FileText,
  Settings,
  Star,
  BarChart3,
  Share2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  Calendar,
  LayoutGrid,
  Newspaper,
  FilePlus2,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// Brand colors - Light theme
// Background: #f6f6f6, borders: #e5e5e5, cards: #ffffff
// Text: #2C2C2C, accent: #0031FF

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/chat", icon: MessageSquare, label: "AI Assistant" },
  { href: "/dashboard/search", icon: Search, label: "Player Search" },
  { href: "/dashboard/calendar", icon: Calendar, label: "Scout Calendar" },
  { href: "/dashboard/fieldmap", icon: LayoutGrid, label: "Field Map" },
  { href: "/dashboard/news", icon: Newspaper, label: "News" },
  { href: "/dashboard/watchlist", icon: Star, label: "Watchlist" },
  { href: "/dashboard/compare", icon: Users, label: "Compare Players" },
  { href: "/dashboard/reports", icon: FileText, label: "Reports" },
  { href: "/dashboard/reportex", icon: FilePlus2, label: "ReportTeX" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/share", icon: Share2, label: "Sale Pages" },
];

const bottomItems = [
  { href: "/dashboard/club", icon: Building2, label: "Club Profile" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  // Close sidebar on mobile when clicking a link
  const handleNavClick = () => {
    // Only close on mobile (when window width is less than lg breakpoint)
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    handleNavClick(); // Close sidebar on mobile
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 bg-white border-r border-gray-200 ${
          sidebarOpen ? "w-64 translate-x-0" : "w-20 -translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center gap-3">
              {sidebarOpen ? (
                <Image
                  src="/skoutex-logo.svg"
                  alt="SKOUTEX"
                  width={140}
                  height={40}
                  priority
                />
              ) : (
                <div className="w-10 h-10 bg-[#0031FF] rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
              )}
            </Link>
          </div>

          {/* Toggle button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center transition-all hidden lg:flex bg-white border border-gray-300 text-gray-500 hover:text-[#2C2C2C] hover:bg-gray-50"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {/* Main Navigation */}
          <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              // For dashboard, only match exact path to avoid false positives
              const isActive = item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                    isActive
                      ? "bg-[#0031FF] text-white"
                      : "text-gray-600 hover:text-[#2C2C2C] hover:bg-gray-100"
                  }`}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "" : "group-hover:text-[#0031FF]"}`} />
                  {sidebarOpen && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Navigation */}
          <div className="py-4 px-3 border-t space-y-1 border-gray-200">
            {bottomItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                    isActive
                      ? "bg-[#0031FF] text-white"
                      : "text-gray-600 hover:text-[#2C2C2C] hover:bg-gray-100"
                  }`}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "" : "group-hover:text-[#0031FF]"}`} />
                  {sidebarOpen && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-gray-500 hover:text-red-500 hover:bg-red-50 w-full"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="font-medium text-sm">Sign Out</span>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
