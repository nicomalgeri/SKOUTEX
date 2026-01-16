"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Loader2, Check } from "lucide-react";

type SportmonksTeam = {
  id: number;
  name: string;
  image_path?: string;
  country?: {
    name: string;
  };
  venue?: {
    name: string;
  };
  activeSeasons?: Array<{
    league?: {
      id: number;
      name: string;
    };
  }>;
};

type ClubSelectorProps = {
  onSelect: (club: {
    sportmonks_team_id: number;
    name: string;
    logo_url: string | null;
    league: string | null;
    country: string | null;
  }) => void;
  currentClubName?: string;
};

export function ClubSelector({ onSelect, currentClubName }: ClubSelectorProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SportmonksTeam[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<SportmonksTeam | null>(null);

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/sportmonks/teams/search?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      setResults(data.data || []);
    } catch (error) {
      console.error("Failed to search clubs:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (team: SportmonksTeam) => {
    setSelected(team);
    const league = team.activeSeasons?.[0]?.league?.name || null;
    const country = team.country?.name || null;

    onSelect({
      sportmonks_team_id: team.id,
      name: team.name,
      logo_url: team.image_path || null,
      league,
      country,
    });

    // Clear search
    setQuery("");
    setResults([]);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          placeholder="Search for your club (e.g., Barcelona, Bayern Munich)..."
          className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 focus:border-electric-blue focus:outline-none focus:ring-2 focus:ring-electric-blue/20"
        />
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="max-h-96 space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2">
          {results.map((team) => {
            const league = team.activeSeasons?.[0]?.league?.name;
            const country = team.country?.name;

            return (
              <button
                key={team.id}
                onClick={() => handleSelect(team)}
                className="flex w-full items-center gap-4 rounded-lg p-3 text-left transition-colors hover:bg-gray-50"
              >
                {/* Club Logo */}
                {team.image_path ? (
                  <Image
                    src={team.image_path}
                    alt={team.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-lg font-bold text-gray-400">
                    {team.name.charAt(0)}
                  </div>
                )}

                {/* Club Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{team.name}</h3>
                  <p className="text-sm text-gray-500">
                    {[league, country].filter(Boolean).join(" · ")}
                  </p>
                </div>

                {/* Select Icon */}
                <div className="text-electric-blue">
                  <Check className="h-5 w-5" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Club */}
      {selected && (
        <div className="rounded-lg border-2 border-electric-blue bg-blue-50 p-4">
          <div className="flex items-center gap-4">
            {selected.image_path ? (
              <Image
                src={selected.image_path}
                alt={selected.name}
                width={64}
                height={64}
                className="rounded-full object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-electric-blue text-2xl font-bold text-white">
                {selected.name.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">
                ✓ {selected.name}
              </h3>
              <p className="text-sm text-gray-600">
                {[
                  selected.activeSeasons?.[0]?.league?.name,
                  selected.country?.name,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current Club Info */}
      {currentClubName && !selected && (
        <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          Current club: <span className="font-semibold">{currentClubName}</span>
          <br />
          Search above to change your club
        </div>
      )}
    </div>
  );
}
