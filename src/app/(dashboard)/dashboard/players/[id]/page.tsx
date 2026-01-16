"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/dashboard/Header";
import RadarChart from "@/components/charts/RadarChart";
import BarChart from "@/components/charts/BarChart";
import LineChart from "@/components/charts/LineChart";
import {
  ArrowLeft,
  Star,
  StarOff,
  Plus,
  FileText,
  Share2,
  TrendingUp,
  Calendar,
  MapPin,
  Flag,
  Ruler,
  Activity,
  Target,
  Shield,
  Zap,
  Loader2,
  ListPlus,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePlayer } from "@/lib/hooks/useSportmonks";
import { useFitScoreGate } from "@/lib/hooks/useFitScoreGate";
import {
  formatCurrency,
  getPositionColor,
  getPositionCode,
  getFitScoreColor,
  getFitScoreLabel,
  calculateAge,
  formatDate,
  formatHeight,
  formatWeight,
  getInitials,
  getCurrentTeam,
  getPrimaryPlayerStats,
} from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import FitScoreGateNotice from "@/components/FitScoreGateNotice";

type Tab = "overview" | "stats" | "career" | "analysis";

export default function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [addingToTargets, setAddingToTargets] = useState(false);
  const { watchlistIds, addToWatchlist, removeFromWatchlist, addSelectedPlayer, selectedPlayers } = useAppStore();
  const { gate, loading: gateLoading } = useFitScoreGate();

  // Fetch player data from Sportmonks API with all includes
  const { data: playerResponse, loading, error } = usePlayer(
    id,
    "position;detailedPosition;nationality;teams;statistics.details;transfers"
  );

  const player = playerResponse?.data;

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#0031FF] mx-auto mb-4" />
            <p className="text-gray-500">Loading player profile...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !player) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#2C2C2C] mb-2">
              {error ? "Error loading player" : "Player not found"}
            </h1>
            <p className="text-gray-500 mb-4">
              {error || "The player you're looking for doesn't exist."}
            </p>
            <Link href="/dashboard/search" className="text-[#0031FF] hover:underline">
              Back to search
            </Link>
          </div>
        </div>
      </>
    );
  }

  const playerId = String(player.id);
  const isInWatchlist = watchlistIds.includes(playerId);
  const isSelected = selectedPlayers.some((p) => p.id === playerId);

  // Extract player data
  const position = player.detailedPosition?.name || player.position?.name || "Unknown";
  const positionCode = getPositionCode(position);
  const nationality = player.nationality?.name || "Unknown";
  const nationalityFlag = player.nationality?.image_path;
  const age = calculateAge(player.date_of_birth);
  const currentTeam = getCurrentTeam(player);
  const marketValue = player.market_value;

  // Get statistics (latest season)
  const stats = getPrimaryPlayerStats(player)?.details || [];
  const getStatValue = (typeId: number) => {
    const stat = stats.find((s) => s.type_id === typeId);
    return stat?.value?.total || stat?.value?.average || 0;
  };

  // Common stat type IDs in Sportmonks
  const appearances = getStatValue(321);
  const goals = getStatValue(52);
  const assists = getStatValue(79);
  const minutesPlayed = getStatValue(119);
  const passAccuracy = getStatValue(83);
  const dribbleSuccess = getStatValue(86);
  const tackleSuccess = getStatValue(90);
  const aerialWon = getStatValue(88);
  const rating = getStatValue(118);

  // Fit score (we can calculate this based on various factors or just show rating)
  const fitScoreAllowed = !gateLoading && gate.unlocked;
  const fitScore = fitScoreAllowed ? Math.min(Math.round(rating * 10), 100) || undefined : undefined;

  // Prepare chart data
  const radarData = [
    { subject: "Pace", value: 75, fullMark: 100 }, // Would need specific stats
    { subject: "Shooting", value: Math.min((goals / Math.max(appearances, 1)) * 50 + 50, 100), fullMark: 100 },
    { subject: "Passing", value: passAccuracy || 70, fullMark: 100 },
    { subject: "Dribbling", value: dribbleSuccess || 65, fullMark: 100 },
    { subject: "Defending", value: tackleSuccess || 50, fullMark: 100 },
    { subject: "Physical", value: aerialWon || 60, fullMark: 100 },
  ];

  // Season stats from multiple seasons
  const seasonData = player.statistics?.slice(0, 5).map((s) => ({
    name: s.season?.name || "Season",
    goals: s.details?.find((d) => d.type_id === 52)?.value?.total || 0,
    assists: s.details?.find((d) => d.type_id === 79)?.value?.total || 0,
    rating: (s.details?.find((d) => d.type_id === 118)?.value?.average || 0) * 10,
  })).reverse() || [];

  const statsBarData = [
    { name: "Goals", value: goals, color: "#0031FF" },
    { name: "Assists", value: assists, color: "#00C896" },
    { name: "Appearances", value: appearances, color: "#FF6B35" },
    { name: "Rating", value: Math.round(rating * 10), color: "#8B5CF6" },
  ];

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "stats", label: "Statistics" },
    { id: "career", label: "Career" },
    { id: "analysis", label: "AI Analysis" },
  ];

  // Handle watchlist toggle with player data for store
  const handleWatchlistToggle = () => {
    if (isInWatchlist) {
      removeFromWatchlist(playerId);
    } else {
      addToWatchlist(playerId);
    }
  };

  // Handle adding to comparison
  const handleAddToComparison = () => {
    const playerForStore = {
      id: playerId,
      name: player.display_name || player.name || "Unknown",
      fullName: player.name || "Unknown",
      dateOfBirth: player.date_of_birth || "",
      age: age || 0,
      nationality: nationality,
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
      marketValue: marketValue || 0,
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

  // Handle adding to transfer targets
  const handleAddToTargets = async () => {
    setAddingToTargets(true);
    try {
      const response = await fetch('/api/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: Number(player.id),
          player_name: player.display_name || player.name || "Unknown",
          current_club: currentTeam?.name || null,
          position: position || null,
          age: age || null,
          nationality: nationality || null,
          market_value_eur: marketValue || null,
          priority: 'medium',
          status: 'scouting',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add to targets');
      }

      // Show success message and redirect to targets page
      router.push('/dashboard/targets');
    } catch (error) {
      console.error('Failed to add to targets:', error);
      alert(error instanceof Error ? error.message : 'Failed to add player to targets');
    } finally {
      setAddingToTargets(false);
    }
  };

  return (
    <>
      <Header />

      <div className="p-4 lg:p-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-[#2C2C2C] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        {/* Player Header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
              {player.image_path ? (
                <Image
                  src={player.image_path}
                  alt={player.display_name || player.name || "Player"}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl sm:text-4xl font-bold text-[#2C2C2C]">
                  {getInitials(player.display_name || player.name)}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#2C2C2C]">
                  {player.display_name || player.name}
                </h1>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getPositionColor(
                    position
                  )} text-white`}
                >
                  {positionCode}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {currentTeam?.name || "Free Agent"}
                </span>
                <span className="flex items-center gap-1.5">
                  {nationalityFlag && (
                    <Image
                      src={nationalityFlag}
                      alt={nationality}
                      width={16}
                      height={12}
                      className="rounded"
                    />
                  )}
                  {!nationalityFlag && <Flag className="w-4 h-4" />}
                  {nationality}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {age ? `${age} years` : "Age unknown"}
                </span>
                <span className="flex items-center gap-1">
                  <Ruler className="w-4 h-4" />
                  {formatHeight(player.height)}
                </span>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 sm:gap-6">
                <QuickStat label="Market Value" value={formatCurrency(marketValue)} />
                <QuickStat label="Weight" value={formatWeight(player.weight)} />
                <QuickStat label="Rating" value={rating ? rating.toFixed(1) : "N/A"} />
                <QuickStat label="Goals" value={String(goals)} />
              </div>
            </div>

            {/* Fit Score & Actions */}
            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 w-full sm:w-auto mt-4 sm:mt-0">
              {fitScoreAllowed ? (
                fitScore && (
                  <div className="text-center sm:text-right">
                    <p className={`text-3xl sm:text-4xl font-bold ${getFitScoreColor(fitScore)}`}>
                      {fitScore}%
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {getFitScoreLabel(fitScore)}
                    </p>
                  </div>
                )
              ) : (
                !gateLoading && <FitScoreGateNotice gate={gate} />
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleWatchlistToggle}
                  className={`p-2 rounded-xl transition-all ${
                    isInWatchlist
                      ? "bg-yellow-500/20 text-yellow-500"
                      : "bg-gray-100 text-gray-500 hover:text-yellow-500"
                  }`}
                  title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                >
                  {isInWatchlist ? (
                    <Star className="w-5 h-5 fill-current" />
                  ) : (
                    <StarOff className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={handleAddToComparison}
                  disabled={isSelected || selectedPlayers.length >= 4}
                  className={`p-2 rounded-xl transition-all ${
                    isSelected
                      ? "bg-[#0031FF]/20 text-[#0031FF]"
                      : "bg-gray-100 text-gray-500 hover:text-[#0031FF]"
                  } disabled:opacity-50`}
                  title="Add to comparison"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button
                  onClick={handleAddToTargets}
                  disabled={addingToTargets}
                  className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:text-green-600 transition-all disabled:opacity-50"
                  title="Add to transfer targets"
                >
                  {addingToTargets ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ListPlus className="w-5 h-5" />
                  )}
                </button>
                <button
                  className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:text-[#2C2C2C] transition-all"
                  title="Generate report"
                >
                  <FileText className="w-5 h-5" />
                </button>
                <button
                  className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:text-[#2C2C2C] transition-all"
                  title="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[100px] px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#0031FF] text-white"
                  : "text-gray-500 hover:text-[#2C2C2C] hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#2C2C2C] mb-4">Player Attributes</h3>
              <div className="h-[300px] sm:h-[350px]">
                <RadarChart data={radarData} />
              </div>
            </div>

            {/* Key Stats */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#2C2C2C] mb-4">Season Contributions</h3>
              <div className="h-[300px] sm:h-[350px]">
                <BarChart data={statsBarData} />
              </div>
            </div>

            {/* Info Cards */}
            <div className="lg:col-span-2 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoCard
                icon={<Target className="w-5 h-5" />}
                label="Goals per 90"
                value={minutesPlayed > 0 ? ((goals / minutesPlayed) * 90).toFixed(2) : "0.00"}
                sublabel="This season"
              />
              <InfoCard
                icon={<Zap className="w-5 h-5" />}
                label="Goals + Assists"
                value={String(goals + assists)}
                sublabel="Total contributions"
              />
              <InfoCard
                icon={<Activity className="w-5 h-5" />}
                label="Minutes Played"
                value={minutesPlayed.toLocaleString()}
                sublabel={`${appearances} appearances`}
              />
              <InfoCard
                icon={<Shield className="w-5 h-5" />}
                label="Pass Accuracy"
                value={`${passAccuracy || 0}%`}
                sublabel="Passing success"
              />
            </div>
          </div>
        )}

        {activeTab === "stats" && (
          <div className="space-y-6">
            {/* Season Trend */}
            {seasonData.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-[#2C2C2C] mb-4">Season Performance Trend</h3>
                <div className="h-[300px]">
                  <LineChart
                    data={seasonData}
                    lines={[
                      { dataKey: "goals", color: "#0031FF", name: "Goals" },
                      { dataKey: "assists", color: "#00C896", name: "Assists" },
                      { dataKey: "rating", color: "#FF6B35", name: "Rating (x10)" },
                    ]}
                  />
                </div>
              </div>
            )}

            {/* Detailed Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatsCard
                title="Attacking"
                stats={[
                  { label: "Goals", value: goals },
                  { label: "Assists", value: assists },
                  { label: "Appearances", value: appearances },
                  { label: "Minutes", value: minutesPlayed },
                ]}
              />
              <StatsCard
                title="Passing"
                stats={[
                  { label: "Pass Accuracy", value: `${passAccuracy || 0}%` },
                  { label: "Dribble Success", value: `${dribbleSuccess || 0}%` },
                ]}
              />
              <StatsCard
                title="Defending"
                stats={[
                  { label: "Tackle Success", value: `${tackleSuccess || 0}%` },
                  { label: "Aerial Won", value: `${aerialWon || 0}%` },
                ]}
              />
            </div>
          </div>
        )}

        {activeTab === "career" && (
          <div className="space-y-6">
            {/* Career History */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#2C2C2C] mb-6">Career History</h3>
              <div className="space-y-4">
                {player.teams && player.teams.length > 0 ? (
                  player.teams.map((team, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-[#f6f6f6] rounded-xl"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {team.image_path ? (
                          <Image
                            src={team.image_path}
                            alt={team.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-[#2C2C2C] font-semibold">{team.name?.[0]}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[#2C2C2C]">{team.name}</p>
                        <p className="text-sm text-gray-500">
                          {team.pivot?.start ? formatDate(team.pivot.start) : ""} -{" "}
                          {team.pivot?.end ? formatDate(team.pivot.end) : "Present"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No career history available</p>
                )}
              </div>
            </div>

            {/* Transfers */}
            {player.transfers && player.transfers.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-[#2C2C2C] mb-6">Transfer History</h3>
                <div className="space-y-3">
                  {player.transfers.map((transfer, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-[#f6f6f6] rounded-xl"
                    >
                      <div>
                        <p className="font-medium text-[#2C2C2C]">
                          {transfer.from_team?.name || "Unknown"} → {transfer.to_team?.name || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {transfer.date ? formatDate(transfer.date) : "Unknown date"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#0031FF] font-medium">
                          {formatCurrency(transfer.amount)}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{transfer.type?.name || "Transfer"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Injury History */}
            {player.sidelined && player.sidelined.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-[#2C2C2C] mb-6">Injury History</h3>
                <div className="space-y-3">
                  {player.sidelined.map((injury, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/20 rounded-xl"
                    >
                      <div>
                        <p className="font-medium text-[#2C2C2C]">{injury.type?.name || "Injury"}</p>
                        <p className="text-sm text-gray-500">
                          {injury.start_date ? formatDate(injury.start_date) : ""} -{" "}
                          {injury.end_date ? formatDate(injury.end_date) : "Unknown"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "analysis" && (
          <div className="space-y-6">
            {/* AI Summary */}
            <div className="bg-gradient-to-r from-[#0031FF]/10 to-transparent border border-[#0031FF]/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#0031FF] rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#2C2C2C]">AI Analysis Summary</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {player.display_name || player.name} is a {age ? `${age}-year-old` : ""} {position.toLowerCase()} who
                {currentTeam ? ` currently plays for ${currentTeam.name}` : ""}.
                {goals > 0 && ` This season, they have contributed ${goals} goals and ${assists} assists in ${appearances} appearances.`}
                {rating > 0 && ` Their average rating of ${rating.toFixed(1)} indicates solid performance levels.`}
                {passAccuracy > 0 && ` With ${passAccuracy}% passing accuracy, they demonstrate technical ability on the ball.`}
              </p>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-green-500 mb-4">Strengths</h3>
                <ul className="space-y-3">
                  {[
                    passAccuracy > 85 && "Excellent passing accuracy",
                    dribbleSuccess > 60 && "Strong dribbling ability",
                    goals > 10 && "Prolific goal scorer",
                    assists > 8 && "Creative playmaker",
                    tackleSuccess > 65 && "Solid defensive contribution",
                    rating > 7 && "Consistently high performer",
                  ].filter(Boolean).map((strength, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      {strength}
                    </li>
                  ))}
                  {![passAccuracy > 85, dribbleSuccess > 60, goals > 10, assists > 8, tackleSuccess > 65, rating > 7].some(Boolean) && (
                    <li className="text-gray-500">Analysis requires more data</li>
                  )}
                </ul>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-red-500 mb-4">Areas to Improve</h3>
                <ul className="space-y-3">
                  {[
                    aerialWon < 50 && aerialWon > 0 && "Aerial presence",
                    tackleSuccess < 55 && tackleSuccess > 0 && "Defensive positioning",
                    player.sidelined && player.sidelined.length > 2 && "Injury management",
                    passAccuracy < 75 && passAccuracy > 0 && "Passing accuracy",
                  ].filter(Boolean).map((weakness, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      {weakness}
                    </li>
                  ))}
                  {![aerialWon < 50 && aerialWon > 0, tackleSuccess < 55 && tackleSuccess > 0, player.sidelined && player.sidelined.length > 2, passAccuracy < 75 && passAccuracy > 0].some(Boolean) && (
                    <li className="text-gray-500">Analysis requires more data</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Generate Full Report Button */}
            <div className="flex justify-center">
              <button className="px-6 py-3 bg-[#0031FF] text-white font-semibold rounded-xl hover:bg-[#0028cc] transition-all flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Generate Full Analysis Report
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-[#2C2C2C]">{value}</p>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
  sublabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-[#0031FF]">{icon}</div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-[#2C2C2C] mb-1">{value}</p>
      <p className="text-xs text-gray-500">{sublabel}</p>
    </div>
  );
}

function StatsCard({
  title,
  stats,
}: {
  title: string;
  stats: { label: string; value: string | number }[];
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h4 className="font-semibold text-[#2C2C2C] mb-4">{title}</h4>
      <div className="space-y-3">
        {stats.map((stat, i) => (
          <div key={i} className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{stat.label}</span>
            <span className="text-sm font-medium text-[#2C2C2C]">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
