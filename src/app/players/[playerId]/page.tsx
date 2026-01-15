import Link from "next/link";
import { notFound } from "next/navigation";
import type { ClubContext } from "@/lib/club/context";
import { validateClubContext } from "@/lib/club/context";
import { getFitScoreGate } from "@/lib/club-context/fitScoreGate";
import { getClubForUserOrCreate } from "@/lib/auth/getUserAndClub";
import { scoreFit } from "@/lib/fit/scoreFit";
import { calculateAge, getInitials } from "@/lib/utils";

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

function getFitScoreClass(score: number | null) {
  if (score === null) return "mt-3 text-7xl font-bold text-gray-400";
  if (score >= 80) return "mt-3 text-7xl font-bold text-green-600";
  if (score >= 50) return "mt-3 text-7xl font-bold text-yellow-600";
  return "mt-3 text-7xl font-bold text-red-600";
}

function getVerdictBadgeClass(verdict: string) {
  if (verdict === "Strong Fit") {
    return "mt-3 inline-flex items-center rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700";
  }
  if (verdict === "Moderate Fit") {
    return "mt-3 inline-flex items-center rounded-full border border-yellow-200 bg-yellow-50 px-4 py-1.5 text-sm font-medium text-yellow-700";
  }
  if (verdict === "Poor Fit") {
    return "mt-3 inline-flex items-center rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-sm font-medium text-red-700";
  }
  return "mt-3 inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm font-medium text-gray-500";
}

function Section({
  title,
  children,
  open,
}: {
  title: string;
  children: React.ReactNode;
  open?: boolean;
}) {
  return (
    <details className="mb-3 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm" open={open}>
      <summary className="flex w-full cursor-pointer items-center justify-between p-6 text-left transition-colors hover:bg-gray-50">
        <span className="text-lg font-bold text-gray-900">{title}</span>
        <span className="text-gray-400">▼</span>
      </summary>
      <div className="border-t border-gray-100 p-6">{children}</div>
    </details>
  );
}

export default async function PlayerReportPage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = await params;
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
  const initials = getInitials(playerRow.name);
  const height = playerData?.height ?? "N/A";
  const weight = playerData?.weight ?? "N/A";
  const preferredFoot = playerData?.preferred_foot ?? "N/A";
  const contractExpiry =
    playerData?.teams?.find((team: any) => team?.pivot?.end)?.pivot?.end ??
    "Contract details not available";
  const marketValue =
    playerData?.market_value !== undefined && playerData?.market_value !== null
      ? `€${playerData.market_value}M`
      : "Market value not available";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/inbound-targets" className="hover:text-gray-900 transition-colors">
              Inbound Targets
            </Link>
            <span className="text-gray-400">›</span>
            <span className="text-gray-900 font-medium">{playerRow.name}</span>
          </div>
        </div>

        <section className="mb-8 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="text-4xl font-bold text-gray-900">
                {playerRow.name}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {playerRow.position && (
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                    {playerRow.position}
                  </span>
                )}
                <span className="text-lg text-gray-600">
                  {age ? `${age} years` : "Age N/A"}
                </span>
              </div>
              <div className="mt-3 text-lg text-gray-700">
                <span className="font-medium">
                  {playerRow.nationality ?? "N/A"}
                </span>
                <span className="text-gray-500"> • </span>
                <span className="font-medium">
                  {playerRow.current_team ?? "Unknown club"}
                </span>
                <span className="text-gray-500"> • </span>
                <span className="font-medium">League N/A</span>
              </div>
            </div>
            <div className="shrink-0">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-gray-100 bg-gray-200 text-2xl font-bold text-gray-600">
                {initials}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Fit Score
          </div>
          {gate.unlocked ? (
            <>
              <div className={getFitScoreClass(fitScore)}>
                {fitScore ?? "—"}
              </div>
              <div className={getVerdictBadgeClass(verdict)}>{verdict}</div>
              <div className="mt-4 text-xs text-gray-500">
                {getConfidenceText(validation.fit_score_confidence)}
              </div>
            </>
          ) : (
            <>
              <div className="mt-4 flex items-center justify-center">
                <div className="h-16 w-16 text-gray-400">🔒</div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Complete club profile to unlock fit scores
              </div>
              <div className="mt-2 text-xs text-gray-400">
                Missing: {missingFields.join(", ")}
              </div>
            </>
          )}
        </section>

        <div className="mb-8 flex flex-wrap gap-3">
          {gate.unlocked ? (
            <button className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 sm:flex-none">
              Add to Shortlist
            </button>
          ) : (
            <button className="flex-1 rounded-lg border border-gray-300 bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-500 shadow-sm sm:flex-none">
              Complete Profile to See Fit Score
            </button>
          )}
          <Link
            href={`/reports/player/${playerRow.id}?depth=quick`}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 sm:flex-none"
          >
            Export Report
          </Link>
        </div>

        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 text-lg font-bold text-gray-900">Profile</div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Position
              </div>
              <div className="mt-1 text-sm font-medium text-gray-900">
                {playerRow.position ?? "N/A"}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Age
              </div>
              <div className="mt-1 text-sm font-medium text-gray-900">
                {age ? `${age} years` : "Age N/A"}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Nationality
              </div>
              <div className="mt-1 text-sm font-medium text-gray-900">
                {playerRow.nationality ?? "N/A"}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Height
              </div>
              <div className="mt-1 text-sm font-medium text-gray-900">
                {height}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Weight
              </div>
              <div className="mt-1 text-sm font-medium text-gray-900">
                {weight}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Preferred Foot
              </div>
              <div className="mt-1 text-sm font-medium text-gray-900">
                {preferredFoot}
              </div>
            </div>
          </div>
        </section>

        <Section title="Contract & Availability" open>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Current Club
              </div>
              <div className="mt-1 text-sm font-medium text-gray-900">
                {playerRow.current_team ?? "Unknown club"}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Contract Expiry
              </div>
              <div className="mt-1 text-sm font-medium text-gray-900">
                {contractExpiry || "Contract details not available"}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Market Value
              </div>
              <div className="mt-1 text-sm font-medium text-gray-900">
                {marketValue}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Transfer Status
              </div>
              <div className="mt-1 text-sm font-medium text-gray-900">
                Available
              </div>
            </div>
          </div>
        </Section>

        <Section title="Fit Analysis" open={gate.unlocked}>
          {gate.unlocked ? (
            strengths.length === 0 && concerns.length === 0 ? (
              <div className="text-sm text-gray-500">
                Insufficient data for detailed assessment
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-green-700">
                    ✓ Strengths
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    {strengths.slice(0, 3).map((item) => (
                      <div className="flex items-start gap-2" key={item}>
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-600" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-amber-700">
                    ⚠ Risks
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    {concerns.slice(0, 3).map((item) => (
                      <div className="flex items-start gap-2" key={item}>
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="py-8 text-center">
              <div className="text-sm text-gray-600">
                Complete club profile to see detailed fit analysis
              </div>
            </div>
          )}
        </Section>

        <Section title="Performance">
          <div className="text-sm text-gray-500">
            Performance data not available for current season
          </div>
        </Section>

        <Section title="Market Context">
          <div className="text-sm text-gray-500">
            No recent transfer activity
          </div>
        </Section>

        <Section title="Career">
          <div className="text-sm text-gray-500">
            No recent transfer activity
          </div>
        </Section>

        <Section title="Notes">
          <div className="py-8 text-center">
            <div className="text-sm text-gray-500">
              No internal notes yet. Add the first note.
            </div>
            <button className="mt-4 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50">
              Add Note
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}
