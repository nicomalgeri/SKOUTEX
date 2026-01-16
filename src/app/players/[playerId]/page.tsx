import { notFound } from "next/navigation";
import type { ClubContext } from "@/lib/club/context";
import { validateClubContext } from "@/lib/club/context";
import { getFitScoreGate } from "@/lib/club-context/fitScoreGate";
import { getClubForUserOrCreate } from "@/lib/auth/getUserAndClub";
import { scoreFit } from "@/lib/fit/scoreFit";
import PlayerProfileClient from "./PlayerProfileClient";

type PlayerRow = {
  id: string;
  name: string;
  current_team: string | null;
  position: string | null;
  nationality: string | null;
  dob: string | null;
  data: unknown;
  last_fetched_at: string | null;
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
    .select("id, name, current_team, position, nationality, dob, data, last_fetched_at")
    .eq("id", playerId)
    .eq("club_id", club.id)
    .maybeSingle();

  if (playerError || !player) {
    notFound();
  }

  const inboundTargetResult = await supabase
    .from("inbound_targets")
    .select("id, status")
    .eq("club_id", club.id)
    .eq("player_id", playerId)
    .order("created_at", { ascending: false })
    .limit(1);

  const playerRow = player as PlayerRow;
  const playerData = playerRow.data as any;

  const inboundTarget = inboundTargetResult.data as
    | Array<{ status?: string | null }>
    | { status?: string | null }
    | null;
  const targetStatus = Array.isArray(inboundTarget)
    ? inboundTarget[0]?.status
    : inboundTarget?.status;
  const fitReady = gate.unlocked && (!targetStatus || targetStatus === "READY");
  const fitResult =
    fitReady && playerData
      ? scoreFit(playerData, clubContext as ClubContext)
      : null;

  const missingFields = formatMissingFields([
    ...validation.missing_required_fields,
    ...validation.blocking_missing_fields,
  ]);

  return (
    <PlayerProfileClient
      player={playerRow}
      data={playerData}
      fit={{
        score: fitResult?.score ?? null,
        verdict: fitResult?.verdict ?? "Not Assessed",
        strengths: fitResult?.strengths ?? [],
        concerns: fitResult?.concerns ?? [],
        gateUnlocked: gate.unlocked,
        missingFields,
      }}
    />
  );
}
