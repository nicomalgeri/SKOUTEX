import { NextResponse } from "next/server";
import { getClubForUserOrCreate } from "@/lib/auth/getUserAndClub";
import { getFitScoreGate } from "@/lib/club-context/fitScoreGate";
import type { ClubContext } from "@/lib/club/context";
import { scoreFit } from "@/lib/fit/scoreFit";
import { getSportmonksClient } from "@/lib/sportmonks";

type PlayerRow = {
  id: string;
  name: string;
  current_team: string | null;
  position: string | null;
  nationality: string | null;
  dob: string | null;
  sportmonks_player_id: number;
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

export async function GET() {
  try {
    const { club, supabase } = await getClubForUserOrCreate();

    const clubContext = (club.club_context as Partial<ClubContext>) ?? {};
    const gate = getFitScoreGate(clubContext);

    const { data, error } = await supabase
      .from("inbound_targets")
      .select(
        "id, status, source, created_at, player_id, players(id, name, current_team, position, nationality, dob, sportmonks_player_id, data)"
      )
      .eq("club_id", club.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to load inbound targets" },
        { status: 500 }
      );
    }

    const targets = await Promise.all(
      (data ?? []).map(async (target) => {
        const player =
          (Array.isArray(target.players)
            ? target.players[0]
            : target.players) as PlayerRow | null;

        // Base target response
        const baseTarget = {
          id: target.id,
          status: target.status,
          source: target.source || "whatsapp_transfermarkt",
          created_at: target.created_at,
          player: player
            ? {
                id: player.id,
                name: player.name,
                current_team: player.current_team,
                position: player.position,
                nationality: player.nationality,
                dob: player.dob,
              }
            : null,
        };

        // If gate is locked or player not ready, return without fit score
        if (!gate.unlocked || target.status !== "READY" || !player) {
          return {
            ...baseTarget,
            fit_percent: null,
            verdict: "Not Assessed",
            strengths: [],
            concerns: [],
            gate_locked: !gate.unlocked,
            data_gaps: gate.unlocked
              ? []
              : formatMissingFields([
                  ...gate.missing_required_fields,
                  ...gate.blocking_missing_fields,
                ]),
          };
        }

        // Fetch full player data from Sportmonks to score fit
        try {
          const client = getSportmonksClient();
          const playerResponse = await client.getPlayerById(
            player.sportmonks_player_id,
            "position;detailedPosition;nationality"
          );

          const fitResult = scoreFit(
            playerResponse.data,
            clubContext as ClubContext
          );

          return {
            ...baseTarget,
            fit_percent: fitResult.score,
            verdict: fitResult.verdict,
            strengths: fitResult.strengths,
            concerns: fitResult.concerns,
            gate_locked: false,
            data_gaps: [],
          };
        } catch (fitError) {
          console.error("Failed to calculate fit score:", fitError);
          return {
            ...baseTarget,
            fit_percent: null,
            verdict: "Not Assessed",
            strengths: [],
            concerns: [],
            gate_locked: false,
            data_gaps: [],
          };
        }
      })
    );

    return NextResponse.json({ targets });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to load inbound targets" },
      { status: 500 }
    );
  }
}
