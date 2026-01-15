import { notFound } from "next/navigation";
import type { ClubContext } from "@/lib/club/context";
import { validateClubContext } from "@/lib/club/context";
import { getFitScoreGate } from "@/lib/club-context/fitScoreGate";
import { getClubForUserOrCreate } from "@/lib/auth/getUserAndClub";
import { scoreFit } from "@/lib/fit/scoreFit";
import { calculateAge } from "@/lib/utils";
import { PrintControls } from "./PrintControls";

type PlayerRow = {
  id: string;
  name: string;
  current_team: string | null;
  position: string | null;
  nationality: string | null;
  dob: string | null;
  data: unknown;
};

function formatMissingFields(fields: string[]): string[] {
  const labels: Record<string, string> = {
    "finances.transfer_budget_eur": "Transfer budget",
    "finances.wage_budget_weekly_eur": "Wage budget",
    "recruitment.priority_positions": "Key positions",
    "playing_style.formation_primary": "Formation",
    "identity.league": "League",
    "identity.tier": "Club tier",
    "recruitment.age_preference.min": "Age range",
    "recruitment.age_preference.max": "Age range",
    "recruitment.age_preference.ideal": "Age range",
    "strategy.season_objective": "Season objective",
    "strategy.risk_appetite": "Risk appetite",
  };

  const formatted = new Set<string>();
  for (const field of fields) {
    const label = labels[field] || field;
    formatted.add(label);
  }

  return Array.from(formatted).slice(0, 3);
}

