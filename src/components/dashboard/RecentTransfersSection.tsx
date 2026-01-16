/**
 * Recent Transfers Section
 * Display recent transfers with customizable filters
 */

"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Filter } from "lucide-react";
import Link from "next/link";

export interface Transfer {
  id: string;
  playerName: string;
  fromClub: string;
  toClub: string;
  fee: number;
  feeDisplay: string;
  position: string;
  timestamp: string;
  timeAgo: string;
  playerId?: number;
}

interface TransferFilters {
  leagues: string[];
  positions: string[];
  targetRelatedOnly: boolean;
}

interface RecentTransfersSectionProps {
  transfers: Transfer[];
  availableLeagues?: string[];
  availablePositions?: string[];
  defaultFilters?: Partial<TransferFilters>;
  onFilterChange?: (filters: TransferFilters) => void;
}

export function RecentTransfersSection({
  transfers,
  availableLeagues = ["Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1"],
  availablePositions = ["GK", "CB", "FB", "CM", "W", "ST"],
  defaultFilters,
  onFilterChange,
}: RecentTransfersSectionProps) {
  const [filters, setFilters] = useState<TransferFilters>({
    leagues: defaultFilters?.leagues || [],
    positions: defaultFilters?.positions || [],
    targetRelatedOnly: defaultFilters?.targetRelatedOnly || false,
  });
  const [expandedTransfer, setExpandedTransfer] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (newFilters: Partial<TransferFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange?.(updated);
  };

  const formatFee = (fee: number): string => {
    if (fee >= 1000000) {
      return `£${(fee / 1000000).toFixed(1)}M`;
    }
    if (fee >= 1000) {
      return `£${(fee / 1000).toFixed(0)}K`;
    }
    return `£${fee}`;
  };

  const toggleTransferExpand = (transferId: string) => {
    setExpandedTransfer(expandedTransfer === transferId ? null : transferId);
  };

  const getActiveFilterCount = (): number => {
    let count = 0;
    if (filters.leagues.length > 0) count++;
    if (filters.positions.length > 0) count++;
    if (filters.targetRelatedOnly) count++;
    return count;
  };

  return (
    <section className="mb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Recent Transfers</h2>
          <p className="text-sm text-gray-500 mt-1">
            Last 7 days
            {filters.leagues.length > 0 && ` • ${filters.leagues.join(", ")}`}
          </p>
        </div>

        {/* Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
          {getActiveFilterCount() > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Leagues Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leagues
              </label>
              <div className="space-y-2">
                {availableLeagues.map((league) => (
                  <label key={league} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.leagues.includes(league)}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...filters.leagues, league]
                          : filters.leagues.filter((l) => l !== league);
                        handleFilterChange({ leagues: updated });
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{league}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Positions Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Positions
              </label>
              <div className="space-y-2">
                {availablePositions.map((position) => (
                  <label key={position} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.positions.includes(position)}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...filters.positions, position]
                          : filters.positions.filter((p) => p !== position);
                        handleFilterChange({ positions: updated });
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{position}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Target Related Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.targetRelatedOnly}
                  onChange={(e) =>
                    handleFilterChange({ targetRelatedOnly: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Only show target-related</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Transfers List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {transfers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No transfers match your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {transfers.map((transfer) => (
              <div key={transfer.id}>
                {/* Transfer Row */}
                <div
                  onClick={() => toggleTransferExpand(transfer.id)}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  {/* Player Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {transfer.playerName}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {transfer.fromClub} → {transfer.toClub}
                      </p>
                    </div>
                  </div>

                  {/* Transfer Details */}
                  <div className="hidden md:flex items-center gap-6">
                    <span className="font-mono font-semibold text-gray-900 min-w-[80px] text-right">
                      {transfer.feeDisplay}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700 min-w-[40px] text-center">
                      {transfer.position}
                    </span>
                    <span className="text-sm text-gray-500 min-w-[80px] text-right">
                      {transfer.timeAgo}
                    </span>
                  </div>

                  {/* Mobile Details */}
                  <div className="flex md:hidden items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {transfer.feeDisplay}
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        expandedTransfer === transfer.id ? "rotate-90" : ""
                      }`}
                    />
                  </div>

                  {/* Desktop Expand Icon */}
                  <div className="hidden md:block ml-4">
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedTransfer === transfer.id ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedTransfer === transfer.id && (
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Fee</span>
                        <p className="font-mono font-semibold text-gray-900">
                          £{(transfer.fee / 1000000).toFixed(2)}M
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Position</span>
                        <p className="font-medium text-gray-900">{transfer.position}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Date</span>
                        <p className="text-gray-900">{transfer.timeAgo}</p>
                      </div>
                      <div>
                        {transfer.playerId && (
                          <Link
                            href={`/dashboard/players/${transfer.playerId}`}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Profile →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
