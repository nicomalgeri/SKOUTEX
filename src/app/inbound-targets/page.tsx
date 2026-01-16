"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRelativeTime, getPositionCode } from "@/lib/utils";
import { LockClosedIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

type TargetRow = {
  id: string;
  status: string;
  source: string;
  created_at: string;
  player: {
    id: string;
    name: string;
    current_team: string | null;
    position: string | null;
    nationality: string | null;
    dob: string | null;
  } | null;
  fit_percent: number | null;
  verdict: "Strong Fit" | "Moderate Fit" | "Poor Fit" | "Not Assessed";
  strengths: string[];
  concerns: string[];
  gate_locked: boolean;
  data_gaps: string[];
};

function statusClass(status: string) {
  if (status === "READY") return "bg-green-100 text-green-700";
  if (status === "FAILED") return "bg-red-100 text-red-700";
  if (status === "NEEDS_CONFIRMATION") return "bg-amber-100 text-amber-700";
  if (status === "RESOLVING") return "bg-blue-100 text-blue-700";
  if (status === "RECEIVED") return "bg-gray-100 text-gray-700";
  return "bg-gray-100 text-gray-700";
}

function fitScoreColor(score: number | null): string {
  if (score === null) return "text-gray-400";
  if (score >= 80) return "text-green-600";
  if (score >= 50) return "text-yellow-600";
  return "text-red-600";
}

function verdictBadgeClass(verdict: string): string {
  if (verdict === "Strong Fit") return "bg-green-50 text-green-700 border-green-200";
  if (verdict === "Moderate Fit") return "bg-yellow-50 text-yellow-700 border-yellow-200";
  if (verdict === "Poor Fit") return "bg-red-50 text-red-700 border-red-200";
  return "bg-gray-50 text-gray-500 border-gray-200";
}

export default function InboundTargetsPage() {
  const [targets, setTargets] = useState<TargetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTargetId, setExpandedTargetId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadTargets() {
      try {
        const response = await fetch("/api/inbound/targets");
        if (!response.ok) {
          throw new Error("Failed to load inbound targets");
        }
        const data = (await response.json()) as { targets: TargetRow[] };
        if (active) {
          setTargets(data.targets ?? []);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTargets();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900">Inbound Targets</h1>
        <p className="mt-2 text-sm text-gray-600">
          Players sent via WhatsApp and processed by SKOUTEX
        </p>

        <div className="mt-8 space-y-4">
          {loading && (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              Loading...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && targets.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              No inbound targets yet. Send a Transfermarkt link via WhatsApp to get started.
            </div>
          )}

          {!loading &&
            !error &&
            targets.map((target) => {
              const player = target.player;
              const isExpanded = expandedTargetId === target.id;
              const hasDetails =
                (target.strengths.length > 0 || target.concerns.length > 0) &&
                !target.gate_locked;

              return (
                <div
                  key={target.id}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    {/* Left: Player info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          {player ? (
                            <Link
                              href={`/players/${player.id}`}
                              className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              {player.name}
                            </Link>
                          ) : (
                            <div className="text-xl font-bold text-gray-400">
                              Resolving...
                            </div>
                          )}
                          <div className="mt-1 text-sm text-gray-600">
                            {player?.current_team || "Unknown club"}
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            {player?.position && (
                              <span className="inline-flex items-center rounded-md bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                {getPositionCode(player.position)}
                              </span>
                            )}
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                                target.status
                              )}`}
                            >
                              {target.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              WhatsApp • {getRelativeTime(target.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Fit Score */}
                    <div className="flex flex-col items-end gap-2">
                      {target.gate_locked ? (
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 text-gray-400">
                            <LockClosedIcon className="h-8 w-8" />
                          </div>
                          <div className="mt-2 max-w-[200px] text-xs text-gray-500">
                            Complete club profile to unlock fit scores
                          </div>
                          <Link
                            href="/onboarding"
                            className="mt-3 inline-flex min-h-[32px] items-center justify-center rounded-full border border-gray-200 bg-white px-3 text-[11px] font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            Complete Profile
                          </Link>
                          {target.data_gaps.length > 0 && (
                            <div className="mt-2 text-xs text-gray-400">
                              Missing: {target.data_gaps.join(", ")}
                            </div>
                          )}
                        </div>
                      ) : target.fit_percent !== null ? (
                        <div className="text-center">
                          <div
                            className={`text-5xl font-bold ${fitScoreColor(
                              target.fit_percent
                            )}`}
                          >
                            {target.fit_percent}
                          </div>
                          <div className="mt-1 text-xs uppercase tracking-wide text-gray-500">
                            Fit Score
                          </div>
                          <div
                            className={`mt-2 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${verdictBadgeClass(
                              target.verdict
                            )}`}
                          >
                            {target.verdict}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-400">—</div>
                          <div className="mt-1 text-xs text-gray-500">
                            Not Assessed
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expandable Details */}
                  {hasDetails && (
                    <div className="mt-4">
                      <button
                        onClick={() =>
                          setExpandedTargetId(isExpanded ? null : target.id)
                        }
                        className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        <span>
                          {isExpanded ? "Hide Details" : "Show Details"}
                        </span>
                        {isExpanded ? (
                          <ChevronUpIcon className="h-4 w-4" />
                        ) : (
                          <ChevronDownIcon className="h-4 w-4" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-3 space-y-3 rounded-lg bg-gray-50 p-4">
                          {target.strengths.length > 0 && (
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-wide text-green-700">
                                ✓ Strengths (max 2)
                              </div>
                              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                                {target.strengths.map((strength, idx) => (
                                  <li key={idx}>• {strength}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {target.concerns.length > 0 && (
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                                ⚠ Concerns (max 2)
                              </div>
                              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                                {target.concerns.map((concern, idx) => (
                                  <li key={idx}>• {concern}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {target.strengths.length === 0 &&
                            target.concerns.length === 0 && (
                              <div className="text-sm text-gray-500">
                                Insufficient data for detailed assessment
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </main>
  );
}
