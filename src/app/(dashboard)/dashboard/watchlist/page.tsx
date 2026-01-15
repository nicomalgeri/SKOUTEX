"use client";

import { useMemo, useEffect, useState } from "react";
import Header from "@/components/dashboard/Header";
import {
  Star,
  Trash2,
  Plus,
  ArrowRight,
  TrendingUp,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAppStore } from "@/lib/store";
import { usePlayer } from "@/lib/hooks/useSportmonks";
import { useFitScoreGate } from "@/lib/hooks/useFitScoreGate";
import {
  formatCurrency,
  getPositionColor,
  getPositionCode,
  getFitScoreColor,
  calculateAge,
  getInitials,
  getCurrentTeam,
  getPrimaryPlayerStats,
} from "@/lib/utils";
import type { SportmonksPlayer } from "@/lib/sportmonks/types";
import FitScoreGateNotice from "@/components/FitScoreGateNotice";

// Component to display a single watchlist player with API data
function WatchlistPlayerCard({
  playerId,
  onRemove,
  onAddToComparison,
  isSelected,
  canAddToComparison,
  gate,
  gateLoading,
}: {
  playerId: string;
  onRemove: () => void;
  onAddToComparison: (player: SportmonksPlayer) => void;
  isSelected: boolean;
  canAddToComparison: boolean;
  gate: { unlocked: boolean; missing_required_fields: string[]; blocking_missing_fields: string[] };
  gateLoading: boolean;
}) {
  const { data: playerResponse, loading, error } = usePlayer(
    playerId,
    "position;detailedPosition;nationality;teams.team;statistics.details"
  );

  const player = playerResponse?.data;

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-200 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-48" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="bg-white border border-red-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <p className="text-gray-500">Failed to load player (ID: {playerId})</p>
          <button
            onClick={onRemove}
            className="p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  const position = player.detailedPosition?.name || player.position?.name || "Unknown";
  const positionCode = getPositionCode(position);
  const nationality = player.nationality?.name || "Unknown";
  const age = calculateAge(player.date_of_birth);
  const currentTeam = getCurrentTeam(player)?.name || "Free Agent";
  const marketValue = player.market_value;

  // Get stats from latest season
  const stats = getPrimaryPlayerStats(player)?.details || [];
  const getStatValue = (typeId: number) => {
    const stat = stats.find((s) => s.type_id === typeId);
    return stat?.value?.total || stat?.value?.average || 0;
  };

  const appearances = getStatValue(321);
  const goals = getStatValue(52);
  const assists = getStatValue(79);
  const passAccuracy = getStatValue(83);
  const rating = getStatValue(118);
  const fitScoreAllowed = !gateLoading && gate.unlocked;
  const fitScore = fitScoreAllowed ? Math.min(Math.round(rating * 10), 100) || undefined : undefined;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Avatar */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
            {player.image_path ? (
              <Image
                src={player.image_path}
                alt={player.display_name || player.name || "Player"}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-[#2C2C2C]">
                {getInitials(player.display_name || player.name)}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={`/dashboard/players/${player.id}`}
                className="font-semibold text-[#2C2C2C] hover:text-[#0031FF] transition-colors truncate"
              >
                {player.display_name || player.name}
              </Link>
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${getPositionColor(
                  position
                )} text-white flex-shrink-0`}
              >
                {positionCode}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>{currentTeam}</span>
              <span className="text-gray-400">|</span>
              <span>{age ? `${age} years` : "Age unknown"}</span>
              <span className="text-gray-400">|</span>
              <span>{nationality}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 sm:gap-8">
          <div className="text-center">
            <p className="text-sm font-semibold text-[#2C2C2C]">
              {formatCurrency(marketValue)}
            </p>
            <p className="text-xs text-gray-500">Market Value</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <p className="text-sm font-semibold text-green-500">
                {goals + assists}
              </p>
            </div>
            <p className="text-xs text-gray-500">G+A</p>
          </div>

          {fitScoreAllowed ? (
            fitScore && (
              <div className="text-center">
                <p
                  className={`text-xl font-bold ${getFitScoreColor(fitScore)}`}
                >
                  {fitScore}%
                </p>
                <p className="text-xs text-gray-500">Fit Score</p>
              </div>
            )
          ) : (
            !gateLoading && <FitScoreGateNotice gate={gate} />
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddToComparison(player)}
              disabled={isSelected || !canAddToComparison}
              className={`p-2 rounded-lg transition-all ${
                isSelected
                  ? "bg-[#0031FF]/20 text-[#0031FF]"
                  : "text-gray-500 hover:text-[#0031FF] hover:bg-[#0031FF]/10"
              } disabled:opacity-50`}
              title="Add to comparison"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={onRemove}
              className="p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
              title="Remove from watchlist"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4">
        <StatItem label="Apps" value={appearances} />
        <StatItem label="Goals" value={goals} />
        <StatItem label="Assists" value={assists} />
        <StatItem label="Pass %" value={`${passAccuracy || 0}%`} />
        <StatItem label="Rating" value={rating ? rating.toFixed(1) : "N/A"} className="hidden sm:block" />
        <StatItem
          label="Position"
          value={positionCode}
          className="hidden lg:block"
        />
      </div>
    </div>
  );
}

export default function WatchlistPage() {
  const { watchlistIds, removeFromWatchlist, addSelectedPlayer, selectedPlayers } = useAppStore();
  const { gate, loading: gateLoading } = useFitScoreGate();

  const isSelected = (playerId: string) =>
    selectedPlayers.some((p) => p.id === playerId);

  // Convert Sportmonks player to our Player type for comparison
  const handleAddToComparison = (player: SportmonksPlayer) => {
    const position = player.detailedPosition?.name || player.position?.name || "Unknown";
    const positionCode = getPositionCode(position);
    const stats = getPrimaryPlayerStats(player)?.details || [];
    const getStatValue = (typeId: number) => {
      const stat = stats.find((s) => s.type_id === typeId);
      return stat?.value?.total || stat?.value?.average || 0;
    };

    const appearances = getStatValue(321);
    const goals = getStatValue(52);
    const assists = getStatValue(79);
    const minutesPlayed = getStatValue(119);
    const passAccuracy = getStatValue(83);
    const dribbleSuccess = getStatValue(86);
    const tackleSuccess = getStatValue(90);
    const aerialWon = getStatValue(88);
    const rating = getStatValue(118);
    const fitScoreAllowed = !gateLoading && gate.unlocked;
    const fitScore = fitScoreAllowed ? Math.min(Math.round(rating * 10), 100) || undefined : undefined;

    const playerForStore = {
      id: String(player.id),
      name: player.display_name || player.name || "Unknown",
      fullName: player.name || "Unknown",
      dateOfBirth: player.date_of_birth || "",
      age: calculateAge(player.date_of_birth) || 0,
      nationality: player.nationality?.name || "Unknown",
      height: player.height || 0,
      weight: player.weight || 0,
      preferredFoot: "right" as const,
      photo: player.image_path,
      currentClub: getCurrentTeam(player)?.name || "Unknown",
      currentClubLogo: getCurrentTeam(player)?.image_path,
      league: "",
      country: player.country?.name || "",
      primaryPosition: positionCode,
      secondaryPositions: [],
      tacticalRole: position,
      contractExpiry: "",
      marketValue: player.market_value || 0,
      estimatedSalary: 0,
      transferStatus: "available" as const,
      careerHistory: [],
      injuryHistory: [],
      stats: {
        appearances,
        minutesPlayed,
        starts: appearances,
        goals,
        assists,
        shotsPerGame: 0,
        shotsOnTarget: 0,
        conversionRate: appearances > 0 ? (goals / appearances) * 100 : 0,
        xG: 0,
        xA: 0,
        passAccuracy: passAccuracy || 0,
        keyPasses: 0,
        throughBalls: 0,
        longBallAccuracy: 0,
        crossAccuracy: 0,
        tackles: 0,
        tackleSuccess: tackleSuccess || 0,
        interceptions: 0,
        clearances: 0,
        blockedShots: 0,
        aerialDuelsWon: aerialWon || 0,
        duelsWon: 0,
        dribbleSuccess: dribbleSuccess || 0,
        foulsDrawn: 0,
        foulsConceded: 0,
      },
      seasonStats: [],
      globalScore: Math.round(rating * 10) || 0,
      potential: Math.min(Math.round(rating * 10) + 10, 99),
      fitScore: fitScoreAllowed ? fitScore : undefined,
    };
    addSelectedPlayer(playerForStore);
  };

  return (
    <>
      <Header
        title="Watchlist"
        subtitle={`${watchlistIds.length} players tracked`}
      />

      <div className="p-4 lg:p-6">
        {watchlistIds.length > 0 ? (
          <div className="space-y-4">
            {watchlistIds.map((playerId) => (
              <WatchlistPlayerCard
                key={playerId}
                playerId={playerId}
                onRemove={() => removeFromWatchlist(playerId)}
                onAddToComparison={handleAddToComparison}
                isSelected={isSelected(playerId)}
                canAddToComparison={selectedPlayers.length < 4}
                gate={gate}
                gateLoading={gateLoading}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-[#2C2C2C] mb-2">
              Your watchlist is empty
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Start adding players to track their performance, market value changes,
              and receive updates when they become available.
            </p>
            <Link
              href="/dashboard/search"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0031FF] text-white font-semibold rounded-xl hover:bg-[#0028cc] transition-all"
            >
              Browse Players <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Summary Cards */}
        {watchlistIds.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <SummaryCard
              label="Total Players"
              value={watchlistIds.length.toString()}
              icon={<Star className="w-5 h-5" />}
            />
            <SummaryCard
              label="Tracking"
              value="Active"
              icon={<TrendingUp className="w-5 h-5" />}
            />
          </div>
        )}
      </div>
    </>
  );
}

function StatItem({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-[#2C2C2C]">{value}</p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-[#0031FF]">{icon}</div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-[#2C2C2C]">{value}</p>
    </div>
  );
}
