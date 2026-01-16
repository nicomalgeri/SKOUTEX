"use client";

import { useState } from "react";
import Header from "@/components/dashboard/Header";
import { TargetCard } from "@/components/TargetCard";
import { useTargets } from "@/lib/hooks";
import {
  TARGET_STATUSES,
  TARGET_PRIORITIES,
  TargetStatus,
  TargetPriority,
} from "@/lib/targets/types";
import { Loader2, Target, Filter } from "lucide-react";

export default function TargetsPage() {
  const [statusFilter, setStatusFilter] = useState<TargetStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TargetPriority | "all">(
    "all"
  );

  const { targets, loading, error, updateTarget, deleteTarget, refetch } =
    useTargets({
      status: statusFilter === "all" ? undefined : statusFilter,
      priority: priorityFilter === "all" ? undefined : priorityFilter,
    });

  // Group targets by status
  const activeTargets = targets.filter(
    (t) =>
      !["completed", "rejected", "abandoned"].includes(t.status)
  );
  const completedTargets = targets.filter((t) => t.status === "completed");
  const archivedTargets = targets.filter((t) =>
    ["rejected", "abandoned"].includes(t.status)
  );

  // Count by priority
  const highPriorityCount = activeTargets.filter(
    (t) => t.priority === "high"
  ).length;
  const mediumPriorityCount = activeTargets.filter(
    (t) => t.priority === "medium"
  ).length;
  const lowPriorityCount = activeTargets.filter(
    (t) => t.priority === "low"
  ).length;

  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      <Header
        title="Transfer Targets"
        subtitle="Manage your transfer shortlist"
        showClubInfo
      />

      <div className="p-4 lg:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {activeTargets.length}
                </p>
                <p className="text-sm text-gray-500">Active Targets</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-red-600 rounded-full" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {highPriorityCount}
                </p>
                <p className="text-sm text-gray-500">High Priority</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-amber-600 rounded-full" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {mediumPriorityCount}
                </p>
                <p className="text-sm text-gray-500">Medium Priority</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-green-600 rounded-full" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {completedTargets.length}
                </p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-700">Filters</h3>
          </div>

          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0031FF]"
              >
                <option value="all">All Statuses</option>
                {TARGET_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Priority
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0031FF]"
              >
                <option value="all">All Priorities</option>
                {TARGET_PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {(statusFilter !== "all" || priorityFilter !== "all") && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setStatusFilter("all");
                    setPriorityFilter("all");
                  }}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#0031FF] animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium">Failed to load targets</p>
            <p className="text-sm text-red-500 mt-1">{error.message}</p>
            <button
              onClick={refetch}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && targets.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No transfer targets yet
            </h3>
            <p className="text-gray-500 mb-4">
              Start building your shortlist by adding players from search results
            </p>
            <a
              href="/dashboard/search"
              className="inline-block px-4 py-2 bg-[#0031FF] text-white rounded-lg hover:bg-[#0028DD] transition-colors"
            >
              Search Players
            </a>
          </div>
        )}

        {/* Active Targets */}
        {!loading && !error && activeTargets.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Active Targets ({activeTargets.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeTargets.map((target) => (
                <TargetCard
                  key={target.id}
                  target={target}
                  onUpdate={updateTarget}
                  onDelete={deleteTarget}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Targets */}
        {!loading && !error && completedTargets.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Completed ({completedTargets.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {completedTargets.map((target) => (
                <TargetCard
                  key={target.id}
                  target={target}
                  onUpdate={updateTarget}
                  onDelete={deleteTarget}
                />
              ))}
            </div>
          </div>
        )}

        {/* Archived Targets */}
        {!loading && !error && archivedTargets.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Archived ({archivedTargets.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {archivedTargets.map((target) => (
                <TargetCard
                  key={target.id}
                  target={target}
                  onUpdate={updateTarget}
                  onDelete={deleteTarget}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
