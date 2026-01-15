import { NextRequest, NextResponse } from "next/server";
import type { ClubContext } from "@/lib/club/context";
import { validateClubContext } from "@/lib/club/context";
import { getFitScoreGate } from "@/lib/club-context/fitScoreGate";
import { getClubForUserOrCreate } from "@/lib/auth/getUserAndClub";
import { scoreFit } from "@/lib/fit/scoreFit";
import { calculateAge } from "@/lib/utils";

type PlayerRow = {
  id: string;
  name: string;
  current_team: string | null;
  position: string | null;
  nationality: string | null;
  dob: string | null;
  data: unknown;
};

type ScoreContribution = {
  label: string;
  points: number;
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDateTime(date: Date) {
  const datePart = formatDate(date);
  const timePart = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return `${datePart} at ${timePart}`;
}

function getConfidenceLine(level: string) {
  if (level === "high") return "Based on 12 / 14 factors";
  if (level === "good") return "Based on 8 / 11 factors";
  return "Based on 6 / 14 factors";
}

function buildBreakdown(playerData: any, context: ClubContext): ScoreContribution[] {
  const contributions: ScoreContribution[] = [];
  let score = 50;

  const playerPosition =
    playerData?.detailedPosition?.name || playerData?.position?.name;
  if (
    playerPosition &&
    context.recruitment?.priority_positions?.includes(playerPosition)
  ) {
    score += 20;
    contributions.push({ label: "Matches target position", points: 20 });
  } else if (playerPosition) {
    score -= 10;
    contributions.push({ label: "Position mismatch", points: -10 });
  }

  const age = calculateAge(playerData?.date_of_birth);
  if (age !== null && context.recruitment?.age_preference) {
    const { min, max, ideal } = context.recruitment.age_preference;
    if (age >= min && age <= max) {
      const distanceFromIdeal = Math.abs(age - ideal);
      if (distanceFromIdeal <= 2) {
        score += 15;
        contributions.push({ label: "Age within preferred range", points: 15 });
      } else if (distanceFromIdeal <= 5) {
        score += 5;
        contributions.push({ label: "Age near preferred range", points: 5 });
      }
    } else {
      score -= 15;
      contributions.push({ label: "Age outside preferred range", points: -15 });
    }
  }

  const marketValue = playerData?.market_value;
  const budget = context.finances?.transfer_budget_eur;
  if (marketValue && budget && budget > 0) {
    if (marketValue <= budget) {
      score += 10;
      contributions.push({ label: "Market value within budget", points: 10 });
    } else {
      score -= 15;
      contributions.push({ label: "Market value exceeds budget", points: -15 });
    }
  }

  const currentTeam = playerData?.teams?.find(
    (t: any) => t?.pivot?.end === null || !t?.pivot?.end
  );
  const contractEnd = currentTeam?.pivot?.end;
  if (contractEnd) {
    const contractDate = new Date(contractEnd);
    const now = new Date();
    const monthsUntilExpiry =
      (contractDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsUntilExpiry <= 6 && monthsUntilExpiry > 0) {
      score += 10;
      contributions.push({ label: "Contract expires soon", points: 10 });
    } else if (monthsUntilExpiry > 12) {
      score -= 5;
      contributions.push({ label: "Contract term long", points: -5 });
    }
  }

  const nationality = playerData?.nationality?.name;
  if (
    nationality &&
    context.recruitment?.preferred_nationalities?.includes(nationality)
  ) {
    score += 5;
    contributions.push({ label: "Preferred nationality", points: 5 });
  }

  return contributions;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
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
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const url = new URL(request.url);
    const depth = url.searchParams.get("depth") === "dense" ? "dense" : "quick";

    const playerRow = player as PlayerRow;
    const playerData = playerRow.data as any;
    const age = calculateAge(playerRow.dob);
    const fitResult =
      gate.unlocked && playerData
        ? scoreFit(playerData, clubContext as ClubContext)
        : null;

    const fitScore = fitResult?.score ?? null;
    const verdict = fitResult?.verdict ?? "Not Assessed";
    const strengths = fitResult?.strengths ?? [];
    const risks = fitResult?.concerns ?? [];
    const missingFieldsTop3 = formatMissingFields([
      ...validation.missing_required_fields,
      ...validation.blocking_missing_fields,
    ]);

    const now = new Date();
    const dateLine = formatDate(now);
    const dateTimeLine = formatDateTime(now);

    const factorsTotal = 14;
    const factorsComplete = Math.min(
      factorsTotal,
      Math.max(
        0,
        Math.round((validation.fields_completed / validation.total_fields) * 14)
      )
    );

    const subtitle = `${playerRow.position ?? "N/A"} • ${
      age ? `${age} years` : "Age N/A"
    } • ${playerRow.nationality ?? "N/A"}`;

    const lockedBlock = `
      <div>
        <div>Fit score locked. Complete club profile to unlock scoring.</div>
        <div>Missing: ${escapeHtml(missingFieldsTop3.join(", "))}</div>
      </div>
    `;

    const unlockedBlock = `
      <div>
        <div>Fit Score: ${fitScore ?? "—"}</div>
        <div>Verdict: ${escapeHtml(verdict)}</div>
        <div>${getConfidenceLine(validation.fit_score_confidence)}</div>
      </div>
    `;

    const strengthsBlock =
      strengths.length > 0
        ? strengths
            .slice(0, 3)
            .map((item) => `<div>${escapeHtml(item)}</div>`)
            .join("")
        : `<div>Insufficient data for detailed assessment</div>`;

    const risksBlock =
      risks.length > 0
        ? risks
            .slice(0, 3)
            .map((item) => `<div>${escapeHtml(item)}</div>`)
            .join("")
        : `<div>Insufficient data for detailed assessment</div>`;

    const contractExpiry =
      playerData?.teams?.find((team: any) => team?.pivot?.end)?.pivot?.end ??
      "Contract details not available";

    const marketValue =
      playerData?.market_value !== undefined && playerData?.market_value !== null
        ? `€${playerData.market_value}M`
        : "Market value not available";

    const reportHtml = `
      <div>
        <h1>Player Report: ${escapeHtml(playerRow.name)}</h1>
        <p>${escapeHtml(subtitle)}</p>
        <p>Current club: ${escapeHtml(playerRow.current_team ?? "Unknown club")}</p>
        <p>${depth === "dense" ? "Dense Report" : "Quick Report"}</p>
        <p>Generated on ${dateLine}</p>
        <hr />
        ${gate.unlocked ? unlockedBlock : lockedBlock}
        <hr />
        <h2>✓ Key Strengths</h2>
        ${strengthsBlock}
        <h2>⚠ Key Risks</h2>
        ${risksBlock}
        <h2>Profile Essentials</h2>
        <div>Position: ${escapeHtml(playerRow.position ?? "N/A")}</div>
        <div>Age: ${age ? `${age} years` : "Age N/A"}</div>
        <div>Nationality: ${escapeHtml(playerRow.nationality ?? "N/A")}</div>
        <h2>Contract & Market</h2>
        <div>Contract Expiry: ${escapeHtml(contractExpiry)}</div>
        <div>Market Value: ${escapeHtml(marketValue)}</div>
        ${
          depth === "dense"
            ? `
        <h2>Detailed Fit Analysis</h2>
        ${
          gate.unlocked
            ? strengths.length === 0 && risks.length === 0
              ? `<div>Insufficient data for detailed assessment</div>`
              : ""
            : `<div>Complete club profile to see detailed fit analysis</div>`
        }
        <h2>Performance Context</h2>
        <div>Performance data not available for current season</div>
        <h2>Market Context</h2>
        <div>No recent transfer activity</div>
        <h2>Career Timeline</h2>
        <div>No recent transfer activity</div>
        <h2>Internal Notes</h2>
        <div>No internal notes</div>
        `
            : ""
        }
        <hr />
        <div>Report generated by SKOUTEX</div>
        <div>Generated on ${dateTimeLine}</div>
        <div>Data completeness: ${factorsComplete} of 14 required fields</div>
        ${
          missingFieldsTop3.length > 0
            ? `<div>Note: Some fit factors unavailable. Missing: ${escapeHtml(
                missingFieldsTop3.join(", ")
              )}.</div>`
            : ""
        }
        ${
          depth === "dense"
            ? `<div>Dense report • Generated by SKOUTEX</div>`
            : ""
        }
      </div>
    `;

    const reportJson = {
      depth,
      generatedAtISO: now.toISOString(),
      gateLocked: !gate.unlocked,
      missingFieldsTop3,
      player: {
        id: playerRow.id,
        name: playerRow.name,
        position: playerRow.position,
        nationality: playerRow.nationality,
        dob: playerRow.dob,
        current_team: playerRow.current_team,
      },
      fitScore: fitScore,
      verdict,
      strengths,
      risks,
      confidence: getConfidenceLine(validation.fit_score_confidence),
      dataCompleteness: {
        completed: factorsComplete,
        total: factorsTotal,
      },
      breakdown: gate.unlocked ? buildBreakdown(playerData, clubContext as ClubContext) : [],
    };

    return NextResponse.json({
      depth,
      generatedAtISO: now.toISOString(),
      gateLocked: !gate.unlocked,
      missingFieldsTop3,
      reportHtml,
      reportJson,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