function getConfidenceText(level: string) {
  if (level === "high") return "Based on 12 / 14 factors";
  if (level === "good") return "Based on 8 / 11 factors";
  return "Based on 6 / 14 factors";
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(date: Date): string {
  const dateStr = formatDate(date);
  const timeStr = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateStr} at ${timeStr}`;
}

export default async function PlayerReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ playerId: string }>;
  searchParams: Promise<{ depth?: string }>;
}) {
  const { playerId } = await params;
  const { depth = "quick" } = await searchParams;
  const isDense = depth === "dense";

  const { club, supabase } = await getClubForUserOrCreate();
  const clubContext = (club.club_context as Partial<ClubContext>) ?? {};
  const gate = getFitScoreGate(clubContext);
  const validation = validateClubContext(clubContext as ClubContext);

  const { data: player, error: playerError } = await supabase
    .from("players")
    .select("id, name, current_team, position, nationality, dob, data")
    .eq("id", playerId)
    .eq("club_id", club.id)
    .maybeSingle();

  if (playerError || !player) {
    notFound();
  }

  const playerRow = player as PlayerRow;
  const playerData = playerRow.data as any;

  const fitResult =
    gate.unlocked && playerData
      ? scoreFit(playerData, clubContext as ClubContext)
      : null;
  const fitScore = fitResult?.score ?? null;
  const verdict = fitResult?.verdict ?? "Not Assessed";
  const strengths = fitResult?.strengths ?? [];
  const concerns = fitResult?.concerns ?? [];
  const missingFields = formatMissingFields([
    ...validation.missing_required_fields,
    ...validation.blocking_missing_fields,
  ]);

  const age = calculateAge(playerRow.dob);
  const height = playerData?.height ?? "N/A";
  const weight = playerData?.weight ?? "N/A";
  const preferredFoot = playerData?.preferred_foot ?? "N/A";
  const contractExpiry =
    playerData?.teams?.find((team: any) => team?.pivot?.end)?.pivot?.end ??
    null;
  const marketValue = playerData?.market_value ?? null;

  const now = new Date();
  const generatedDate = formatDate(now);
  const generatedDateTime = formatDateTime(now);

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always;
          }
        }
      `}</style>

      <div className="min-h-screen bg-white">
        {/* Print Controls - Hidden on Print */}
        <PrintControls playerId={playerId} isDense={isDense} />

        {/* Report Content */}
        <div className="mx-auto max-w-4xl px-8 py-12">
          {/* Cover Header */}
          <header className="mb-8 border-b border-gray-200 pb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Player Report: {playerRow.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-base text-gray-700">
              <span>{playerRow.position || "N/A"}</span>
              <span className="text-gray-400">•</span>
              <span>{age ? `${age} years` : "Age N/A"}</span>
              <span className="text-gray-400">•</span>
              <span>{playerRow.nationality || "N/A"}</span>
            </div>
            <div className="mt-1 text-base text-gray-700">
              Current club: {playerRow.current_team || "Unknown club"}
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
              <span className="font-medium">
                {isDense ? "Dense Report" : "Quick Report"}
              </span>
              <span>Generated on {generatedDate}</span>
            </div>
          </header>

          {/* Fit Score Summary */}
          <section className="mb-8">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Fit Score Summary
            </h2>
            {gate.unlocked ? (
              <div>
                <div className="mb-2">
                  <span className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Fit Score:{" "}
                  </span>
                  <span className="text-4xl font-bold text-gray-900">
                    {fitScore ?? "—"}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Verdict:{" "}
                  </span>
                  <span className="text-base font-medium text-gray-900">
                    {verdict}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {getConfidenceText(validation.fit_score_confidence)}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                <p className="mb-2">
                  Fit score locked. Complete club profile to unlock scoring.
                </p>
                {missingFields.length > 0 && (
                  <p className="text-gray-500">
                    Missing: {missingFields.join(", ")}
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Key Strengths */}
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-bold text-gray-900">
              ✓ Key Strengths
            </h2>
            {gate.unlocked && strengths.length > 0 ? (
              <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                {strengths.slice(0, isDense ? 3 : 2).map((strength, idx) => (
                  <li key={idx}>{strength}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                Insufficient data for detailed assessment
              </p>
            )}
          </section>

          {/* Key Risks */}
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-bold text-gray-900">⚠ Key Risks</h2>
            {gate.unlocked && concerns.length > 0 ? (
              <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                {concerns.slice(0, isDense ? 3 : 2).map((concern, idx) => (
                  <li key={idx}>{concern}</li>
                ))}
              </ul>
            ) : gate.unlocked ? (
              <p className="text-sm text-gray-500">No risks identified</p>
            ) : (
              <p className="text-sm text-gray-500">
                Insufficient data for detailed assessment
              </p>
            )}
          </section>

          {/* Profile Essentials */}
          <section className="mb-8">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Profile Essentials
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold text-gray-500">Position</div>
                <div className="text-gray-900">
                  {playerRow.position || "N/A"}
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-500">Age</div>
                <div className="text-gray-900">
                  {age ? `${age} years` : "N/A"}
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-500">Nationality</div>
                <div className="text-gray-900">
                  {playerRow.nationality || "N/A"}
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-500">Height</div>
                <div className="text-gray-900">{height}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-500">Weight</div>
                <div className="text-gray-900">{weight}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-500">
                  Preferred Foot
                </div>
                <div className="text-gray-900">{preferredFoot}</div>
              </div>
            </div>
          </section>

          {/* Contract & Market */}
          <section className="mb-8">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Contract & Market
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold text-gray-500">Current Club</div>
                <div className="text-gray-900">
                  {playerRow.current_team || "N/A"}
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-500">
                  Contract Expiry
                </div>
                <div className="text-gray-900">
                  {contractExpiry
                    ? new Date(contractExpiry).toLocaleDateString("en-GB", {
                        month: "long",
                        year: "numeric",
                      })
                    : "Contract details not available"}
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-500">Market Value</div>
                <div className="text-gray-900">
                  {marketValue
                    ? `€${(marketValue / 1000000).toFixed(1)}M`
                    : "Market value not available"}
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-500">
                  Transfer Status
                </div>
                <div className="text-gray-900">Available</div>
              </div>
            </div>
          </section>

          {/* Dense Report Additional Sections */}
          {isDense && (
            <>
              <div className="page-break"></div>

              {/* Detailed Fit Analysis */}
              {gate.unlocked && (
                <section className="mb-8">
                  <h2 className="mb-4 text-xl font-bold text-gray-900">
                    Detailed Fit Analysis
                  </h2>
                  <div className="space-y-3 text-sm text-gray-700">
                    <p>
                      This section shows the scoring breakdown for each fit
                      factor:
                    </p>
                    <ul className="list-inside list-disc space-y-1">
                      <li>
                        <strong>Position match:</strong>{" "}
                        {playerRow.position &&
                        clubContext.recruitment?.priority_positions?.includes(
                          playerRow.position
                        )
                          ? "+20 points (matches priority position)"
                          : playerRow.position
                          ? "-10 points (not a priority position)"
                          : "0 points (position unknown)"}
                      </li>
                      <li>
                        <strong>Age fit:</strong>{" "}
                        {age &&
                        clubContext.recruitment?.age_preference
                          ? age >= clubContext.recruitment.age_preference.min &&
                            age <= clubContext.recruitment.age_preference.max
                            ? `+${Math.abs(age - clubContext.recruitment.age_preference.ideal) <= 2 ? "15" : "5"} points (within preferred range)`
                            : "-15 points (outside preferred range)"
                          : "0 points (age data unavailable)"}
                      </li>
                      <li>
                        <strong>Market value alignment:</strong>{" "}
                        {marketValue && clubContext.finances?.transfer_budget_eur
                          ? marketValue <= clubContext.finances.transfer_budget_eur
                            ? "+10 points (within budget)"
                            : "-15 points (exceeds budget)"
                          : "0 points (market value or budget unavailable)"}
                      </li>
                      <li>
                        <strong>Contract situation:</strong>{" "}
                        {contractExpiry
                          ? (() => {
                              const monthsUntilExpiry =
                                (new Date(contractExpiry).getTime() -
                                  now.getTime()) /
                                (1000 * 60 * 60 * 24 * 30);
                              return monthsUntilExpiry <= 6 &&
                                monthsUntilExpiry > 0
                                ? "+10 points (expires within 6 months)"
                                : monthsUntilExpiry > 12
                                ? "-5 points (long contract remaining)"
                                : "0 points (contract timing neutral)";
                            })()
                          : "0 points (contract details unavailable)"}
                      </li>
                      <li>
                        <strong>Nationality preference:</strong>{" "}
                        {playerRow.nationality &&
                        clubContext.recruitment?.preferred_nationalities?.includes(
                          playerRow.nationality
                        )
                          ? "+5 points (preferred nationality)"
                          : "0 points"}
                      </li>
                    </ul>
                  </div>
                </section>
              )}

              {/* Performance Context */}
              <section className="mb-8">
                <h2 className="mb-4 text-xl font-bold text-gray-900">
                  Performance Context
                </h2>
                <p className="text-sm text-gray-500">
                  Performance data not available for current season
                </p>
              </section>

              {/* Market Context */}
              <section className="mb-8">
                <h2 className="mb-4 text-xl font-bold text-gray-900">
                  Market Context
                </h2>
                <p className="text-sm text-gray-500">
                  No recent transfer activity
                </p>
              </section>

              {/* Career Timeline */}
              <section className="mb-8">
                <h2 className="mb-4 text-xl font-bold text-gray-900">
                  Career Timeline
                </h2>
                <p className="text-sm text-gray-500">
                  No recent transfer activity
                </p>
              </section>

              {/* Internal Notes */}
              <section className="mb-8">
                <h2 className="mb-4 text-xl font-bold text-gray-900">
                  Internal Notes
                </h2>
                <p className="text-sm text-gray-500">No internal notes</p>
              </section>
            </>
          )}

          {/* Footer */}
          <footer className="mt-12 border-t border-gray-200 pt-6 text-sm text-gray-500">
            <div className="mb-2">
              <strong>Report generated by SKOUTEX</strong>
            </div>
            <div className="mb-2">Generated on {generatedDateTime}</div>
            {!gate.unlocked && missingFields.length > 0 && (
              <div className="mt-4 text-xs text-gray-400">
                Note: Some fit factors unavailable. Missing:{" "}
                {missingFields.join(", ")}.
              </div>
            )}
            {gate.unlocked && (
              <div className="mt-4 text-xs text-gray-400">
                Data completeness: {validation.fields_completed} of 14 required
                fields
              </div>
            )}
          </footer>
        </div>
      </div>
    </>
  );
}
