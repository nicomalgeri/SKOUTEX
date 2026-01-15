import type { ClubContext } from "../club/context";
import type { SportmonksPlayer } from "../sportmonks/types";
import { calculateAge } from "../utils";

export type FitScoreResult = {
  score: number;
  verdict: "Strong Fit" | "Moderate Fit" | "Poor Fit" | "Not Assessed";
  strengths: string[];
  concerns: string[];
};

/**
 * Calculate deterministic fit score between a player and club context.
 * Returns a score from 0-100 with strengths and concerns.
 */
export function scoreFit(
  player: SportmonksPlayer,
  context: ClubContext
): FitScoreResult {
  const strengths: string[] = [];
  const concerns: string[] = [];
  let score = 50; // Start at neutral

  // Position fit (critical)
  const playerPosition = player.detailedPosition?.name || player.position?.name;
  if (playerPosition && context.recruitment.priority_positions.includes(playerPosition)) {
    score += 20;
    strengths.push("Matches target position");
  } else if (playerPosition) {
    score -= 10;
  }

  // Age fit
  const age = calculateAge(player.date_of_birth);
  if (age !== null) {
    const { min, max, ideal } = context.recruitment.age_preference;
    if (age >= min && age <= max) {
      const distanceFromIdeal = Math.abs(age - ideal);
      if (distanceFromIdeal <= 2) {
        score += 15;
        strengths.push("Age within preferred range");
      } else if (distanceFromIdeal <= 5) {
        score += 5;
      }
    } else {
      score -= 15;
      concerns.push("Age outside preferred range");
    }
  }

  // Market value fit (if available)
  const marketValue = player.market_value;
  if (marketValue && context.finances.transfer_budget_eur > 0) {
    if (marketValue <= context.finances.transfer_budget_eur) {
      score += 10;
    } else {
      score -= 15;
      concerns.push("Market value exceeds budget");
    }
  }

  // Contract expiry (from current team)
  const currentTeam = player.teams?.find((t) => t.pivot?.end === null || !t.pivot?.end);
  const contractEnd = currentTeam?.pivot?.end;
  if (contractEnd) {
    const contractDate = new Date(contractEnd);
    const now = new Date();
    const monthsUntilExpiry = (contractDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (monthsUntilExpiry <= 6 && monthsUntilExpiry > 0) {
      score += 10;
      strengths.push("Contract expires soon");
    } else if (monthsUntilExpiry > 12) {
      score -= 5;
    }
  }

  // Nationality preference
  const nationality = player.nationality?.name;
  if (nationality) {
    if (context.recruitment.preferred_nationalities.includes(nationality)) {
      score += 5;
    }
  }

  // Cap score at 0-100
  score = Math.max(0, Math.min(100, score));

  // Determine verdict
  let verdict: FitScoreResult["verdict"];
  if (score >= 80) {
    verdict = "Strong Fit";
  } else if (score >= 50) {
    verdict = "Moderate Fit";
  } else {
    verdict = "Poor Fit";
  }

  return {
    score: Math.round(score),
    verdict,
    strengths: strengths.slice(0, 2),
    concerns: concerns.slice(0, 2),
  };
}
