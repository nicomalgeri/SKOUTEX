"use client";

import { useState, useMemo } from "react";
import Header from "@/components/dashboard/Header";
import { useDebounce } from "@/lib/hooks/useDebounce";
import {
  Search,
  Plus,
  X,
  Users,
  Loader2,
  ChevronDown,
  Download,
  Share2,
  Settings2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePlayerSearch } from "@/lib/hooks/useSportmonks";
import { useAppStore } from "@/lib/store";
import {
  getPositionCode,
  getPositionColor,
  calculateAge,
  formatCurrency,
  getInitials,
  getCurrentTeam,
} from "@/lib/utils";
import type { SportmonksPlayer } from "@/lib/sportmonks/types";

// Formation positions mapping
// Positions are relative to a 4-3-3 formation by default
// x: horizontal position (0 = left, 100 = right)
// y: vertical position (0 = top/attacking, 100 = bottom/defensive)
const FORMATION_POSITIONS: Record<
  string,
  { label: string; x: number; y: number }
> = {
  GK: { label: "Goalkeeper", x: 50, y: 92 },
  LB: { label: "Left Back", x: 15, y: 72 },
  CB_L: { label: "Centre Back (L)", x: 35, y: 75 },
  CB_R: { label: "Centre Back (R)", x: 65, y: 75 },
  RB: { label: "Right Back", x: 85, y: 72 },
  CDM: { label: "Defensive Midfielder", x: 50, y: 58 },
  LM: { label: "Left Midfielder", x: 20, y: 45 },
  CM_L: { label: "Central Midfielder (L)", x: 35, y: 42 },
  CM_R: { label: "Central Midfielder (R)", x: 65, y: 42 },
  RM: { label: "Right Midfielder", x: 80, y: 45 },
  CAM: { label: "Attacking Midfielder", x: 50, y: 32 },
  LW: { label: "Left Winger", x: 18, y: 20 },
  CF: { label: "Centre Forward", x: 50, y: 12 },
  RW: { label: "Right Winger", x: 82, y: 20 },
  ST_L: { label: "Striker (L)", x: 38, y: 10 },
  ST_R: { label: "Striker (R)", x: 62, y: 10 },
};

// Formation templates
const FORMATIONS: Record<string, string[]> = {
  "4-3-3": ["GK", "LB", "CB_L", "CB_R", "RB", "CM_L", "CDM", "CM_R", "LW", "CF", "RW"],
  "4-4-2": ["GK", "LB", "CB_L", "CB_R", "RB", "LM", "CM_L", "CM_R", "RM", "ST_L", "ST_R"],
  "4-2-3-1": ["GK", "LB", "CB_L", "CB_R", "RB", "CDM", "CM_R", "LW", "CAM", "RW", "CF"],
  "3-5-2": ["GK", "CB_L", "CDM", "CB_R", "LM", "CM_L", "CAM", "CM_R", "RM", "ST_L", "ST_R"],
  "3-4-3": ["GK", "CB_L", "CDM", "CB_R", "LM", "CM_L", "CM_R", "RM", "LW", "CF", "RW"],
};

// Map Sportmonks position to field position
function mapToFieldPosition(position: string): string {
  const positionLower = position.toLowerCase();

  if (positionLower.includes("goalkeeper")) return "GK";
  if (positionLower.includes("left back") || positionLower.includes("left-back")) return "LB";
  if (positionLower.includes("right back") || positionLower.includes("right-back")) return "RB";
  if (positionLower.includes("centre-back") || positionLower.includes("center back") || positionLower.includes("central defender")) return "CB_L";
  if (positionLower.includes("defensive midfielder") || positionLower.includes("holding")) return "CDM";
  if (positionLower.includes("left midfielder") || positionLower.includes("left mid")) return "LM";
  if (positionLower.includes("right midfielder") || positionLower.includes("right mid")) return "RM";
  if (positionLower.includes("central midfielder") || positionLower.includes("centre mid")) return "CM_L";
  if (positionLower.includes("attacking midfielder") || positionLower.includes("playmaker")) return "CAM";
  if (positionLower.includes("left winger") || positionLower.includes("left wing")) return "LW";
  if (positionLower.includes("right winger") || positionLower.includes("right wing")) return "RW";
  if (positionLower.includes("striker") || positionLower.includes("centre-forward") || positionLower.includes("center forward")) return "CF";
  if (positionLower.includes("forward")) return "CF";
  if (positionLower.includes("defender")) return "CB_L";
  if (positionLower.includes("midfielder")) return "CM_L";

  return "CM_L"; // Default fallback
}

