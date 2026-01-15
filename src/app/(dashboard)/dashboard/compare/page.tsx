"use client";

import { useState, useEffect } from "react";
import Header from "@/components/dashboard/Header";
import RadarChart from "@/components/charts/RadarChart";
import {
  X,
  Plus,
  Search,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAppStore } from "@/lib/store";
import { usePlayerSearch } from "@/lib/hooks/useSportmonks";
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
import type { Player } from "@/lib/types";
import type { SportmonksPlayer } from "@/lib/sportmonks/types";
import FitScoreGateNotice from "@/components/FitScoreGateNotice";

export default function ComparePage() {
  const { selectedPlayers, removeSelectedPlayer, addSelectedPlayer, clearSelectedPlayers } = useAppStore();
  const { gate, loading: gateLoading } = useFitScoreGate();
  const fitScoreAllowed = !gateLoading && gate.unlocked;
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch search results from API
  const { data: searchResponse, loading: searchLoading } = usePlayerSearch(
    debouncedQuery.length >= 2 ? debouncedQuery : null,
    "position;detailedPosition;nationality;teams.team;statistics.details"
  );

  const searchResults = (searchResponse?.data || []).filter(
    (p) => !selectedPlayers.find((sp) => sp.id === String(p.id))
  );

  // Convert Sportmonks player to our Player type
  const convertPlayer = (player: SportmonksPlayer): Player => {
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

    const currentTeam = getCurrentTeam(player);
    return {
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
      currentClub: currentTeam?.name || "Unknown",
      currentClubLogo: currentTeam?.image_path,
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
  };

  const handleAddPlayer = (player: SportmonksPlayer) => {
    addSelectedPlayer(convertPlayer(player));
    setSearchQuery("");
    setShowSearch(false);
  };

  // Prepare comparison data
  const comparisonStats = [
    { key: "goals", label: "Goals" },
    { key: "assists", label: "Assists" },
    { key: "passAccuracy", label: "Pass %" },
    { key: "dribbleSuccess", label: "Dribble %" },
    { key: "tackleSuccess", label: "Tackle %" },
    { key: "aerialDuelsWon", label: "Aerial %" },
    { key: "appearances", label: "Appearances" },
  ];

  // Prepare radar data for comparison
  const radarData = [
    { subject: "Pace", fullMark: 100 },
    { subject: "Shooting", fullMark: 100 },
    { subject: "Passing", fullMark: 100 },
    { subject: "Dribbling", fullMark: 100 },
    { subject: "Defending", fullMark: 100 },
    { subject: "Physical", fullMark: 100 },
  ].map((item) => {
    const result: { subject: string; fullMark: number; [key: string]: number | string } = { ...item };
    selectedPlayers.forEach((player, index) => {
      const values: Record<string, number> = {
        Pace: 75 + Math.random() * 15,
        Shooting: Math.min((player.stats.goals / Math.max(player.stats.appearances, 1)) * 50 + 50, 100),
        Passing: player.stats.passAccuracy || 70,
        Dribbling: player.stats.dribbleSuccess || 65,
        Defending: player.stats.tackleSuccess || 50,
        Physical: player.stats.aerialDuelsWon || 60,
      };
      result[`player${index}`] = values[item.subject] || 50;
    });
    return result;
  });

  const colors = ["#0031FF", "#00C896", "#FF6B35", "#8B5CF6"];

  return (
    <>
      <Header title="Compare Players" subtitle="Side-by-side analysis" />

      <div className="p-4 lg:p-6">
        {/* Selected Players */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[0, 1, 2, 3].map((index) => {
            const player = selectedPlayers[index];

            if (player) {
              return (
                <div
                  key={player.id}
                  className="bg-white border-2 rounded-2xl p-4 relative"
                  style={{ borderColor: colors[index] }}
                >
                  <button
                    onClick={() => removeSelectedPlayer(player.id)}
                    className="absolute top-2 right-2 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:text-[#2C2C2C] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="text-center">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden"
                      style={{ backgroundColor: `${colors[index]}20` }}
                    >
                      {player.photo ? (
                        <Image
                          src={player.photo}
                          alt={player.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold" style={{ color: colors[index] }}>
                          {getInitials(player.name)}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/dashboard/players/${player.id}`}
                      className="font-semibold text-[#2C2C2C] hover:text-[#0031FF] transition-colors block truncate"
                    >
                      {player.name}
                    </Link>
                    <p className="text-sm text-gray-500 truncate">{player.currentClub}</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${getPositionColor(
                          player.primaryPosition
                        )} text-white`}
                      >
                        {player.primaryPosition}
                      </span>
                      <span className="text-sm text-gray-500">{player.age}y</span>
                    </div>
                    {fitScoreAllowed ? (
                      player.fitScore && (
                        <p className={`text-lg font-bold mt-2 ${getFitScoreColor(player.fitScore)}`}>
                          {player.fitScore}%
                        </p>
                      )
                    ) : (
                      !gateLoading && <FitScoreGateNotice gate={gate} />
                    )}
                  </div>
                </div>
              );
            }

            return (
              <button
                key={index}
                onClick={() => setShowSearch(true)}
                className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[200px] hover:border-[#0031FF] transition-all group"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-[#0031FF]/20 transition-all">
                  <Plus className="w-6 h-6 text-gray-500 group-hover:text-[#0031FF]" />
                </div>
                <span className="text-sm text-gray-500 group-hover:text-[#2C2C2C] transition-colors">
                  Add Player
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Modal */}
        {showSearch && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowSearch(false)}
            />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 z-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#2C2C2C]">Add Player</h3>
                <button
                  onClick={() => setShowSearch(false)}
                  className="text-gray-500 hover:text-[#2C2C2C]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search players..."
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-[#f6f6f6] border border-gray-300 rounded-xl text-[#2C2C2C] placeholder-gray-500 focus:outline-none focus:border-[#0031FF]"
                />
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {searchLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#0031FF]" />
                  </div>
                )}

                {!searchLoading && searchResults.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => handleAddPlayer(player)}
                    className="w-full flex items-center gap-3 p-3 bg-[#f6f6f6] rounded-xl hover:bg-gray-100 transition-all text-left"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                      {player.image_path ? (
                        <Image
                          src={player.image_path}
                          alt={player.display_name || player.name || ""}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[#2C2C2C] font-medium">
                          {getInitials(player.display_name || player.name)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#2C2C2C] truncate">
                        {player.display_name || player.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {getCurrentTeam(player)?.name || "Free Agent"}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${getPositionColor(
                        player.detailedPosition?.name || player.position?.name
                      )} text-white`}
                    >
                      {getPositionCode(player.detailedPosition?.name || player.position?.name)}
                    </span>
                  </button>
                ))}

                {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No players found</p>
                )}

                {!searchLoading && searchQuery.length < 2 && (
                  <p className="text-center text-gray-500 py-4">Type at least 2 characters to search</p>
                )}
              </div>
            </div>
          </>
        )}

        {selectedPlayers.length >= 2 ? (
          <>
            {/* Clear Button */}
            <div className="flex justify-end mb-6">
              <button
                onClick={clearSelectedPlayers}
                className="text-sm text-gray-500 hover:text-[#2C2C2C] transition-colors"
              >
                Clear comparison
              </button>
            </div>

            {/* Radar Comparison */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-[#2C2C2C] mb-4">Attribute Comparison</h3>
              <div className="h-[350px] sm:h-[400px]">
                <RadarChart
                  data={radarData.map((d) => ({
                    subject: d.subject,
                    value: d.player0 as number || 0,
                    fullMark: d.fullMark,
                    compareValue: d.player1 as number || undefined,
                  }))}
                  compareLabel={selectedPlayers[1]?.name}
                />
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {selectedPlayers.slice(0, 2).map((player, index) => (
                  <div key={player.id} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: colors[index] }}
                    />
                    <span className="text-sm text-gray-500">{player.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Table */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-4 text-left text-sm font-medium text-gray-500">
                        Statistic
                      </th>
                      {selectedPlayers.map((player, index) => (
                        <th
                          key={player.id}
                          className="px-4 py-4 text-center text-sm font-medium"
                          style={{ color: colors[index] }}
                        >
                          {player.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Basic Info */}
                    <tr className="border-b border-gray-100">
                      <td className="px-4 py-3 text-sm text-gray-500">Age</td>
                      {selectedPlayers.map((player) => (
                        <td key={player.id} className="px-4 py-3 text-center text-sm text-[#2C2C2C]">
                          {player.age}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="px-4 py-3 text-sm text-gray-500">Market Value</td>
                      {selectedPlayers.map((player) => (
                        <td key={player.id} className="px-4 py-3 text-center text-sm text-[#2C2C2C]">
                          {formatCurrency(player.marketValue)}
                        </td>
                      ))}
                    </tr>
                    {fitScoreAllowed ? (
                      <tr className="border-b border-gray-100">
                        <td className="px-4 py-3 text-sm text-gray-500">Fit Score</td>
                        {selectedPlayers.map((player) => (
                          <td
                            key={player.id}
                            className={`px-4 py-3 text-center text-sm font-bold ${getFitScoreColor(
                              player.fitScore || 0
                            )}`}
                          >
                            {player.fitScore ? `${player.fitScore}%` : "N/A"}
                          </td>
                        ))}
                      </tr>
                    ) : (
                      !gateLoading && (
                        <tr className="border-b border-gray-100">
                          <td colSpan={selectedPlayers.length + 1} className="px-4 py-3">
                            <FitScoreGateNotice gate={gate} />
                          </td>
                        </tr>
                      )
                    )}

                    {/* Stats */}
                    {comparisonStats.map((stat) => {
                      const values = selectedPlayers.map((p) => {
                        const value = p.stats[stat.key as keyof typeof p.stats];
                        return typeof value === "number" ? value : 0;
                      });
                      const maxValue = Math.max(...values);

                      return (
                        <tr key={stat.key} className="border-b border-gray-100">
                          <td className="px-4 py-3 text-sm text-gray-500">{stat.label}</td>
                          {selectedPlayers.map((player, index) => {
                            const value = player.stats[stat.key as keyof typeof player.stats];
                            const numValue = typeof value === "number" ? value : 0;
                            const isMax = numValue === maxValue && values.filter((v) => v === maxValue).length === 1;

                            return (
                              <td
                                key={player.id}
                                className={`px-4 py-3 text-center text-sm ${
                                  isMax ? "text-green-500 font-semibold" : "text-[#2C2C2C]"
                                }`}
                              >
                                {typeof value === "number" ? value.toFixed(1) : value}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-[#2C2C2C] mb-2">Add players to compare</h3>
            <p className="text-gray-500 mb-6">
              Select at least 2 players to see a side-by-side comparison
            </p>
            <Link
              href="/dashboard/search"
              className="inline-flex items-center gap-2 text-[#0031FF] hover:text-[#0050FF] transition-colors"
            >
              Browse players <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
