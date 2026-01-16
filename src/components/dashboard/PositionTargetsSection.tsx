/**
 * Position Targets Section
 * Displays position needs with 2 recommended players each
 */

"use client";

import { PositionTargetCard, type PlayerRecommendation } from "./PositionTargetCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

export interface PositionNeed {
  position: string;
  fullName: string;
  priority: "high" | "medium" | "low";
  recommendations: [PlayerRecommendation, PlayerRecommendation];
}

interface PositionTargetsSectionProps {
  positionNeeds: PositionNeed[];
  onAddToShortlist?: (playerId: number) => void;
  showFitScore?: boolean; // Control whether to show fit scores (for gating)
}

export function PositionTargetsSection({
  positionNeeds,
  onAddToShortlist,
  showFitScore = true,
}: PositionTargetsSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 360; // Approx width of 1 position group
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (positionNeeds.length === 0) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Current Position Targets</h2>
        <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-600 mb-2">No position needs defined yet</p>
          <p className="text-sm text-gray-500">
            Complete your club profile to get personalized player recommendations
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Current Position Targets</h2>
          <p className="text-sm text-gray-500 mt-1">Based on your tactical needs</p>
        </div>

        {/* Desktop scroll controls */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-lg border border-gray-300 hover:border-blue-600 hover:bg-blue-50 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-lg border border-gray-300 hover:border-blue-600 hover:bg-blue-50 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Position needs container */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory md:overflow-x-scroll pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {positionNeeds.map((need, index) => (
            <div
              key={`${need.position}-${index}`}
              className="flex-none snap-start w-[calc(100vw-2rem)] md:w-auto"
            >
              {/* Position header */}
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{need.fullName} Targets</h3>
                <span
                  className={`
                  px-2 py-1 rounded text-xs font-semibold uppercase
                  ${
                    need.priority === "high"
                      ? "bg-red-100 text-red-700"
                      : need.priority === "medium"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                  }
                `}
                >
                  {need.priority}
                </span>
              </div>

              {/* Player cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full md:w-auto">
                {need.recommendations.map((player) => (
                  <div key={player.id} className="w-full md:w-80">
                    <PositionTargetCard
                      player={player}
                      onAddToShortlist={onAddToShortlist}
                      showFitScore={showFitScore}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile swipe indicator */}
        <div className="md:hidden flex justify-center gap-2 mt-4">
          {positionNeeds.map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-gray-300 transition-colors"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
