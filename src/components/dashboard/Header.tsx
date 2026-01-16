"use client";

import { Menu, Search } from "lucide-react";
import Image from "next/image";
import { useAppStore } from "@/lib/store";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TransferWindowBadge } from "@/components/TransferWindowBadge";
import { NotificationBadge } from "@/components/NotificationBadge";
import { useActiveTransferWindow } from "@/lib/hooks";
import { useDebounce } from "@/lib/hooks/useDebounce";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showClubInfo?: boolean;
}

type ClubData = {
  name: string;
  logoUrl: string | null;
  league?: string | null;
};

export default function Header({ title, subtitle, showClubInfo = false }: HeaderProps) {
  const { setSidebarOpen, sidebarOpen, user } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms debounce for header search
  const [club, setClub] = useState<ClubData | null>(null);
  const router = useRouter();

  // Get transfer window for club's league
  const league = club?.league || "";
  const { window: transferWindow } = useActiveTransferWindow(league);

  // Fetch club data
  useEffect(() => {
    if (!showClubInfo) return;

    async function fetchClub() {
      try {
        const response = await fetch("/api/club/branding");
        if (!response.ok) return;
        const data = await response.json();
        setClub({
          name: data?.name || "SKOUTEX",
          logoUrl: data?.logoUrl ?? null,
          league: data?.league ?? null,
        });
      } catch {
        setClub({ name: "SKOUTEX", logoUrl: null });
      }
    }

    fetchClub();
  }, [showClubInfo]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Auto-navigate to search when user stops typing (optional UX enhancement)
  useEffect(() => {
    if (debouncedSearchQuery.trim() && debouncedSearchQuery.length >= 3) {
      // Optional: Auto-navigate after user stops typing for 300ms
      // Uncomment to enable this behavior
      // router.push(`/dashboard/search?q=${encodeURIComponent(debouncedSearchQuery)}`);
    }
  }, [debouncedSearchQuery, router]);

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl border-b bg-white/80 border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left: Menu button (mobile) + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 transition-colors text-gray-500 hover:text-[#2C2C2C]"
          >
            <Menu className="w-6 h-6" />
          </button>

          {title && (
            <div>
              <h1 className="text-xl font-bold text-[#2C2C2C]">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-500">{subtitle}</p>
              )}
            </div>
          )}
        </div>

        {/* Center: Search */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-md mx-4"
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search players, clubs, or ask AI..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:border-[#0031FF] transition-all bg-gray-100 border border-gray-200 text-[#2C2C2C] placeholder-gray-500"
            />
          </div>
        </form>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {/* Transfer Window Badge */}
          {showClubInfo && league && (
            <div className="hidden lg:block">
              <TransferWindowBadge window={transferWindow} compact />
            </div>
          )}

          {/* Club Info */}
          {showClubInfo && club && (
            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
              {club.logoUrl ? (
                <Image
                  src={club.logoUrl}
                  alt={club.name}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-8 h-8 bg-electric-blue rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {(club.name || "SKOUTEX").charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-900">{club.name}</p>
                {club.league && (
                  <p className="text-xs text-gray-500">{club.league}</p>
                )}
              </div>
            </div>
          )}

          {/* Notifications */}
          <NotificationBadge />

          {/* User Avatar */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0031FF] to-[#0050FF] flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-[#2C2C2C]">{user?.name || "User"}</p>
              <p className="text-xs text-gray-500">{user?.role || "Member"}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
