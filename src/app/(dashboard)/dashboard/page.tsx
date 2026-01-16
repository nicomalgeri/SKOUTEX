/**
 * Main Dashboard Page
 * Enhanced dashboard with position targets, radar charts, and AI assistant
 */

"use client";

import Header from "@/components/dashboard/Header";
import { PositionTargetsSection, type PositionNeed } from "@/components/dashboard/PositionTargetsSection";
import { RecentTransfersSection, type Transfer } from "@/components/dashboard/RecentTransfersSection";
import { AIScoutAssistant } from "@/components/dashboard/AIScoutAssistant";
import FitScoreGateNotice from "@/components/FitScoreGateNotice";
import { TrendingUp, Users, Search, Star, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useFeaturedPlayers, useLatestTransfers } from "@/lib/hooks";
import type { SportmonksPlayer, SportmonksTransfer } from "@/lib/sportmonks/types";
import type { FitScoreGateResult } from "@/lib/club-context/fitScoreGate";
import { calculateAge, getCurrentTeam, parseLocalISODate, getRelativeTime, formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [fitScoreGate, setFitScoreGate] = useState<FitScoreGateResult | null>(null);

  // Fetch fit score gate status
  useEffect(() => {
    const fetchFitScoreGate = async () => {
      try {
        const response = await fetch("/api/club/context/validate");
        if (response.ok) {
          const data = await response.json();
          setFitScoreGate(data.gate);
        }
      } catch (error) {
        console.error("Failed to fetch fit score gate:", error);
      }
    };
    fetchFitScoreGate();
  }, []);

  // Fetch featured players matching club's recruitment needs
  const {
    data: playersData,
    loading: playersLoading,
    error: playersError,
  } = useFeaturedPlayers();

  // Fetch latest transfers
  const {
    data: transfersData,
    loading: transfersLoading,
    error: transfersError,
  } = useLatestTransfers("player;fromTeam;toTeam");

  // Convert Sportmonks players to position needs format
  const positionNeeds: PositionNeed[] = useMemo(() => {
    if (!playersData?.data || playersLoading) return [];

    const players = playersData.data;

    // Group players by position
    const positionGroups: Record<string, SportmonksPlayer[]> = {};

    players.forEach((player) => {
      const position = player.position?.code || "CM";
      if (!positionGroups[position]) {
        positionGroups[position] = [];
      }
      positionGroups[position].push(player);
    });

    // Create position needs (max 3 positions, 2 players each)
    return Object.entries(positionGroups)
      .slice(0, 3)
      .map(([posCode, posPlayers]) => {
        const topTwo = posPlayers.slice(0, 2);

        return {
          position: posCode,
          fullName: topTwo[0]?.position?.name || posCode,
          priority: "high" as const,
          recommendations: topTwo.map((player) => {
            const age = calculateAge(player.date_of_birth);
            const currentTeam = getCurrentTeam(player);

            return {
              id: player.id,
              name: player.display_name || player.common_name || player.name,
              club: currentTeam?.name || "Free Agent",
              age: age || 25,
              position: posCode,
              fitScore: Math.floor(Math.random() * 15) + 75, // TODO: Calculate real fit score
              imageUrl: player.image_path,
            };
          }) as [any, any],
        };
      });
  }, [playersData, playersLoading]);

  // Convert Sportmonks transfers to Transfer format
  useEffect(() => {
    if (!transfersData?.data || transfersLoading) return;

    const now = new Date();
    const recentCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    const formattedTransfers: Transfer[] = transfersData.data
      .filter((transfer: SportmonksTransfer) => {
        const transferDate = parseLocalISODate(transfer.date);
        return transferDate && transferDate >= recentCutoff;
      })
      .sort((a: SportmonksTransfer, b: SportmonksTransfer) => {
        const aDate = parseLocalISODate(a.date)?.getTime() ?? 0;
        const bDate = parseLocalISODate(b.date)?.getTime() ?? 0;
        return bDate - aDate;
      })
      .slice(0, 8)
      .map((transfer: SportmonksTransfer) => ({
        id: transfer.id.toString(),
        playerName: transfer.player?.display_name || transfer.player?.name || "Unknown Player",
        fromClub: transfer.fromTeam?.name || transfer.fromteam?.name || "Unknown",
        toClub: transfer.toTeam?.name || transfer.toteam?.name || "Unknown",
        fee: transfer.amount || 0,
        feeDisplay: transfer.amount ? formatCurrency(transfer.amount) : "Free",
        position: transfer.player?.position?.code || "?",
        timestamp: transfer.date,
        timeAgo: getRelativeTime(transfer.date),
        playerId: transfer.player_id,
      }));

    setTransfers(formattedTransfers);
  }, [transfersData, transfersLoading]);

  const handleAddToShortlist = async (playerId: number) => {
    console.log("Added player to shortlist:", playerId);
    // TODO: Implement actual shortlist functionality
    try {
      await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player_id: playerId }),
      });
    } catch (error) {
      console.error("Failed to add to shortlist:", error);
    }
  };

  const handleTransferFilterChange = (filters: any) => {
    console.log("Transfer filters changed:", filters);
    // TODO: Implement actual filtering with API call
    // For now, filters work on the client side in RecentTransfersSection
  };

  // Loading state
  if (playersLoading && transfersLoading) {
    return (
      <>
        <Header title="Dashboard" subtitle="Welcome back to SKOUTEX" showClubInfo />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Dashboard" subtitle="Welcome back to SKOUTEX" showClubInfo />

      <div className="p-3 sm:p-6 lg:p-12 space-y-8 sm:space-y-12 w-full max-w-[100vw] lg:max-w-[1440px] mx-auto overflow-hidden">
        {/* Fit Score Gate Notification */}
        {fitScoreGate && !fitScoreGate.unlocked && (
          <FitScoreGateNotice gate={fitScoreGate} variant="compact" />
        )}

        {/* Hero Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="Players Analyzed"
            value={playersData?.data?.length.toString() || "0"}
          />
          <StatCard
            icon={<Star className="w-5 h-5" />}
            label="Recent Transfers"
            value={transfers.length.toString()}
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Position Needs"
            value={positionNeeds.length.toString()}
          />
          <StatCard
            icon={<Search className="w-5 h-5" />}
            label="Recommendations"
            value={positionNeeds.reduce((acc, need) => acc + need.recommendations.length, 0).toString()}
          />
        </div>

        {/* Position Targets Section */}
        {positionNeeds.length > 0 ? (
          <PositionTargetsSection
            positionNeeds={positionNeeds}
            onAddToShortlist={handleAddToShortlist}
            showFitScore={fitScoreGate?.unlocked ?? true}
          />
        ) : playersLoading ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-gray-600">Loading player recommendations...</p>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-600 mb-2">No player recommendations available</p>
            <p className="text-sm text-gray-500">
              Complete your club profile to get personalized recommendations
            </p>
          </div>
        )}

        {/* Recent Transfers Section */}
        {transfersLoading ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-gray-600">Loading recent transfers...</p>
          </div>
        ) : transfersError ? (
          <div className="bg-red-50 rounded-xl border border-red-200 p-8 text-center">
            <p className="text-red-600">Failed to load transfers</p>
            <p className="text-sm text-red-500 mt-1">Please try again later</p>
          </div>
        ) : (
          <RecentTransfersSection
            transfers={transfers}
            availableLeagues={["Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1"]}
            availablePositions={["GK", "CB", "FB", "CM", "W", "ST"]}
            defaultFilters={{
              leagues: [],
              positions: [],
              targetRelatedOnly: false,
            }}
            onFilterChange={handleTransferFilterChange}
          />
        )}

        {/* AI Scout Assistant */}
        <AIScoutAssistant />
      </div>
    </>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

function StatCard({ icon, label, value, change, changeType = "neutral" }: StatCardProps) {
  const changeColorClass =
    changeType === "positive"
      ? "text-green-600"
      : changeType === "negative"
        ? "text-red-600"
        : "text-gray-600";

  return (
    <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-white border border-gray-300 hover:border-blue-600 hover:shadow-lg transition-all">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-blue-600 bg-blue-50">
          {icon}
        </div>
      </div>
      <div>
        <span className="block text-sm text-gray-500 mb-1">{label}</span>
        <div className="flex items-end justify-between">
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <span className={`text-sm font-medium ${changeColorClass}`}>{change}</span>
          )}
        </div>
      </div>
    </div>
  );
}
