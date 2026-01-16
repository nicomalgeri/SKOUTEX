"use client";

import { Menu, Bell, Search } from "lucide-react";
import Image from "next/image";
import { useAppStore } from "@/lib/store";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TransferWindowBadge } from "@/components/TransferWindowBadge";
import { useActiveTransferWindow } from "@/lib/hooks";
import { useDebounce } from "@/lib/hooks/useDebounce";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showClubInfo?: boolean;
}

type ClubData = {
  id: string;
  name: string;
  logo_url: string | null;
  club_context: {
    identity?: {
      league?: string;
    };
  } | null;
};

export default function Header({ title, subtitle, showClubInfo = false }: HeaderProps) {
  const { setSidebarOpen, sidebarOpen, user } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms debounce for header search
  const [club, setClub] = useState<ClubData | null>(null);
  const router = useRouter();

  // Get transfer window for club's league
  const league = club?.club_context?.identity?.league || "";
  const { window: transferWindow } = useActiveTransferWindow(league);

  // Fetch club data
  useEffect(() => {
    if (!showClubInfo) return;

    async function fetchClub() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data: clubData } = await supabase
        .from("clubs")
        .select("id, name, logo_url, club_context")
        .eq("id", user.user_metadata.club_id)
        .single();

      if (clubData) {
        setClub(clubData);
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
              {club.logo_url ? (
                <Image
                  src={club.logo_url}
                  alt={club.name}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-8 h-8 bg-electric-blue rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {club.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-900">{club.name}</p>
                {club.club_context?.identity?.league && (
                  <p className="text-xs text-gray-500">{club.club_context.identity.league}</p>
                )}
              </div>
            </div>
          )}

          {/* Notifications */}
          <button className="relative p-2 transition-colors text-gray-500 hover:text-[#2C2C2C]">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#0031FF] rounded-full" />
          </button>

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
