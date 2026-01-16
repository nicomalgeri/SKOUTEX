import Link from "next/link";
import { getClubForUserOrCreate } from "@/lib/auth/getUserAndClub";
import { getClubBranding } from "@/lib/club/getClubBranding";
import type { ClubContext } from "@/lib/club/context";
import { getFitScoreGate } from "@/lib/club-context/fitScoreGate";
import { scoreFit } from "@/lib/fit/scoreFit";
import { getPositionCode } from "@/lib/utils";
import KpiRing from "@/components/dashboard/KpiRing";
import RecentTransfersSection from "./RecentTransfersSection";
import {
  KPI_LABEL_MAPPINGS,
  getPositionGroup,
  type PositionGroup,
} from "@/lib/radar/kpiMappings";

type Recommendation = {
  id: string;
  name: string;
  club: string;
  position: string;
  fitScore: number | null;
  verdict: string;
  data: any;
};

type PositionNeed = {
  key: PositionGroup;
  fullName: string;
  priority: "high" | "medium" | "low";
  recommendations: Recommendation[];
};

type ReadyPlayer = {
  id: string;
  name: string;
  current_team: string | null;
  position: string | null;
  data: any;
  created_at: string;
  sportmonks_player_id: number | null;
};


const heroStats = [
  { label: "Searches Today", value: "24", delta: "+6" },
  { label: "Players Analyzed", value: "128", delta: "+12" },
  { label: "Watchlist Count", value: "42", delta: "+3" },
  { label: "Average Fit Score", value: "76", delta: "-2" },
];

const positionLabels: Record<PositionGroup, string> = {
  CB: "Centre Back",
  FB: "Full Back",
  CM: "Central Midfielder",
  W: "Winger",
  ST: "Striker",
  GK: "Goalkeeper",
};

const positionCodes: Record<PositionGroup, string[]> = {
  CB: ["CB"],
  FB: ["RB", "LB", "RWB", "LWB", "FB"],
  CM: ["CM", "CDM", "CAM", "DM", "AM"],
  W: ["LW", "RW", "LM", "RM", "W"],
  ST: ["ST", "CF", "F"],
  GK: ["GK"],
};

const defaultGroups: PositionGroup[] = ["CB", "FB", "CM", "W", "ST", "GK"];

function priorityStyle(priority: PositionNeed["priority"]) {
  if (priority === "high") return "bg-red-50 text-red-700 border-red-200";
  if (priority === "medium") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
}

function verdictColor(verdict: string) {
  if (verdict === "Excellent Fit") return "text-green-600";
  if (verdict === "Strong Fit") return "text-blue-600";
  if (verdict === "Good Fit") return "text-indigo-600";
  if (verdict === "Potential Fit") return "text-amber-600";
  return "text-gray-500";
}

