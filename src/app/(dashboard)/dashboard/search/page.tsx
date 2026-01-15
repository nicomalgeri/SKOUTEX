"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/dashboard/Header";
import Image from "next/image";
import {
  Search,
  SlidersHorizontal,
  Star,
  StarOff,
  ArrowUpDown,
  Plus,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, getPositionColor, getPositionCode, calculateAge, getCurrentTeam } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { POSITIONS } from "@/lib/types";
import type { SportmonksPlayer } from "@/lib/sportmonks/types";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const {
    searchFilters,
    setSearchFilters,
    watchlistIds,
    addToWatchlist,
    removeFromWatchlist,
  } = useAppStore();

  const [query, setQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<SportmonksPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce search query
  const debouncedQuery = useDebounce(query, 500);

  // Search function
  const searchPlayers = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch(
        `/api/sportmonks/players/search?q=${encodeURIComponent(searchQuery)}&include=position;nationality;teams.team;statistics`
      );

      if (!response.ok) {
        throw new Error("Failed to search players");
      }

      const data = await response.json();
      setResults(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger search when debounced query changes
  useEffect(() => {
    searchPlayers(debouncedQuery);
  }, [debouncedQuery, searchPlayers]);

  // Initial search from URL params
  useEffect(() => {
    if (initialQuery) {
      searchPlayers(initialQuery);
    }
  }, []);

  const togglePosition = (pos: string) => {
    const current = searchFilters.positions || [];
    if (current.includes(pos)) {
      setSearchFilters({ positions: current.filter((p) => p !== pos) });
    } else {
      setSearchFilters({ positions: [...current, pos] });
    }
  };

  const isInWatchlist = (playerId: string | number) => watchlistIds.includes(String(playerId));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/dashboard/search?q=${encodeURIComponent(query)}`);
  };

  // Filter results based on local filters
  const filteredResults = results.filter((player) => {
    // Position filter
    if (searchFilters.positions?.length) {
      const playerPosition = player.position?.code || getPositionCode(player.position?.name);
      if (!searchFilters.positions.some(p =>
        playerPosition?.toLowerCase().includes(p.toLowerCase()) ||
        p.toLowerCase().includes(playerPosition?.toLowerCase() || '')
      )) {
        return false;
      }
    }

    // Age filter
    if (searchFilters.ageRange) {
      const age = calculateAge(player.date_of_birth);
      if (age !== null) {
        if (age < searchFilters.ageRange.min || age > searchFilters.ageRange.max) {
          return false;
        }
      }
    }

    return true;
  });

  return (
    <>
      <Header title="Player Search" subtitle={loading ? "Searching..." : `${filteredResults.length} players found`} />

      <div className="p-4 lg:p-6 w-full max-w-[100vw] lg:max-w-none overflow-hidden">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search players by name..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-[#2C2C2C] placeholder-gray-500 focus:outline-none focus:border-[#0031FF] transition-all"
              />
              {loading && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-2 ${
                showFilters
                  ? "bg-[#0031FF] border-[#0031FF] text-white"
                  : "bg-white border-gray-200 text-gray-500 hover:text-[#2C2C2C] hover:border-gray-300"
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </form>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 space-y-6">
            {/* Positions */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-3">
                Positions
              </label>
              <div className="flex flex-wrap gap-2">
                {POSITIONS.map((pos) => (
                  <button
                    key={pos}
                    onClick={() => togglePosition(pos)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      searchFilters.positions?.includes(pos)
                        ? `${getPositionColor(pos)} text-white`
                        : "bg-gray-100 text-gray-500 hover:text-[#2C2C2C]"
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Age Range */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-3">
                Age Range: {searchFilters.ageRange?.min || 16} - {searchFilters.ageRange?.max || 40}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="16"
                  max="40"
                  value={searchFilters.ageRange?.min || 16}
                  onChange={(e) =>
                    setSearchFilters({
                      ageRange: {
                        min: parseInt(e.target.value),
                        max: searchFilters.ageRange?.max || 40,
                      },
                    })
                  }
                  className="flex-1 accent-[#0031FF]"
                />
                <input
                  type="range"
                  min="16"
                  max="40"
                  value={searchFilters.ageRange?.max || 40}
                  onChange={(e) =>
                    setSearchFilters({
                      ageRange: {
                        min: searchFilters.ageRange?.min || 16,
                        max: parseInt(e.target.value),
                      },
                    })
                  }
                  className="flex-1 accent-[#0031FF]"
                />
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSearchFilters({
                    positions: [],
                    ageRange: { min: 16, max: 40 },
                    leagues: [],
                    transferStatus: [],
                  });
                }}
                className="text-sm text-gray-500 hover:text-[#2C2C2C] transition-colors"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* Sort Bar */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {loading ? "Searching..." : `Showing ${filteredResults.length} players`}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={searchFilters.sortBy || "name"}
              onChange={(e) =>
                setSearchFilters({ sortBy: e.target.value as typeof searchFilters.sortBy })
              }
              className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#2C2C2C] focus:outline-none focus:border-[#0031FF]"
            >
              <option value="name">Name</option>
              <option value="age">Age</option>
            </select>
            <button
              onClick={() =>
                setSearchFilters({
                  sortOrder: searchFilters.sortOrder === "asc" ? "desc" : "asc",
                })
              }
              className="p-1.5 text-gray-500 hover:text-[#2C2C2C] transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-sm">Searching players...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <AlertCircle className="w-10 h-10 mb-4 text-red-500" />
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
              onClick={() => searchPlayers(query)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {/* Results */}
        {!loading && !error && filteredResults.length > 0 && (
          <div className="space-y-3">
            {filteredResults.map((player) => {
              const age = calculateAge(player.date_of_birth);
              const position = player.position?.name || player.position?.code;
              const positionCode = getPositionCode(position);
              const currentTeam = getCurrentTeam(player);

              return (
                <div
                  key={player.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {player.image_path ? (
                        <Image
                          src={player.image_path}
                          alt={player.display_name || player.name}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[#2C2C2C] text-xl font-semibold">
                          {(player.display_name || player.name || "?")[0]}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/dashboard/players/${player.id}`}
                          className="font-semibold text-[#2C2C2C] hover:text-[#0031FF] transition-colors"
                        >
                          {player.display_name || player.common_name || player.name}
                        </Link>
                        <span className="text-gray-500">·</span>
                        <span className="text-sm text-gray-500">{age ? `${age} years` : "Age N/A"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-500">{currentTeam?.name || "Free Agent"}</span>
                        {player.nationality?.name && (
                          <>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-500">{player.nationality.name}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Position */}
                    {position && (
                      <div className="hidden sm:flex flex-col items-center gap-1">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getPositionColor(
                            positionCode
                          )} text-white`}
                        >
                          {positionCode}
                        </span>
                        <span className="text-xs text-gray-500">{position}</span>
                      </div>
                    )}

                    {/* Physical Stats */}
                    <div className="hidden md:block text-right">
                      <p className="font-semibold text-[#2C2C2C]">
                        {player.height ? `${player.height} cm` : "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">Height</p>
                    </div>

                    {/* Country */}
                    <div className="hidden lg:block text-right">
                      <p className="font-semibold text-[#2C2C2C]">
                        {player.country?.name || player.nationality?.name || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">Country</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          isInWatchlist(player.id)
                            ? removeFromWatchlist(String(player.id))
                            : addToWatchlist(String(player.id))
                        }
                        className={`p-2 rounded-lg transition-all ${
                          isInWatchlist(player.id)
                            ? "bg-yellow-500/20 text-yellow-500"
                            : "text-gray-500 hover:text-yellow-500 hover:bg-yellow-500/10"
                        }`}
                      >
                        {isInWatchlist(player.id) ? (
                          <Star className="w-5 h-5 fill-current" />
                        ) : (
                          <StarOff className="w-5 h-5" />
                        )}
                      </button>
                      <Link
                        href={`/dashboard/players/${player.id}`}
                        className="p-2 rounded-lg text-gray-500 hover:text-[#0031FF] hover:bg-[#0031FF]/10 transition-all"
                        title="View profile"
                      >
                        <Plus className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>

                  {/* Stats Preview */}
                  <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 sm:grid-cols-6 gap-4">
                    <StatItem label="DOB" value={player.date_of_birth ? new Date(player.date_of_birth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"} />
                    <StatItem label="Height" value={player.height ? `${player.height} cm` : "N/A"} />
                    <StatItem label="Weight" value={player.weight ? `${player.weight} kg` : "N/A"} />
                    <StatItem label="Nationality" value={player.nationality?.name || "N/A"} className="hidden sm:block" />
                    <StatItem label="Position" value={positionCode || "N/A"} className="hidden sm:block" />
                    <StatItem label="Team" value={currentTeam?.short_code || currentTeam?.name?.substring(0, 10) || "Free"} className="hidden sm:block" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredResults.length === 0 && hasSearched && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#2C2C2C] mb-2">No players found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Initial State */}
        {!loading && !error && filteredResults.length === 0 && !hasSearched && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#2C2C2C] mb-2">Search for players</h3>
            <p className="text-gray-500">Enter a player name to start searching</p>
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
      <p className="text-sm font-medium text-[#2C2C2C] truncate">{value}</p>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-[#f6f6f6]">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-2 border-[#0031FF] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500 text-sm">Loading search...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
