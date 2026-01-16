/**
 * Position Target Card Component
 * Shows recommended players for a specific position need
 */

"use client";

import { useState } from "react";
import { RadarChart } from "@/components/RadarChart";
import { generateMockRadarData } from "@/lib/radar/kpiMappings";
import { Check, Plus } from "lucide-react";
import Link from "next/link";

export interface PlayerRecommendation {
  id: number;
  name: string;
  club: string;
  age: number;
  position: string;
  fitScore: number;
  imageUrl?: string;
}

interface PositionTargetCardProps {
  player: PlayerRecommendation;
  onAddToShortlist?: (playerId: number) => void;
  className?: string;
}

export function PositionTargetCard({
  player,
  onAddToShortlist,
  className = "",
}: PositionTargetCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const radarData = generateMockRadarData(player.position, player.fitScore);

  const getFitVerdict = (score: number): { text: string; color: string } => {
    if (score >= 85) return { text: "Excellent Fit", color: "text-green-600" };
    if (score >= 75) return { text: "Strong Fit", color: "text-blue-600" };
    if (score >= 65) return { text: "Good Fit", color: "text-indigo-600" };
    if (score >= 50) return { text: "Potential Fit", color: "text-amber-600" };
    return { text: "Limited Fit", color: "text-gray-600" };
  };

  const verdict = getFitVerdict(player.fitScore);

  const handleAddToShortlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdded) return;

    setIsAnimating(true);
    setIsAdded(true);

    // Call the callback
    onAddToShortlist?.(player.id);

    // Reset animation state
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <Link href={`/dashboard/players/${player.id}`}>
      <div
        className={`
          group relative bg-white rounded-xl border border-gray-300 p-6
          hover:shadow-lg hover:border-blue-600 hover:-translate-y-1
          transition-all duration-200 cursor-pointer
          ${className}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {player.position}
          </span>
          <div
            className={`
            px-2 py-1 rounded-full text-xs font-semibold
            ${
              player.fitScore >= 80
                ? "bg-green-50 text-green-600"
                : player.fitScore >= 70
                  ? "bg-blue-50 text-blue-600"
                  : "bg-gray-100 text-gray-600"
            }
          `}
          >
            Fit {player.fitScore}
          </div>
        </div>

        {/* Player Info */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{player.name}</h3>
          <p className="text-sm text-gray-600">
            {player.club} • {player.age} years old
          </p>
        </div>

        {/* Radar Chart */}
        <div className="flex justify-center mb-4">
          <RadarChart data={radarData} size={120} showLabels={true} animate={true} />
        </div>

        {/* Verdict */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className={`w-2 h-2 rounded-full ${
              player.fitScore >= 85
                ? "bg-green-600"
                : player.fitScore >= 75
                  ? "bg-blue-600"
                  : player.fitScore >= 65
                    ? "bg-indigo-600"
                    : "bg-amber-600"
            }`}
          />
          <span className={`text-sm font-medium ${verdict.color}`}>{verdict.text}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            View Profile
          </button>
          <button
            onClick={handleAddToShortlist}
            disabled={isAdded}
            className={`
              relative overflow-hidden px-4 py-2 border rounded-lg
              transition-all duration-200 active:scale-98
              ${
                isAdded
                  ? "border-green-600 bg-green-50 text-green-600"
                  : "border-gray-300 hover:border-blue-600 hover:bg-blue-50 text-gray-700"
              }
            `}
            aria-label={isAdded ? "Added to shortlist" : "Add to shortlist"}
          >
            {isAdded ? (
              <Check className={`w-5 h-5 ${isAnimating ? "animate-scale-check" : ""}`} />
            ) : (
              <Plus className="w-5 h-5" />
            )}

            {/* Confetti effect */}
            {isAnimating && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-green-600 rounded-full animate-confetti"
                    style={{
                      left: "50%",
                      top: "50%",
                      animationDelay: `${i * 20}ms`,
                      transform: `rotate(${i * 36}deg)`,
                    }}
                  />
                ))}
              </div>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