// Player slot on the field
interface FieldSlot {
  position: string;
  player: SportmonksPlayer | null;
}

export default function FieldMapPage() {
  const [selectedFormation, setSelectedFormation] = useState<string>("4-3-3");
  const [fieldSlots, setFieldSlots] = useState<Record<string, SportmonksPlayer | null>>({});
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 500);
  const [showFormationDropdown, setShowFormationDropdown] = useState(false);

  const { watchlistIds } = useAppStore();

  // Search players
  const { data: searchResults, loading: searchLoading } = usePlayerSearch(
    debouncedQuery.length >= 2 ? debouncedQuery : null,
    "position;detailedPosition;nationality;teams.team"
  );

  // Current formation positions
  const currentPositions = useMemo(() => {
    return FORMATIONS[selectedFormation] || FORMATIONS["4-3-3"];
  }, [selectedFormation]);

  // Handle player assignment to slot
  const assignPlayerToSlot = (player: SportmonksPlayer) => {
    if (!activeSlot) return;
    setFieldSlots((prev) => ({
      ...prev,
      [activeSlot]: player,
    }));
    setActiveSlot(null);
    setSearchQuery(""); // Debounced query will update automatically via useDebounce hook
  };

  // Remove player from slot
  const removePlayerFromSlot = (slotId: string) => {
    setFieldSlots((prev) => {
      const updated = { ...prev };
      delete updated[slotId];
      return updated;
    });
  };

  // Clear all players
  const clearAllPlayers = () => {
    setFieldSlots({});
  };

  // Count assigned players
  const assignedCount = Object.values(fieldSlots).filter(Boolean).length;

  return (
    <>
      <Header
        title="Player Field Map"
        subtitle="Visualize players by position on the pitch"
      />

      <div className="p-4 lg:p-6">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          {/* Formation Selector */}
          <div className="relative">
            <button
              onClick={() => setShowFormationDropdown(!showFormationDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#2C2C2C] hover:border-gray-300 transition-colors"
            >
              <Settings2 className="w-4 h-4 text-gray-500" />
              Formation: {selectedFormation}
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showFormationDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-[160px]">
                {Object.keys(FORMATIONS).map((formation) => (
                  <button
                    key={formation}
                    onClick={() => {
                      setSelectedFormation(formation);
                      setShowFormationDropdown(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                      selectedFormation === formation
                        ? "bg-[#0031FF]/10 text-[#0031FF] font-medium"
                        : "text-[#2C2C2C] hover:bg-gray-50"
                    }`}
                  >
                    {formation}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {assignedCount} of 11 positions filled
            </span>
            {assignedCount > 0 && (
              <button
                onClick={clearAllPlayers}
                className="px-3 py-1.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Football Pitch */}
          <div className="lg:col-span-2">
            <div
              className="relative w-full bg-gradient-to-b from-[#2d8a3e] to-[#1e6b2e] rounded-2xl overflow-hidden"
              style={{ aspectRatio: "3/4" }}
            >
              {/* Pitch Markings */}
              <svg
                viewBox="0 0 100 133"
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="xMidYMid slice"
              >
                {/* Outer boundary */}
                <rect
                  x="5"
                  y="5"
                  width="90"
                  height="123"
                  fill="none"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="0.3"
                />

                {/* Center line */}
                <line
                  x1="5"
                  y1="66.5"
                  x2="95"
                  y2="66.5"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="0.3"
                />

                {/* Center circle */}
                <circle
                  cx="50"
                  cy="66.5"
                  r="9"
                  fill="none"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="0.3"
                />
                <circle
                  cx="50"
                  cy="66.5"
                  r="0.5"
                  fill="rgba(255,255,255,0.4)"
                />

                {/* Top penalty area */}
                <rect
                  x="20"
                  y="5"
                  width="60"
                  height="18"
                  fill="none"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="0.3"
                />

                {/* Top goal area */}
                <rect
                  x="32"
                  y="5"
                  width="36"
                  height="7"
                  fill="none"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="0.3"
                />

                {/* Top penalty spot */}
                <circle
                  cx="50"
                  cy="16"
                  r="0.5"
                  fill="rgba(255,255,255,0.4)"
                />

                {/* Top penalty arc */}
                <path
                  d="M 38 23 A 9 9 0 0 0 62 23"
                  fill="none"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="0.3"
                />

                {/* Bottom penalty area */}
                <rect
                  x="20"
                  y="110"
                  width="60"
                  height="18"
                  fill="none"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="0.3"
                />

                {/* Bottom goal area */}
                <rect
                  x="32"
                  y="121"
                  width="36"
                  height="7"
                  fill="none"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="0.3"
                />

                {/* Bottom penalty spot */}
                <circle
                  cx="50"
                  cy="117"
                  r="0.5"
                  fill="rgba(255,255,255,0.4)"
                />

                {/* Bottom penalty arc */}
                <path
                  d="M 38 110 A 9 9 0 0 1 62 110"
                  fill="none"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="0.3"
                />

                {/* Corner arcs */}
                <path
                  d="M 5 7 A 2 2 0 0 0 7 5"
                  fill="none"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="0.3"
                />
                <path
                  d="M 93 5 A 2 2 0 0 0 95 7"
                  fill="none"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="0.3"
                />
                <path
                  d="M 5 126 A 2 2 0 0 1 7 128"
                  fill="none"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="0.3"
                />
                <path
                  d="M 93 128 A 2 2 0 0 1 95 126"
                  fill="none"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="0.3"
                />
              </svg>

              {/* Player Positions */}
              {currentPositions.map((posId) => {
                const pos = FORMATION_POSITIONS[posId];
                if (!pos) return null;

                const player = fieldSlots[posId];
                const isActive = activeSlot === posId;

                // Adjust y position for pitch aspect ratio
                const adjustedY = (pos.y / 100) * 75 + 5;

                return (
                  <div
                    key={posId}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${pos.x}%`,
                      top: `${adjustedY}%`,
                    }}
                  >
                    {player ? (
                      // Player Card
                      <div className="relative group">
                        <button
                          onClick={() => setActiveSlot(isActive ? null : posId)}
                          className={`w-14 h-14 rounded-full border-2 overflow-hidden transition-all ${
                            isActive
                              ? "border-[#0031FF] ring-2 ring-[#0031FF]/30 scale-110"
                              : "border-white/80 hover:border-white hover:scale-105"
                          }`}
                        >
                          {player.image_path ? (
                            <Image
                              src={player.image_path}
                              alt={player.display_name || player.name || ""}
                              width={56}
                              height={56}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-white/90 flex items-center justify-center text-[#2C2C2C] font-bold text-lg">
                              {getInitials(player.display_name || player.name)}
                            </div>
                          )}
                        </button>

                        {/* Player Name Tag */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 bg-black/70 rounded text-white text-xs whitespace-nowrap">
                          {player.display_name || player.name}
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removePlayerFromSlot(posId);
                          }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      // Empty Slot
                      <button
                        onClick={() => setActiveSlot(isActive ? null : posId)}
                        className={`w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center transition-all ${
                          isActive
                            ? "border-[#0031FF] bg-[#0031FF]/20 scale-110"
                            : "border-white/50 bg-white/10 hover:border-white/80 hover:bg-white/20"
                        }`}
                      >
                        <Plus
                          className={`w-6 h-6 ${
                            isActive ? "text-[#0031FF]" : "text-white/70"
                          }`}
                        />
                      </button>
                    )}

                    {/* Position Label */}
                    {!player && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-white/70 text-xs whitespace-nowrap">
                        {posId.replace("_", " ")}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Player Search Panel */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-[#2C2C2C] mb-3">
                {activeSlot
                  ? `Select player for ${FORMATION_POSITIONS[activeSlot]?.label || activeSlot}`
                  : "Add Players"}
              </h3>

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search players..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#2C2C2C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0031FF]/20 focus:border-[#0031FF]"
                />
              </div>
            </div>

            {/* Search Results or Watchlist */}
            <div className="max-h-[500px] overflow-y-auto">
              {searchLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  <p className="text-sm text-gray-500 mt-2">Searching...</p>
                </div>
              ) : searchResults?.data && searchResults.data.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {searchResults.data.slice(0, 20).map((player) => (
                    <PlayerSearchItem
                      key={player.id}
                      player={player}
                      onSelect={assignPlayerToSlot}
                      disabled={!activeSlot}
                    />
                  ))}
                </div>
              ) : debouncedQuery.length >= 2 ? (
                <div className="p-8 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No players found</p>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    {activeSlot
                      ? "Search for a player to add"
                      : "Click a position on the pitch, then search for a player"}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Add from Watchlist */}
            {watchlistIds.length > 0 && !debouncedQuery && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500 mb-2">
                  You have {watchlistIds.length} players in your watchlist
                </p>
                <Link
                  href="/dashboard/watchlist"
                  className="text-sm text-[#0031FF] hover:underline font-medium"
                >
                  View Watchlist
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Assigned Players Summary */}
        {assignedCount > 0 && (
          <div className="mt-6 bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[#2C2C2C]">Squad Summary</h3>
                <p className="text-sm text-gray-500">
                  {assignedCount} players assigned to {selectedFormation} formation
                </p>
              </div>
            </div>

            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {currentPositions.map((posId) => {
                const player = fieldSlots[posId];
                if (!player) return null;

                const position =
                  player.detailedPosition?.name ||
                  player.position?.name ||
                  "Unknown";
                const posCode = getPositionCode(position);

                return (
                  <div
                    key={posId}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      {player.image_path ? (
                        <Image
                          src={player.image_path}
                          alt={player.display_name || player.name || ""}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[#2C2C2C] font-bold text-sm">
                          {getInitials(player.display_name || player.name)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#2C2C2C] truncate">
                        {player.display_name || player.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${getPositionColor(
                            position
                          )} text-white`}
                        >
                          {posCode}
                        </span>
                        <span className="text-xs text-gray-500">
                          {posId.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Player Search Item Component
function PlayerSearchItem({
  player,
  onSelect,
  disabled,
}: {
  player: SportmonksPlayer;
  onSelect: (player: SportmonksPlayer) => void;
  disabled: boolean;
}) {
  const position =
    player.detailedPosition?.name || player.position?.name || "Unknown";
  const posCode = getPositionCode(position);
  const age = calculateAge(player.date_of_birth);
  const team = getCurrentTeam(player)?.name || "Free Agent";

  return (
    <button
      onClick={() => onSelect(player)}
      disabled={disabled}
      className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
      }`}
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
        {player.image_path ? (
          <Image
            src={player.image_path}
            alt={player.display_name || player.name || ""}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[#2C2C2C] font-bold text-sm">
            {getInitials(player.display_name || player.name)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-[#2C2C2C] truncate">
            {player.display_name || player.name}
          </p>
          <span
            className={`text-xs px-1.5 py-0.5 rounded ${getPositionColor(
              position
            )} text-white flex-shrink-0`}
          >
            {posCode}
          </span>
        </div>
        <p className="text-xs text-gray-500 truncate">
          {team} · {age ? `${age} years` : "Age unknown"}
        </p>
      </div>

      {/* Add Icon */}
      {!disabled && (
        <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
      )}
    </button>
  );
}
