"use client";

import type { TouchEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type Transfer = {
  id: string;
  playerId: number | null;
  playerName: string;
  fromClub: string;
  toClub: string;
  feeDisplay: string;
  position: string;
  league: string;
  timestamp: string;
  nationality: string;
  age: string;
  contract: string;
  seasonStats: string;
};

type FiltersState = {
  leagues: string[];
  positions: string[];
  targetRelatedOnly: boolean;
};

type RecentTransfersSectionProps = {
  defaultLeague: string;
  primaryLeagueMissing: boolean;
  targetPlayerNames: string[];
  targetPlayerIds: number[];
};

const STORAGE_KEY = "skoutex_transfer_filters";
const LEAGUE_OPTIONS = [
  "Premier League",
  "La Liga",
  "Serie A",
  "Bundesliga",
  "Ligue 1",
  "Eredivisie",
  "Liga Portugal",
  "Championship",
];
const POSITION_OPTIONS = ["GK", "CB", "FB", "CM", "W", "ST"];

function formatTimeAgo(timestamp: string): string {
  const now = Date.now();
  const date = new Date(timestamp).getTime();
  const diff = Math.max(0, now - date);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function shortenClub(name: string): string {
  if (name.length <= 20) return name;
  return `${name.slice(0, 18)}...`;
}

function getFeeClass(fee: string): string {
  if (fee.toLowerCase() === "free") return "text-emerald-600";
  return "text-gray-700";
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function TrendingUpIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 17l6-6 4 4 7-7" />
      <path d="M14 7h7v7" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v5" />
      <path d="M12 16h.01" />
    </svg>
  );
}

export default function RecentTransfersSection({
  defaultLeague,
  primaryLeagueMissing,
  targetPlayerNames,
  targetPlayerIds,
}: RecentTransfersSectionProps) {
  const [appliedFilters, setAppliedFilters] = useState<FiltersState>({
    leagues: [defaultLeague],
    positions: [],
    targetRelatedOnly: false,
  });
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [draftLeagues, setDraftLeagues] = useState<string[]>([defaultLeague]);
  const [draftPositions, setDraftPositions] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<
    "leagues" | "positions" | null
  >(null);
  const [closingDropdown, setClosingDropdown] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const dragStartRef = useRef<number | null>(null);

  const leagueButtonRef = useRef<HTMLButtonElement | null>(null);
  const positionButtonRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const loadTransfers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/transfers/recent");
      if (!response.ok) {
        throw new Error("Unable to load transfers");
      }
      const data = await response.json();
      setTransfers(Array.isArray(data.transfers) ? data.transfers : []);
      if (data.filters) {
        setAppliedFilters(data.filters);
        setDraftLeagues(data.filters.leagues);
        setDraftPositions(data.filters.positions);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.filters));
      } else {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as FiltersState;
          setAppliedFilters(parsed);
          setDraftLeagues(parsed.leagues);
          setDraftPositions(parsed.positions);
        } else {
          setAppliedFilters({
            leagues: [defaultLeague],
            positions: [],
            targetRelatedOnly: false,
          });
          setDraftLeagues([defaultLeague]);
          setDraftPositions([]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load transfers");
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as FiltersState;
          setAppliedFilters(parsed);
          setDraftLeagues(parsed.leagues);
          setDraftPositions(parsed.positions);
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [defaultLeague]);

  useEffect(() => {
    loadTransfers();
  }, [loadTransfers]);

  useEffect(() => {
    if (isLoading) return;
    setIsFiltering(true);
    const timer = window.setTimeout(() => setIsFiltering(false), 300);
    return () => window.clearTimeout(timer);
  }, [appliedFilters]);

  useEffect(() => {
    if (!isSheetOpen) {
      const timer = window.setTimeout(() => setIsSheetVisible(false), 200);
      setDragOffset(0);
      setDraftLeagues(appliedFilters.leagues);
      setDraftPositions(appliedFilters.positions);
      return () => window.clearTimeout(timer);
    }
    setIsSheetVisible(true);
  }, [isSheetOpen, appliedFilters.leagues, appliedFilters.positions]);

  useEffect(() => {
    if (!isSheetVisible) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSheetVisible]);

  const persistFilters = useCallback(async (filters: FiltersState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    try {
      await fetch("/api/transfers/recent", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      });
    } catch {
      // Ignore persistence failures; localStorage remains fallback.
    }
  }, []);

  const closeDropdown = useCallback(
    (discardChanges: boolean) => {
      if (discardChanges) {
        setDraftLeagues(appliedFilters.leagues);
        setDraftPositions(appliedFilters.positions);
      }
      setClosingDropdown(true);
      window.setTimeout(() => {
        setOpenDropdown(null);
        setClosingDropdown(false);
      }, 150);
    },
    [appliedFilters]
  );

  useEffect(() => {
    if (!openDropdown) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current?.contains(target) ||
        leagueButtonRef.current?.contains(target) ||
        positionButtonRef.current?.contains(target)
      ) {
        return;
      }
      closeDropdown(true);
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDropdown(true);
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [openDropdown, closeDropdown]);

  const handleApply = () => {
    const next = {
      ...appliedFilters,
      leagues: draftLeagues,
      positions: draftPositions,
    };
    setAppliedFilters(next);
    persistFilters(next);
    closeDropdown(false);
  };

  const handleClear = () => {
    setDraftLeagues([]);
    setDraftPositions([]);
  };

  const toggleTargetRelated = () => {
    const next = {
      ...appliedFilters,
      targetRelatedOnly: !appliedFilters.targetRelatedOnly,
    };
    setAppliedFilters(next);
    persistFilters(next);
  };

  const handleSheetApply = () => {
    const next = {
      ...appliedFilters,
      leagues: draftLeagues,
      positions: draftPositions,
    };
    setAppliedFilters(next);
    persistFilters(next);
    setIsSheetOpen(false);
  };

  const handleDragStart = (event: TouchEvent<HTMLDivElement>) => {
    dragStartRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleDragMove = (event: TouchEvent<HTMLDivElement>) => {
    if (dragStartRef.current === null) return;
    const currentY = event.touches[0]?.clientY ?? 0;
    const delta = currentY - dragStartRef.current;
    if (delta > 0) {
      setDragOffset(delta);
    }
  };

  const handleDragEnd = () => {
    if (dragOffset > 100) {
      setIsSheetOpen(false);
    }
    setDragOffset(0);
    dragStartRef.current = null;
  };

  const handleSheetClear = () => {
    setDraftLeagues([]);
    setDraftPositions([]);
  };

  const handleRetry = () => {
    loadTransfers();
  };

  const targetNameSet = useMemo(
    () =>
      new Set(
        targetPlayerNames.map((name) =>
          name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim()
        )
      ),
    [targetPlayerNames]
  );
  const targetIdSet = useMemo(
    () => new Set(targetPlayerIds.filter((id) => Number.isFinite(id))),
    [targetPlayerIds]
  );

  const filteredTransfers = useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return transfers
      .filter((transfer) => new Date(transfer.timestamp).getTime() >= cutoff)
      .filter((transfer) => {
        if (appliedFilters.leagues.length === 0) return true;
        return appliedFilters.leagues.includes(transfer.league);
      })
      .filter((transfer) => {
        if (appliedFilters.positions.length === 0) return true;
        return appliedFilters.positions.includes(transfer.position);
      })
      .filter((transfer) => {
        if (!appliedFilters.targetRelatedOnly) return true;
        if (transfer.playerId && targetIdSet.has(transfer.playerId)) return true;
        const normalized = transfer.playerName
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .trim();
        return targetNameSet.has(normalized);
      })
      .slice(0, 8);
  }, [appliedFilters, targetIdSet, targetNameSet, transfers]);

  const filtersApplied =
    appliedFilters.leagues.length > 0 || appliedFilters.positions.length > 0;

  const showNoPrimaryLeague =
    primaryLeagueMissing && appliedFilters.leagues.length === 0;

  return (
    <section className="premium-animate-delay-3 mt-12 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
          Recent Transfers
        </h2>
        <p className="mt-1 text-sm text-gray-500">Last 7 days</p>
      </div>

      <div className="mt-6 hidden items-center justify-between gap-4 rounded-xl bg-gray-50 px-4 py-3 md:flex">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              ref={leagueButtonRef}
              onClick={() => {
                setDraftLeagues(appliedFilters.leagues);
                setDraftPositions(appliedFilters.positions);
                if (openDropdown === "leagues") {
                  closeDropdown(true);
                } else {
                  setOpenDropdown("leagues");
                }
              }}
              className={`relative flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors ${
                appliedFilters.leagues.length > 0
                  ? "border-[#0031FF] bg-blue-50 text-[#0031FF]"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              Leagues
              <ChevronIcon className="h-4 w-4" />
              {appliedFilters.leagues.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#0031FF] text-[11px] font-semibold text-white">
                  {appliedFilters.leagues.length}
                </span>
              )}
            </button>
            {openDropdown === "leagues" && (
              <div
                ref={dropdownRef}
                className={`absolute left-0 top-12 z-50 w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-xl transition-all duration-150 ${
                  closingDropdown ? "scale-95 opacity-0" : "scale-100 opacity-100"
                }`}
              >
                <div className="text-base font-semibold text-gray-900">
                  Select Leagues
                </div>
                <div className="mt-3 border-t border-gray-200 pt-3">
                  <div className="max-h-64 space-y-1 overflow-y-auto">
                    {LEAGUE_OPTIONS.map((league) => (
                      <label
                        key={league}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={draftLeagues.includes(league)}
                          onChange={() => {
                            setDraftLeagues((prev) =>
                              prev.includes(league)
                                ? prev.filter((item) => item !== league)
                                : [...prev, league]
                            );
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-[#0031FF] focus:ring-[#0031FF]"
                        />
                        {league}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3">
                  <button
                    onClick={handleClear}
                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={handleApply}
                    className="rounded-md bg-[#0031FF] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0029DD]"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              ref={positionButtonRef}
              onClick={() => {
                setDraftPositions(appliedFilters.positions);
                setDraftLeagues(appliedFilters.leagues);
                if (openDropdown === "positions") {
                  closeDropdown(true);
                } else {
                  setOpenDropdown("positions");
                }
              }}
              className={`relative flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors ${
                appliedFilters.positions.length > 0
                  ? "border-[#0031FF] bg-blue-50 text-[#0031FF]"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              Positions
              <ChevronIcon className="h-4 w-4" />
              {appliedFilters.positions.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#0031FF] text-[11px] font-semibold text-white">
                  {appliedFilters.positions.length}
                </span>
              )}
            </button>
            {openDropdown === "positions" && (
              <div
                ref={dropdownRef}
                className={`absolute left-0 top-12 z-50 w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-xl transition-all duration-150 ${
                  closingDropdown ? "scale-95 opacity-0" : "scale-100 opacity-100"
                }`}
              >
                <div className="text-base font-semibold text-gray-900">
                  Select Positions
                </div>
                <div className="mt-3 border-t border-gray-200 pt-3">
                  <div className="space-y-1">
                    {POSITION_OPTIONS.map((position) => (
                      <label
                        key={position}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={draftPositions.includes(position)}
                          onChange={() => {
                            setDraftPositions((prev) =>
                              prev.includes(position)
                                ? prev.filter((item) => item !== position)
                                : [...prev, position]
                            );
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-[#0031FF] focus:ring-[#0031FF]"
                        />
                        {position}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3">
                  <button
                    onClick={handleClear}
                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={handleApply}
                    className="rounded-md bg-[#0031FF] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0029DD]"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={appliedFilters.targetRelatedOnly}
              onChange={toggleTargetRelated}
              className="h-[18px] w-[18px] rounded border-2 border-gray-300 text-[#0031FF] focus:ring-[#0031FF]"
            />
            Target-related only
          </label>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <FilterIcon className="h-4 w-4" />
          Filters
        </div>
      </div>

      <div className="mt-6 md:hidden">
        <button
          onClick={() => {
            setDraftLeagues(appliedFilters.leagues);
            setDraftPositions(appliedFilters.positions);
            setIsSheetOpen(true);
          }}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white text-base font-medium text-gray-700"
        >
          <FilterIcon className="h-5 w-5" />
          Filters
        </button>
      </div>

      <div className="mt-6">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-600">
            <AlertIcon className="mx-auto h-6 w-6 text-red-500" />
            <div className="mt-2 font-semibold">Unable to load transfers</div>
            <div className="mt-1 text-sm text-red-500">
              Please try again in a moment
            </div>
            <button
              onClick={handleRetry}
              className="mt-4 inline-flex min-h-[40px] items-center justify-center rounded-md bg-[#0031FF] px-4 text-sm font-semibold text-white"
            >
              Try Again
            </button>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
              Loading recent transfers...
            </div>
            <SkeletonCards />
          </div>
        ) : isFiltering ? (
          <SkeletonCards />
        ) : showNoPrimaryLeague ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
            <div className="text-sm">Set your primary league</div>
            <div className="mt-2 text-sm">
              Complete your club profile to see relevant transfers
            </div>
            <Link
              href="/dashboard/club"
              className="mt-4 inline-flex min-h-[40px] items-center justify-center rounded-md bg-[#0031FF] px-4 text-sm font-semibold text-white"
            >
              Complete Profile
            </Link>
          </div>
        ) : (
          <div className="space-y-3 transition-opacity duration-150">
            {filteredTransfers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-12 text-center text-sm text-gray-500">
                <TrendingUpIcon className="mx-auto h-12 w-12 text-gray-300" />
                {appliedFilters.targetRelatedOnly ? (
                  <>
                    <div className="mt-4 font-medium">
                      No target-related transfers
                    </div>
                    <div className="mt-1">
                      None of your current position targets have moved clubs recently
                    </div>
                  </>
                ) : filtersApplied ? (
                  <>
                    <div className="mt-4 font-medium">
                      No transfers match your filters
                    </div>
                    <div className="mt-1">
                      Try adjusting your league or position selections
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mt-4 font-medium">No recent transfers</div>
                    <div className="mt-1">
                      No transfers recorded in the last 7 days
                    </div>
                    <div className="mt-1">Check back later for updates</div>
                  </>
                )}
              </div>
            ) : (
              filteredTransfers.map((transfer, index) => (
                <TransferCard
                  key={transfer.id}
                  transfer={transfer}
                  index={index}
                />
              ))
            )}
          </div>
        )}
      </div>

      {isSheetVisible && (
        <div className="fixed inset-0 z-[100]">
          <button
            className={`absolute inset-0 bg-black transition-opacity duration-300 ${
              isSheetOpen ? "opacity-50" : "opacity-0"
            }`}
            onClick={() => setIsSheetOpen(false)}
            aria-label="Close filters"
          />
          <div
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
            className="absolute bottom-0 left-0 right-0 max-h-[80vh] rounded-t-3xl bg-white px-5 pb-8 pt-4 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{
              transform: isSheetOpen ? `translateY(${dragOffset}px)` : "translateY(100%)",
            }}
          >
            <div className="mx-auto h-1 w-10 rounded-full bg-gray-300" />
            <div className="mt-4 border-b border-gray-200 pb-4 text-xl font-semibold text-gray-900">
              Filter Transfers
            </div>

            <div className="mt-5 space-y-6 overflow-y-auto pb-6">
              <div>
                <div className="text-sm font-semibold tracking-wide text-gray-500">
                  Leagues
                </div>
                <div className="mt-3 space-y-2">
                  {LEAGUE_OPTIONS.map((league) => (
                    <label key={league} className="flex items-center gap-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={draftLeagues.includes(league)}
                        onChange={() => {
                          setDraftLeagues((prev) =>
                            prev.includes(league)
                              ? prev.filter((item) => item !== league)
                              : [...prev, league]
                          );
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-[#0031FF] focus:ring-[#0031FF]"
                      />
                      {league}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold tracking-wide text-gray-500">
                  Positions
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {POSITION_OPTIONS.map((position) => {
                    const selected = draftPositions.includes(position);
                    return (
                      <button
                        key={position}
                        onClick={() => {
                          setDraftPositions((prev) =>
                            prev.includes(position)
                              ? prev.filter((item) => item !== position)
                              : [...prev, position]
                          );
                        }}
                        className={`h-9 w-14 rounded-lg border text-sm font-medium transition-all duration-100 ${
                          selected
                            ? "border-[#0031FF] bg-blue-50 text-[#0031FF]"
                            : "border-gray-200 bg-white text-gray-700"
                        }`}
                      >
                        {position}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold tracking-wide text-gray-500">
                  Options
                </div>
                <label className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={appliedFilters.targetRelatedOnly}
                    onChange={toggleTargetRelated}
                    className="h-[18px] w-[18px] rounded border-2 border-gray-300 text-[#0031FF] focus:ring-[#0031FF]"
                  />
                  Target-related only
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <button
                onClick={handleSheetClear}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-500"
              >
                Clear All
              </button>
              <button
                onClick={handleSheetApply}
                className="rounded-md bg-[#0031FF] px-5 py-2 text-sm font-semibold text-white"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

type TransferCardProps = {
  transfer: Transfer;
  index: number;
};

function TransferCard({ transfer, index }: TransferCardProps) {
  const [expanded, setExpanded] = useState(false);

  const cardDelay = index < 5 ? `${index * 30}ms` : "0ms";
  const timeAgo = formatTimeAgo(transfer.timestamp);
  const positionBadge = transfer.position || "?";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setExpanded((prev) => !prev)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setExpanded((prev) => !prev);
        }
      }}
      className="transfer-card-animate cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-4 transition-all duration-150 hover:border-gray-300 hover:bg-gray-50 active:scale-98"
      style={{ animationDelay: cardDelay }}
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <div className="text-base font-semibold text-gray-900">
            {transfer.playerName}
          </div>
        </div>
        <div className="hidden flex-wrap items-center gap-2 text-sm text-gray-600 md:flex">
          <span className={getFeeClass(transfer.feeDisplay)}>
            {transfer.feeDisplay}
          </span>
          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold uppercase text-gray-500">
            {positionBadge || "?"}
          </span>
          <span className="text-xs text-gray-400 md:ml-4">{timeAgo}</span>
        </div>
        <div className="hidden md:flex md:items-center">
          <ChevronIcon
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
              expanded ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>
      </div>

      <div className="text-sm text-gray-500 md:mt-1">
        {shortenClub(transfer.fromClub)} → {shortenClub(transfer.toClub)}
      </div>

      <div className="mt-2 text-sm text-gray-600 md:hidden">
        {transfer.feeDisplay} • {positionBadge || "?"} • {timeAgo}
      </div>

      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-200 ease-out ${
          expanded ? "max-h-48 opacity-100 delay-50" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mt-3 border-t border-gray-200 pt-3 text-sm text-gray-600">
          <div className="space-y-2">
            <div>• {transfer.age} years old</div>
            <div>• Contract: {transfer.contract}</div>
            <div>• {transfer.seasonStats}</div>
            <div>• Nationality: {transfer.nationality}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCards() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-20 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4"
        >
          <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
          <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}
