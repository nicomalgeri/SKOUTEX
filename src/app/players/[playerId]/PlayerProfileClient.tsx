"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { calculateAge, getInitials } from "@/lib/utils";
import {
  CompetitionFilter,
  getInjuries,
  getLastMatches,
  getSeasonList,
  getSeasonStatsTable,
  getSeasonSummary,
  getSuspensions,
  getTransfersTimeline,
  getVideoLinks,
} from "./playerData";

type PlayerProfileClientProps = {
  player: {
    id: string;
    name: string;
    position: string | null;
    current_team: string | null;
    nationality: string | null;
    dob: string | null;
    last_fetched_at: string | null;
  };
  data: any;
  fit: {
    score: number | null;
    verdict: string;
    strengths: string[];
    concerns: string[];
    gateUnlocked: boolean;
    missingFields: string[];
  };
};

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "statistics", label: "Statistics" },
  { id: "career", label: "Career" },
  { id: "scouting", label: "Scouting" },
  { id: "physical", label: "Physical" },
  { id: "video", label: "Video" },
  { id: "reports", label: "Reports" },
] as const;

type TabId = (typeof tabs)[number]["id"];

type DisplayState = {
  tab: TabId;
  season: string;
  competition: CompetitionFilter;
};

function formatRelativeTime(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return null;
  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSeconds < 60) return "Updated just now";
  if (diffSeconds < 3600) return `Updated ${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `Updated ${Math.floor(diffSeconds / 3600)}h ago`;
  if (diffSeconds < 2592000) return `Updated ${Math.floor(diffSeconds / 86400)}d ago`;
  return `Updated ${Math.floor(diffSeconds / 2592000)}mo ago`;
}

function formatShortDate(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function formatNumber(value: number | null, fallback = "—"): string {
  if (value === null || value === undefined || Number.isNaN(value)) return fallback;
  return value.toLocaleString("en-GB");
}

function getBarColor(value: number): string {
  if (value >= 90) return "bg-emerald-500";
  if (value >= 75) return "bg-indigo-500";
  if (value >= 50) return "bg-blue-500";
  return "bg-gray-300";
}

function resolveCurrentTeam(data: any, fallback?: string | null): string | null {
  const teams = data?.teams ?? [];
  if (Array.isArray(teams) && teams.length > 0) {
    const activeTeam =
      teams.find((team: any) => team?.pivot?.end === null || !team?.pivot?.end || !team?.end) ??
      teams[0];
    return activeTeam?.team?.name || activeTeam?.name || fallback || null;
  }
  return data?.currentTeam?.name || fallback || null;
}

function renderEmptyState(text: string) {
  return (
    <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
      {text}
    </div>
  );
}

export default function PlayerProfileClient({ player, data, fit }: PlayerProfileClientProps) {
  const seasons = useMemo(() => getSeasonList(data), [data]);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [season, setSeason] = useState(seasons[0] ?? "Career Total");
  const [competition, setCompetition] = useState<CompetitionFilter>("All");
  const [displayState, setDisplayState] = useState<DisplayState>({
    tab: "overview",
    season: seasons[0] ?? "Career Total",
    competition: "All",
  });
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (
      displayState.tab === activeTab &&
      displayState.season === season &&
      displayState.competition === competition
    ) {
      return;
    }
    setIsFading(true);
    const swapTimer = window.setTimeout(() => {
      setDisplayState({ tab: activeTab, season, competition });
    }, 150);
    const fadeTimer = window.setTimeout(() => {
      setIsFading(false);
    }, 300);
    return () => {
      window.clearTimeout(swapTimer);
      window.clearTimeout(fadeTimer);
    };
  }, [activeTab, season, competition, displayState]);

  useEffect(() => {
    if (!seasons.includes(season) && seasons.length > 0) {
      setSeason(seasons[0]);
    }
  }, [seasons, season]);

  const summary = useMemo(
    () => getSeasonSummary(data, displayState.season, displayState.competition),
    [data, displayState]
  );

  const lastMatches = useMemo(() => getLastMatches(data), [data]);
  const transfers = useMemo(() => getTransfersTimeline(data), [data]);
  const injuries = useMemo(() => getInjuries(data), [data]);
  const suspensions = useMemo(() => getSuspensions(data), [data]);
  const seasonTable = useMemo(() => getSeasonStatsTable(data), [data]);
  const videoLinks = useMemo(() => getVideoLinks(data), [data]);

  const positionLabel =
    data?.detailedPosition?.name || data?.position?.name || player.position || "Unknown position";
  const age = calculateAge(player.dob);
  const currentTeam = resolveCurrentTeam(data, player.current_team);
  const nationality = data?.nationality?.name || player.nationality || "Unknown";
  const marketValue =
    data?.market_value !== undefined && data?.market_value !== null
      ? `€${data.market_value}M`
      : null;
  const contractEnd = formatShortDate(
    data?.teams?.find((team: any) => team?.pivot?.end)?.pivot?.end ?? null
  );
  const updatedLabel = formatRelativeTime(player.last_fetched_at);

  const quickStats = {
    fit: fit.score,
    apps: summary?.appearances ?? null,
    goals: summary?.goals ?? null,
    assists: summary?.assists ?? null,
  };

  const per90 = useMemo(() => {
    if (!summary?.minutes || summary.minutes <= 0) return null;
    return {
      goals: summary.goals !== null ? (summary.goals / summary.minutes) * 90 : null,
      assists: summary.assists !== null ? (summary.assists / summary.minutes) * 90 : null,
      minsPerApp:
        summary.appearances && summary.appearances > 0
          ? summary.minutes / summary.appearances
          : null,
    };
  }, [summary]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-gray-200 bg-white px-5 py-6 shadow-sm sm:px-8">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <Link
              href="/dashboard/search"
              className="inline-flex min-h-[44px] items-center gap-2 text-gray-500 transition-colors hover:text-gray-800"
            >
              <span className="text-base">←</span>
              <span>Back to Search</span>
            </Link>
            <div className="flex items-center gap-2">
              <button className="min-h-[44px] rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-700">
                + Add to Watchlist
              </button>
              <button
                className="flex min-h-[44px] w-11 items-center justify-center rounded-full border border-gray-200 text-lg text-gray-600 transition-colors hover:bg-gray-50"
                aria-label="More actions"
              >
                ⋮
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-5">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-gray-100 text-lg font-semibold text-gray-500 sm:h-24 sm:w-24 md:h-28 md:w-28">
                {data?.image_path ? (
                  <img
                    src={data.image_path}
                    alt={player.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span>{getInitials(player.name)}</span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  {player.name}
                </h1>
                <div className="mt-1 text-sm text-gray-600">
                  {positionLabel} • {age ? `${age} years old` : "Age N/A"}
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {currentTeam ?? "Club N/A"} • {nationality}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {marketValue && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      Market Value: {marketValue}
                    </span>
                  )}
                  {contractEnd && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      Contract: {contractEnd}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="grid w-full grid-cols-2 gap-3 text-center text-sm text-gray-700 sm:grid-cols-4 md:max-w-md">
              {[
                { label: "Fit", value: quickStats.fit },
                { label: "Apps", value: quickStats.apps },
                { label: "Goals", value: quickStats.goals },
                { label: "Assists", value: quickStats.assists },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3"
                >
                  <div className="text-xs uppercase tracking-wide text-gray-400">
                    {stat.label}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-gray-900">
                    {stat.value ?? "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </header>

        <div className="mt-8">
          <div className="relative border-b border-gray-200">
            <div className="flex h-14 items-center gap-6 overflow-x-auto pb-1 pt-1 text-sm font-medium text-gray-500 sm:gap-8 sm:text-base">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`min-h-[48px] snap-start whitespace-nowrap border-b-2 px-1 pb-3 transition-colors ${
                      isActive
                        ? "border-[#0031FF] font-semibold text-gray-900"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                    aria-selected={isActive}
                    role="tab"
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-gray-50 to-transparent sm:hidden" />
          </div>

          <div className="sticky top-0 z-20 -mx-4 bg-gray-50/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 flex-col gap-3 md:flex-row">
                <label className="flex flex-1 flex-col text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Season
                  <select
                    className="mt-2 min-h-[48px] rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700"
                    value={season}
                    onChange={(event) => setSeason(event.target.value)}
                  >
                    {seasons.map((seasonName) => (
                      <option key={seasonName} value={seasonName}>
                        {seasonName}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-1 flex-col text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Competition
                  <select
                    className="mt-2 min-h-[48px] rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700"
                    value={competition}
                    onChange={(event) =>
                      setCompetition(event.target.value as CompetitionFilter)
                    }
                  >
                    {["All", "League", "Cup", "Europe", "International"].map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {updatedLabel && (
                <div className="text-xs text-gray-500 md:text-right">{updatedLabel}</div>
              )}
            </div>
          </div>

          <div
            className={`mt-6 transition-opacity duration-300 ${
              isFading ? "opacity-0" : "opacity-100"
            }`}
          >
            {displayState.tab === "overview" && (
              <div className="space-y-6">
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {displayState.season} Season Summary
                  </div>
                  {summary ? (
                    <>
                      <div className="mt-4 grid grid-cols-2 gap-4 text-center text-sm text-gray-600 sm:grid-cols-4">
                        {[
                          { label: "Appearances", value: summary.appearances },
                          { label: "Goals", value: summary.goals },
                          { label: "Assists", value: summary.assists },
                          { label: "Minutes", value: summary.minutes },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-4"
                          >
                            <div className="text-xs uppercase tracking-wide text-gray-400">
                              {item.label}
                            </div>
                            <div className="mt-2 text-lg font-semibold text-gray-900">
                              {item.value ?? "—"}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {summary.kpis.every((kpi) => kpi.value === null) ? (
                          <div className="col-span-full">
                            {renderEmptyState("Data temporarily unavailable")}
                          </div>
                        ) : (
                          summary.kpis.map((kpi) => {
                            const value = kpi.value;
                            const barValue = value !== null ? Math.min(Math.max(value, 0), 100) : 0;
                            return (
                              <div
                                key={kpi.label}
                                className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                              >
                                <div className="text-sm font-medium text-gray-700">
                                  {kpi.label}
                                </div>
                                <div className="mt-1 text-sm text-gray-500">
                                  {value === null
                                    ? "Data temporarily unavailable"
                                    : kpi.format === "percent"
                                      ? `${value.toFixed(1)}%`
                                      : kpi.format === "per90"
                                        ? `${value.toFixed(1)} per 90`
                                        : value.toFixed(1)}
                                </div>
                                <div className="mt-3 h-2 w-full rounded-full bg-gray-200">
                                  <div
                                    className={`h-2 rounded-full ${getBarColor(barValue)}`}
                                    style={{ width: `${barValue}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="mt-4">{renderEmptyState("Data temporarily unavailable")}</div>
                  )}
                </section>

                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="text-sm font-semibold text-gray-900">Last 5 Matches</div>
                  {lastMatches.length > 0 ? (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-xs uppercase tracking-wide text-gray-400">
                          <tr>
                            <th className="py-2 text-left">Date</th>
                            <th className="py-2 text-left">Opponent</th>
                            <th className="py-2 text-left">Competition</th>
                            <th className="py-2 text-left">Result</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-gray-700">
                          {lastMatches.map((match, index) => (
                            <tr key={`${match.fixture?.starting_at ?? index}`}>
                              <td className="py-3">
                                {match.fixture?.starting_at
                                  ? new Date(match.fixture.starting_at).toLocaleDateString("en-GB")
                                  : "—"}
                              </td>
                              <td className="py-3">{match.team?.name ?? "—"}</td>
                              <td className="py-3">{match.fixture?.league?.name ?? "—"}</td>
                              <td className="py-3">{match.fixture?.result_info ?? "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="mt-4">{renderEmptyState("Data temporarily unavailable")}</div>
                  )}
                </section>

                <section className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
                  <div className="text-sm font-semibold text-gray-900">Performance Radar</div>
                  <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-sm text-gray-500">
                    Coming soon
                  </div>
                </section>
              </div>
            )}

            {displayState.tab === "statistics" && (
              <div className="space-y-6">
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="text-sm font-semibold text-gray-900">Per 90 Metrics</div>
                  {per90 ? (
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      {[
                        { label: "Goals per 90", value: per90.goals },
                        { label: "Assists per 90", value: per90.assists },
                        { label: "Minutes per App", value: per90.minsPerApp },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4"
                        >
                          <div className="text-xs uppercase tracking-wide text-gray-400">
                            {item.label}
                          </div>
                          <div className="mt-2 text-lg font-semibold text-gray-900">
                            {item.value !== null && item.value !== undefined
                              ? item.value.toFixed(2)
                              : "—"}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4">{renderEmptyState("Data temporarily unavailable")}</div>
                  )}
                </section>

                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="text-sm font-semibold text-gray-900">Percentile vs Cohort</div>
                  <div className="mt-4">{renderEmptyState("Data temporarily unavailable")}</div>
                </section>
              </div>
            )}

            {displayState.tab === "career" && (
              <div className="space-y-6">
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="text-sm font-semibold text-gray-900">Career Timeline</div>
                  {transfers.length > 0 ? (
                    <div className="mt-6 space-y-6">
                      {transfers.map((transfer) => {
                        const fromTeam =
                          transfer.fromTeam?.name ||
                          transfer.fromteam?.name ||
                          transfer.from_team?.name ||
                          "Unknown";
                        const toTeam =
                          transfer.toTeam?.name ||
                          transfer.toteam?.name ||
                          transfer.to_team?.name ||
                          "Unknown";
                        return (
                          <div key={`${transfer.id}-${transfer.date}`} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="h-3 w-3 rounded-full bg-blue-600" />
                              <div className="mt-2 h-full w-px bg-blue-200" />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                {transfer.date ? new Date(transfer.date).getFullYear() : "—"}
                              </div>
                              <div className="mt-2 text-sm font-semibold text-gray-900">
                                Transfer • {transfer.date ?? "Date unavailable"}
                              </div>
                              <div className="mt-1 text-sm text-gray-600">
                                {toTeam} ← {fromTeam}
                              </div>
                              <div className="mt-2 text-sm text-gray-500">
                                {transfer.amount
                                  ? `€${transfer.amount}M`
                                  : "Undisclosed"}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-4">{renderEmptyState("No recent transfer activity")}</div>
                  )}
                </section>

                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="text-sm font-semibold text-gray-900">Season by Season</div>
                  {seasonTable && seasonTable.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {seasonTable.map((row) => (
                        <details
                          key={row.season}
                          className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
                        >
                          <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-gray-700">
                            <span>{row.season}</span>
                            <span className="text-xs text-gray-400">View stats</span>
                          </summary>
                          <div className="mt-3 grid gap-3 text-sm text-gray-600 sm:grid-cols-4">
                            <div>
                              <div className="text-xs uppercase tracking-wide text-gray-400">
                                Team
                              </div>
                              <div className="mt-1 font-medium text-gray-700">
                                {row.team ?? "—"}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs uppercase tracking-wide text-gray-400">
                                Apps
                              </div>
                              <div className="mt-1 font-medium text-gray-700">
                                {formatNumber(row.appearances)}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs uppercase tracking-wide text-gray-400">
                                Goals
                              </div>
                              <div className="mt-1 font-medium text-gray-700">
                                {formatNumber(row.goals)}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs uppercase tracking-wide text-gray-400">
                                Assists
                              </div>
                              <div className="mt-1 font-medium text-gray-700">
                                {formatNumber(row.assists)}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs uppercase tracking-wide text-gray-400">
                                Minutes
                              </div>
                              <div className="mt-1 font-medium text-gray-700">
                                {formatNumber(row.minutes)}
                              </div>
                            </div>
                          </div>
                        </details>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4">{renderEmptyState("Data temporarily unavailable")}</div>
                  )}
                </section>
              </div>
            )}

            {displayState.tab === "scouting" && (
              <div className="space-y-6">
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="text-sm font-semibold text-gray-900">Strengths & Risks</div>
                  {fit.gateUnlocked ? (
                    fit.strengths.length === 0 && fit.concerns.length === 0 ? (
                      <div className="mt-4">{renderEmptyState("Insufficient data for detailed assessment")}</div>
                    ) : (
                      <div className="mt-4 grid gap-6 md:grid-cols-2">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                            Strengths
                          </div>
                          <ul className="mt-3 space-y-2 text-sm text-gray-700">
                            {fit.strengths.slice(0, 4).map((item) => (
                              <li key={item} className="flex items-start gap-2">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                            Risks
                          </div>
                          <ul className="mt-3 space-y-2 text-sm text-gray-700">
                            {fit.concerns.slice(0, 4).map((item) => (
                              <li key={item} className="flex items-start gap-2">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-500" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="mt-4">{renderEmptyState("Insufficient data for detailed assessment")}</div>
                  )}
                </section>

                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="text-sm font-semibold text-gray-900">Fit Analysis</div>
                  {fit.gateUnlocked ? (
                    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-700">
                      Fit score: <span className="font-semibold">{fit.score ?? "—"}</span> •
                      Verdict: <span className="font-semibold">{fit.verdict}</span>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-600">
                      You need to complete your club profile to see fit analysis
                      <div className="mt-3 flex justify-center">
                        <Link
                          href="/onboarding"
                          className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          Complete Profile
                        </Link>
                      </div>
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="text-sm font-semibold text-gray-900">Notes</div>
                  <div className="mt-4">{renderEmptyState("No internal notes yet. Add the first note.")}</div>
                </section>
              </div>
            )}

            {displayState.tab === "physical" && (
              <div className="space-y-6">
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="text-sm font-semibold text-gray-900">Physical Attributes</div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    {[
                      { label: "Height", value: data?.height ? `${data.height} cm` : "N/A" },
                      { label: "Weight", value: data?.weight ? `${data.weight} kg` : "N/A" },
                      { label: "Preferred Foot", value: data?.preferred_foot ?? "N/A" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4"
                      >
                        <div className="text-xs uppercase tracking-wide text-gray-400">
                          {item.label}
                        </div>
                        <div className="mt-2 text-sm font-semibold text-gray-900">
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="text-sm font-semibold text-gray-900">Injury History</div>
                  {data?.sidelined ? (
                    injuries.length > 0 ? (
                      <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="text-xs uppercase tracking-wide text-gray-400">
                            <tr>
                              <th className="py-2 text-left">Date</th>
                              <th className="py-2 text-left">Type</th>
                              <th className="py-2 text-left">Duration</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 text-gray-700">
                            {injuries.map((injury, index) => {
                              const start = injury.start_date ? new Date(injury.start_date) : null;
                              const end = injury.end_date ? new Date(injury.end_date) : null;
                              const days =
                                start && end
                                  ? Math.max(0, Math.round((end.getTime() - start.getTime()) / 86400000))
                                  : null;
                              return (
                                <tr key={`${injury.start_date ?? index}`}>
                                  <td className="py-3">
                                    {injury.start_date
                                      ? new Date(injury.start_date).toLocaleDateString("en-GB")
                                      : "—"}
                                  </td>
                                  <td className="py-3">{injury.type?.name ?? "—"}</td>
                                  <td className="py-3">{days !== null ? `${days} days` : "—"}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-4 text-center text-sm text-emerald-700">
                        ✓ No injuries recorded this season
                      </div>
                    )
                  ) : (
                    <div className="mt-4">{renderEmptyState("Injury data unavailable")}</div>
                  )}
                </section>

                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="text-sm font-semibold text-gray-900">Suspensions</div>
                  {data?.sidelined ? (
                    suspensions.length > 0 ? (
                      <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="text-xs uppercase tracking-wide text-gray-400">
                            <tr>
                              <th className="py-2 text-left">Date</th>
                              <th className="py-2 text-left">Reason</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 text-gray-700">
                            {suspensions.map((suspension, index) => (
                              <tr key={`${suspension.start_date ?? index}`}>
                                <td className="py-3">
                                  {suspension.start_date
                                    ? new Date(suspension.start_date).toLocaleDateString("en-GB")
                                    : "—"}
                                </td>
                                <td className="py-3">{suspension.type?.name ?? "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-lg bg-gray-100 px-4 py-4 text-center text-sm text-gray-600">
                        No disciplinary issues
                      </div>
                    )
                  ) : (
                    <div className="mt-4">{renderEmptyState("Data temporarily unavailable")}</div>
                  )}
                </section>
              </div>
            )}

            {displayState.tab === "video" && (
              <div className="space-y-6">
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="text-sm font-semibold text-gray-900">Video Library</div>
                  {videoLinks.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {videoLinks.map((link) => (
                        <a
                          key={link}
                          href={link}
                          className="block rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-blue-700 hover:bg-gray-100"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
                      <div className="text-sm font-semibold text-gray-800">
                        Request video analysis
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        We do not have video clips for this player yet.
                      </div>
                      <button className="mt-4 min-h-[48px] rounded-full bg-blue-600 px-5 text-sm font-semibold text-white">
                        Submit request
                      </button>
                    </div>
                  )}
                </section>
              </div>
            )}

            {displayState.tab === "reports" && (
              <div className="space-y-6">
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="text-sm font-semibold text-gray-900">Reports</div>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href={`/reports/player/${player.id}?depth=quick`}
                      className="flex min-h-[48px] items-center justify-center rounded-full border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      Quick Report
                    </Link>
                    <Link
                      href={`/reports/player/${player.id}?depth=dense`}
                      className="flex min-h-[48px] items-center justify-center rounded-full border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      Dense Report
                    </Link>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
