"use client";

import Header from "@/components/dashboard/Header";
import {
  TrendingUp,
  Users,
  Search,
  Star,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLatestTransfers, useSportsHeadlines, useFeaturedPlayers } from "@/lib/hooks";
import { formatCurrency, getPositionColor, getPositionCode, calculateAge, getRelativeTime, getCurrentTeam, parseLocalISODate } from "@/lib/utils";
import type { SportmonksPlayer, SportmonksTransfer } from "@/lib/sportmonks/types";

export default function DashboardPage() {
  // Fetch featured players matching club's recruitment needs
  const {
    data: playersData,
    loading: playersLoading,
    error: playersError,
    refetch: refetchPlayers,
  } = useFeaturedPlayers();

  // Fetch latest transfers
  const {
    data: transfersData,
    loading: transfersLoading,
    error: transfersError,
    refetch: refetchTransfers,
  } = useLatestTransfers("player;fromTeam;toTeam");

  // Get featured players (top 5)
  const featuredPlayers = playersData?.data?.slice(0, 5) || [];

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const recentCutoff = new Date(todayStart);
  recentCutoff.setDate(recentCutoff.getDate() - 30);

  // Get recent transfers (top 4, last 30 days only)
  const recentTransfers =
    transfersData?.data
      ?.filter((transfer) => {
        const transferDate = parseLocalISODate(transfer.date);
        return (
          !!transferDate &&
          transferDate >= recentCutoff &&
          transferDate <= todayStart
        );
      })
      .sort((a, b) => {
        const aDate = parseLocalISODate(a.date)?.getTime() ?? 0;
        const bDate = parseLocalISODate(b.date)?.getTime() ?? 0;
        return bDate - aDate;
      })
      .slice(0, 4) || [];

  return (
    <>
      <Header title="Dashboard" subtitle="Welcome back to SKOUTEX" showClubInfo />

      <div className="p-3 sm:p-4 lg:p-6 space-y-6 sm:space-y-8 w-full max-w-[100vw] lg:max-w-none overflow-hidden">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={<Search className="w-4 h-4 sm:w-5 sm:h-5" />}
            label="Searches Today"
            value="0"
          />
          <StatCard
            icon={<Users className="w-4 h-4 sm:w-5 sm:h-5" />}
            label="Players Analyzed"
            value="0"
          />
          <StatCard
            icon={<Star className="w-4 h-4 sm:w-5 sm:h-5" />}
            label="Watchlist"
            value="0"
          />
          <StatCard
            icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />}
            label="Avg Fit Score"
            value="—"
          />
        </div>

        {/* AI Assistant Quick Access */}
        <Link href="/dashboard/chat">
          <div className="bg-gradient-to-r from-[#0031FF]/20 to-[#0050FF]/10 border border-[#0031FF]/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-[#0031FF]/50 transition-all cursor-pointer group">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#0031FF] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold truncate text-[#2C2C2C]">
                    AI Scout Assistant
                  </h3>
                  <p className="text-xs sm:text-sm truncate text-gray-600">
                    Ask anything about players, tactics, or market insights
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[#0031FF] group-hover:gap-3 transition-all flex-shrink-0">
                <span className="hidden sm:block text-sm">Start chat</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>

            {/* Quick prompts */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
              {[
                "Find a right winger under 25",
                "Compare top CDM targets",
                "Market value analysis",
              ].map((prompt) => (
                <span
                  key={prompt}
                  className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs bg-white/50 border border-gray-200 text-gray-600"
                >
                  {prompt}
                </span>
              ))}
            </div>
          </div>
        </Link>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Featured Players */}
          <div className="lg:col-span-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-white border border-gray-200">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-semibold text-[#2C2C2C]">
                Players Matching Your Needs
              </h2>
              <Link
                href="/dashboard/search"
                className="text-xs sm:text-sm text-[#0031FF] hover:text-[#0050FF] flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </div>

            {/* Loading State */}
            {playersLoading && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mb-3" />
                <p className="text-sm">Loading players...</p>
              </div>
            )}

            {/* Error State */}
            {playersError && !playersLoading && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <AlertCircle className="w-8 h-8 mb-3 text-red-500" />
                <p className="text-sm text-red-600 mb-3">Failed to load players</p>
                <button
                  onClick={() => refetchPlayers()}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </button>
              </div>
            )}

            {/* Empty State */}
            {!playersLoading && !playersError && featuredPlayers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Users className="w-8 h-8 mb-3" />
                <p className="text-sm">No players found</p>
              </div>
            )}

            {/* Players List */}
            {!playersLoading && !playersError && featuredPlayers.length > 0 && (
              <div className="space-y-2 sm:space-y-3">
                {featuredPlayers.map((player: SportmonksPlayer, index: number) => {
                  const age = calculateAge(player.date_of_birth);
                  const position = player.position?.name || player.position?.code;
                  const positionCode = getPositionCode(position);
                  const currentTeam = getCurrentTeam(player);

                  return (
                    <Link
                      key={player.id}
                      href={`/dashboard/players/${player.id}`}
                      className="flex items-center gap-2 sm:gap-4 p-2.5 sm:p-3 rounded-xl transition-all group bg-[#f6f6f6] hover:bg-gray-100"
                    >
                      <span className="w-5 sm:w-6 text-center text-gray-500 font-medium text-sm">
                        {index + 1}
                      </span>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-200 overflow-hidden">
                        {player.image_path ? (
                          <Image
                            src={player.image_path}
                            alt={player.display_name || player.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm sm:text-base font-semibold text-[#2C2C2C]">
                            {(player.display_name || player.name || "?")[0]}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-medium truncate group-hover:text-[#0031FF] transition-colors text-[#2C2C2C]">
                          {player.display_name || player.common_name || player.name}
                        </p>
                        <p className="text-xs sm:text-sm truncate text-gray-500">
                          {currentTeam?.name || "Free Agent"} {age ? `· ${age}y` : ""}
                        </p>
                      </div>
                      {position && (
                        <span
                          className={`hidden sm:inline-block px-2 py-1 rounded text-xs font-medium ${getPositionColor(
                            positionCode
                          )} text-white`}
                        >
                          {positionCode}
                        </span>
                      )}
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">
                          {player.nationality?.name || "Unknown"}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-400">
                          {player.height ? `${player.height} cm` : ""}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-3 sm:space-y-4">
            {/* Recent Transfers */}
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-white border border-gray-200">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-[#2C2C2C]">
                  Recent Transfers
                </h2>
                {transfersError && !transfersLoading && (
                  <button
                    onClick={() => refetchTransfers()}
                    className="text-gray-400 hover:text-gray-600"
                    title="Retry"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Loading State */}
              {transfersLoading && (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}

              {/* Error State */}
              {transfersError && !transfersLoading && (
                <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                  <AlertCircle className="w-6 h-6 mb-2 text-red-400" />
                  <p className="text-xs text-gray-400">Failed to load transfers</p>
                </div>
              )}

              {/* Empty State */}
              {!transfersLoading && !transfersError && recentTransfers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                  <TrendingUp className="w-6 h-6 mb-2" />
                  <p className="text-xs">No recent transfers</p>
                </div>
              )}

              {/* Transfers List */}
              {!transfersLoading && !transfersError && recentTransfers.length > 0 && (
                <div className="space-y-2 sm:space-y-3">
                  {recentTransfers.map((transfer: SportmonksTransfer) => (
                    <Link
                      key={transfer.id}
                      href={`/dashboard/players/${transfer.player_id}`}
                      className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg transition-all hover:bg-gray-100"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-200 overflow-hidden">
                        {transfer.player?.image_path ? (
                          <Image
                            src={transfer.player.image_path}
                            alt={transfer.player.display_name || transfer.player.name || "Player"}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs sm:text-sm font-medium text-[#2C2C2C]">
                            {(transfer.player?.display_name || transfer.player?.name || "?")[0]}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium truncate text-[#2C2C2C]">
                          {transfer.player?.display_name || transfer.player?.common_name || transfer.player?.name || "Unknown Player"}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                          {(transfer.fromTeam?.name ||
                            transfer.fromteam?.name ||
                            transfer.from_team?.name ||
                            "Unknown")}{" "}
                          →{" "}
                          {(transfer.toTeam?.name ||
                            transfer.toteam?.name ||
                            transfer.to_team?.name ||
                            "Unknown")}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs sm:text-sm text-green-600 font-medium">
                          {transfer.amount ? formatCurrency(transfer.amount) : "Free"}
                        </span>
                        <p className="text-[10px] text-gray-400">
                          {transfer.date ? getRelativeTime(transfer.date) : ""}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-white border border-gray-200">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-[#2C2C2C]">
                Quick Actions
              </h2>
              <div className="space-y-1.5 sm:space-y-2">
                <QuickAction
                  href="/dashboard/chat"
                  icon={<MessageSquare className="w-4 h-4" />}
                  label="Ask AI Assistant"
                />
                <QuickAction
                  href="/dashboard/search"
                  icon={<Search className="w-4 h-4" />}
                  label="Search Players"
                />
                <QuickAction
                  href="/dashboard/compare"
                  icon={<Users className="w-4 h-4" />}
                  label="Compare Players"
                />
                <QuickAction
                  href="/dashboard/watchlist"
                  icon={<Star className="w-4 h-4" />}
                  label="View Watchlist"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl p-4 sm:p-5 bg-white border border-gray-200">
      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-[#0031FF] bg-[#f6f6f6]">
          {icon}
        </div>
        <span className="text-xs sm:text-sm text-gray-500">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-xl sm:text-2xl font-bold text-[#2C2C2C]">{value}</p>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl transition-all group bg-[#f6f6f6] hover:bg-gray-100"
    >
      <div className="group-hover:text-[#0031FF] transition-colors text-gray-500">
        {icon}
      </div>
      <span className="text-sm transition-colors text-gray-600 group-hover:text-[#2C2C2C]">
        {label}
      </span>
      <ArrowRight className="w-4 h-4 ml-auto transition-colors text-gray-400 group-hover:text-gray-500" />
    </Link>
  );
}