function getVerdict(score: number | null): string {
  if (score === null) return "Not Assessed";
  if (score >= 85) return "Excellent Fit";
  if (score >= 75) return "Strong Fit";
  if (score >= 65) return "Good Fit";
  if (score >= 50) return "Potential Fit";
  return "Limited Fit";
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function getPercentileValue(data: any, key: string): number | null {
  const candidates = [
    data?.percentiles?.[key],
    data?.kpi_percentiles?.[key],
    data?.percentile?.[key],
    data?.metrics?.[key]?.percentile,
    data?.statistics?.percentiles?.[key],
  ];

  for (const candidate of candidates) {
    const value = toNumber(candidate);
    if (value !== null) {
      return Math.min(100, Math.max(0, value));
    }
  }

  return null;
}


function normalizeGroupFromPriority(position: string): PositionGroup {
  const raw = position.trim();
  if (!raw) return "CM";
  const upper = raw.toUpperCase();
  if (upper === "FB" || upper === "FULL BACK") return "FB";
  if (upper === "W") return "W";
  const code = getPositionCode(raw).toUpperCase();
  if (code === "FB") return "FB";
  return getPositionGroup(code);
}

function getPlayerPositionCode(player: ReadyPlayer): string {
  const rawPosition =
    player.position ||
    player.data?.detailedPosition?.name ||
    player.data?.position?.name ||
    player.data?.position ||
    "";
  return getPositionCode(rawPosition);
}

function buildPriorityLevels(groups: PositionGroup[]): PositionNeed["priority"][] {
  return groups.map((_, index) => {
    if (index < 2) return "high";
    if (index < 4) return "medium";
    return "low";
  });
}

export default async function PremiumDashboardPage() {
  const branding = await getClubBranding();
  const { club, supabase } = await getClubForUserOrCreate();
  const clubContext = (club.club_context as Partial<ClubContext>) ?? {};
  const gate = getFitScoreGate(clubContext);
  const defaultLeague = clubContext.identity?.league || "Premier League";
  const primaryLeagueMissing = !clubContext.identity?.league;

  const { data: inboundTargets } = await supabase
    .from("inbound_targets")
    .select(
      "id, status, created_at, player_id, players(id, name, current_team, position, data, sportmonks_player_id)"
    )
    .eq("club_id", club.id)
    .eq("status", "READY")
    .order("created_at", { ascending: false });

  const readyPlayers: ReadyPlayer[] = (inboundTargets ?? [])
    .map((target: any) => {
      const player = Array.isArray(target.players)
        ? target.players[0]
        : target.players;
      if (!player) return null;
      return {
        id: player.id,
        name: player.name,
        current_team: player.current_team,
        position: player.position,
        data: player.data,
        created_at: target.created_at,
        sportmonks_player_id: player.sportmonks_player_id ?? null,
      } as ReadyPlayer;
    })
    .filter(Boolean) as ReadyPlayer[];

  const fallbackRecommendations: Recommendation[] = readyPlayers
    .slice(0, 2)
    .map((player) => ({
      id: player.id,
      name: player.name,
      club: player.current_team ?? "Unknown club",
      position: getPlayerPositionCode(player),
      fitScore: null,
      verdict: "Not Assessed",
      data: player.data,
    }));

  const priorityPositions = clubContext.recruitment?.priority_positions ?? [];
  const uniqueGroups: PositionGroup[] = [];
  for (const pos of priorityPositions) {
    const group = normalizeGroupFromPriority(pos);
    if (!uniqueGroups.includes(group)) {
      uniqueGroups.push(group);
    }
  }
  const activeGroups = uniqueGroups.length > 0 ? uniqueGroups : defaultGroups;
  const priorities = buildPriorityLevels(activeGroups);

  const positionNeeds: PositionNeed[] = activeGroups.map((groupKey, index) => {
    const matchesGroup = (player: ReadyPlayer) =>
      positionCodes[groupKey].includes(getPlayerPositionCode(player));

    let recommendations: Recommendation[] = [];

    if (gate.unlocked) {
      const scoredCandidates = readyPlayers
        .filter(matchesGroup)
        .map((player) => {
          if (!player.data) return null;
          const fitResult = scoreFit(player.data, clubContext as ClubContext);
          return {
            id: player.id,
            name: player.name,
            club: player.current_team ?? "Unknown club",
            position: getPlayerPositionCode(player),
            fitScore: fitResult?.score ?? null,
            verdict: getVerdict(fitResult?.score ?? null),
            data: player.data,
          } as Recommendation;
        })
        .filter(Boolean) as Recommendation[];

      scoredCandidates.sort(
        (a, b) => (b.fitScore ?? -1) - (a.fitScore ?? -1)
      );

      if (scoredCandidates.length >= 2) {
        recommendations = scoredCandidates.slice(0, 2);
      }
    }

    if (recommendations.length < 2) {
      recommendations = fallbackRecommendations;
    }

    return {
      key: groupKey,
      fullName: positionLabels[groupKey],
      priority: priorities[index] ?? "low",
      recommendations,
    } as PositionNeed;
  });

  const targetPlayerNames = Array.from(
    new Set([
      ...readyPlayers.map((player) => player.name),
      ...positionNeeds.flatMap((need) =>
        need.recommendations.map((player) => player.name)
      ),
    ])
  );

  const targetPlayerIds = Array.from(
    new Set(
      readyPlayers
        .map((player) => player.sportmonks_player_id)
        .filter((id): id is number => typeof id === "number")
    )
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
              <span className="text-sm font-semibold text-blue-600">S</span>
            </div>
          )}
          <span className="text-base font-semibold text-gray-900">
            {branding.name}
          </span>
        </div>
        <section className="premium-animate rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {stat.label}
                </div>
                <div className="mt-2 text-2xl font-semibold text-gray-900">
                  {stat.value}
                </div>
                <div
                  className={`mt-1 text-xs font-semibold ${
                    stat.delta.startsWith("+") ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {stat.delta} vs last 24h
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="premium-animate-delay-2 mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Current Position Targets</h2>
              <p className="mt-1 text-sm text-gray-500">
                AI recommendations grouped by positional needs
              </p>
            </div>
            <Link
              href="/dashboard/targets"
              className="hidden min-h-[40px] items-center justify-center rounded-full border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 sm:inline-flex"
            >
              View All Targets
            </Link>
          </div>

          <div className="mt-6 space-y-6">
            {positionNeeds.map((need) => (
              <div
                key={need.key}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-lg font-semibold text-gray-900">{need.fullName}</div>
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${priorityStyle(
                      need.priority
                    )}`}
                  >
                    {need.priority.toUpperCase()} PRIORITY
                  </span>
                </div>

                {need.recommendations.length === 0 ? (
                  <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                    No ready inbound targets available yet.
                  </div>
                ) : (
                  <div className="mt-4 flex gap-4 overflow-x-auto pb-2 pt-2 snap-x snap-mandatory">
                    {need.recommendations.map((player) => (
                      <div
                        key={player.id}
                        className="min-w-[260px] snap-start rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md sm:min-w-[280px]"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {player.name}
                            </div>
                            <div className="text-xs text-gray-500">{player.club}</div>
                          </div>
                          <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">
                            {player.position}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div>
                            <div className="text-xs uppercase tracking-wide text-gray-400">
                              Fit Score
                            </div>
                            <div className="text-2xl font-semibold text-gray-900">
                              {player.fitScore ?? "—"}
                            </div>
                            <div className={`text-xs font-semibold ${verdictColor(player.verdict)}`}>
                              {player.verdict}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {KPI_LABEL_MAPPINGS[need.key].slice(0, 4).map((kpi) => (
                              <KpiRing
                                key={kpi.key}
                                title={kpi.label}
                                value={getPercentileValue(player.data, kpi.key)}
                                size={48}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Link
                            href={`/players/${player.id}`}
                            className="flex min-h-[40px] flex-1 items-center justify-center rounded-full border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                          >
                            View Profile
                          </Link>
                          <button className="flex min-h-[40px] flex-1 items-center justify-center rounded-full bg-blue-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-blue-700">
                            Add to Shortlist
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <RecentTransfersSection
          defaultLeague={defaultLeague}
          primaryLeagueMissing={primaryLeagueMissing}
          targetPlayerNames={targetPlayerNames}
          targetPlayerIds={targetPlayerIds}
        />

        <section className="premium-animate-delay-4 mt-8 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-lg font-semibold">Need player recommendations?</div>
              <div className="mt-1 text-sm text-blue-100">
                Get intelligent, data-driven suggestions from our AI Scout Assistant.
              </div>
              <div className="mt-2 text-xs text-blue-100">
                ✨ Powered by GPT-4 • Context-aware • Real-time insights
              </div>
            </div>
            <Link
              href="/dashboard/chat"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
            >
              Open Scout Assistant
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
