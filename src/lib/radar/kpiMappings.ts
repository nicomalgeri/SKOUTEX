/**
 * KPI Mappings for Radar Charts
 * Position-specific KPI definitions and normalization
 */

import type { RadarChartData } from "@/components/RadarChart";

export type PositionGroup = "CB" | "FB" | "CM" | "W" | "ST" | "GK";

export interface PlayerStats {
  // Defensive
  aerial_duels_won_pct?: number;
  tackles_won_pct?: number;
  interceptions_p90?: number;
  clearances_p90?: number;
  defensive_actions_p90?: number;
  duels_won_pct?: number;
  ball_recoveries_p90?: number;

  // Passing
  pass_completion_pct?: number;
  progressive_passes_p90?: number;
  key_passes_p90?: number;

  // Attacking
  progressive_carries_p90?: number;
  dribbles_won_pct?: number;
  crosses_completed_pct?: number;
  successful_crosses_pct?: number;
  shot_accuracy_pct?: number;
  shot_conversion_pct?: number;
  goal_contributions_p90?: number;
  goals_p90?: number;
  assists_p90?: number;

  // Advanced metrics
  xg_overperformance?: number; // Can be negative
  psxg_plus_minus?: number; // For GK, can be negative

  // Goalkeeper specific
  save_pct?: number;
  clean_sheets_pct?: number;
  crosses_claimed_pct?: number;
  sweeper_actions_p90?: number;
}

interface KPIDefinition {
  key: keyof PlayerStats;
  label: string;
  isPercentage: boolean;
  isPer90: boolean;
}

/**
 * KPI mappings by position group
 */
export const KPI_MAPPINGS: Record<PositionGroup, KPIDefinition[]> = {
  CB: [
    { key: "aerial_duels_won_pct", label: "Aerial", isPercentage: true, isPer90: false },
    { key: "pass_completion_pct", label: "Passing", isPercentage: true, isPer90: false },
    { key: "tackles_won_pct", label: "Tackles", isPercentage: true, isPer90: false },
    { key: "interceptions_p90", label: "Intercepts", isPercentage: false, isPer90: true },
    { key: "progressive_passes_p90", label: "Prog Pass", isPercentage: false, isPer90: true },
    { key: "clearances_p90", label: "Clearances", isPercentage: false, isPer90: true },
  ],
  FB: [
    { key: "tackles_won_pct", label: "Tackles", isPercentage: true, isPer90: false },
    { key: "progressive_carries_p90", label: "Carries", isPercentage: false, isPer90: true },
    { key: "crosses_completed_pct", label: "Crossing", isPercentage: true, isPer90: false },
    { key: "key_passes_p90", label: "Key Pass", isPercentage: false, isPer90: true },
    { key: "dribbles_won_pct", label: "Dribbling", isPercentage: true, isPer90: false },
    { key: "defensive_actions_p90", label: "Defense", isPercentage: false, isPer90: true },
  ],
  CM: [
    { key: "pass_completion_pct", label: "Passing", isPercentage: true, isPer90: false },
    { key: "progressive_passes_p90", label: "Prog Pass", isPercentage: false, isPer90: true },
    { key: "ball_recoveries_p90", label: "Recovery", isPercentage: false, isPer90: true },
    { key: "key_passes_p90", label: "Creation", isPercentage: false, isPer90: true },
    { key: "dribbles_won_pct", label: "Dribbling", isPercentage: true, isPer90: false },
    { key: "duels_won_pct", label: "Duels", isPercentage: true, isPer90: false },
  ],
  W: [
    { key: "dribbles_won_pct", label: "Dribbling", isPercentage: true, isPer90: false },
    { key: "key_passes_p90", label: "Creation", isPercentage: false, isPer90: true },
    { key: "shot_accuracy_pct", label: "Shooting", isPercentage: true, isPer90: false },
    { key: "progressive_carries_p90", label: "Carries", isPercentage: false, isPer90: true },
    { key: "goal_contributions_p90", label: "G+A", isPercentage: false, isPer90: true },
    { key: "successful_crosses_pct", label: "Crossing", isPercentage: true, isPer90: false },
  ],
  ST: [
    { key: "shot_conversion_pct", label: "Finishing", isPercentage: true, isPer90: false },
    { key: "goals_p90", label: "Goals", isPercentage: false, isPer90: true },
    { key: "xg_overperformance", label: "xG +/-", isPercentage: false, isPer90: false },
    { key: "aerial_duels_won_pct", label: "Aerial", isPercentage: true, isPer90: false },
    { key: "key_passes_p90", label: "Link-up", isPercentage: false, isPer90: true },
    { key: "dribbles_won_pct", label: "Dribbling", isPercentage: true, isPer90: false },
  ],
  GK: [
    { key: "save_pct", label: "Saves", isPercentage: true, isPer90: false },
    { key: "clean_sheets_pct", label: "Clean", isPercentage: true, isPer90: false },
    { key: "pass_completion_pct", label: "Passing", isPercentage: true, isPer90: false },
    { key: "crosses_claimed_pct", label: "Claims", isPercentage: true, isPer90: false },
    { key: "sweeper_actions_p90", label: "Sweeping", isPercentage: false, isPer90: true },
    { key: "psxg_plus_minus", label: "PSxG", isPercentage: false, isPer90: false },
  ],
};

/**
 * Map player position to position group
 */
export function getPositionGroup(position: string): PositionGroup {
  const pos = position.toUpperCase();

  if (["CB", "DC"].includes(pos)) return "CB";
  if (["LB", "RB", "LWB", "RWB", "WB"].includes(pos)) return "FB";
  if (["CM", "CDM", "CAM", "DM", "AM"].includes(pos)) return "CM";
  if (["LW", "RW", "LM", "RM", "W"].includes(pos)) return "W";
  if (["ST", "CF", "F"].includes(pos)) return "ST";
  if (["GK"].includes(pos)) return "GK";

  // Default to CM for unknown positions
  return "CM";
}

/**
 * Normalize a stat value to 0-10 scale based on percentile
 */
function normalizePercentile(percentile: number): number {
  return (percentile / 100) * 10;
}

/**
 * Normalize a percentage stat to 0-10 scale
 */
function normalizePercentage(percentage: number): number {
  return (percentage / 100) * 10;
}

/**
 * Normalize xG overperformance (±2σ)
 */
function normalizeXGOverperformance(value: number): number {
  // Assuming values typically range from -2 to +2
  // Map to 0-10 scale where 5 = neutral (0)
  const normalized = ((value + 2) / 4) * 10;
  return Math.max(0, Math.min(10, normalized));
}

/**
 * Normalize PSxG+/- for goalkeepers (±2σ)
 */
function normalizePSxG(value: number): number {
  // Similar to xG overperformance
  const normalized = ((value + 2) / 4) * 10;
  return Math.max(0, Math.min(10, normalized));
}

/**
 * Generate radar chart data for a player
 */
export function generateRadarData(
  position: string,
  stats: PlayerStats,
  percentiles?: Partial<Record<keyof PlayerStats, number>>
): RadarChartData[] {
  const positionGroup = getPositionGroup(position);
  const kpiDefs = KPI_MAPPINGS[positionGroup];

  return kpiDefs.map((kpiDef) => {
    const rawValue = stats[kpiDef.key];
    const percentile = percentiles?.[kpiDef.key];

    // If we have percentile data, use that
    if (percentile !== undefined) {
      return {
        label: kpiDef.label,
        value: normalizePercentile(percentile),
        percentile,
      };
    }

    // Otherwise, normalize based on the stat type
    if (rawValue === undefined) {
      return {
        label: kpiDef.label,
        value: 0,
      };
    }

    let normalizedValue: number;

    if (kpiDef.isPercentage) {
      normalizedValue = normalizePercentage(rawValue);
    } else if (kpiDef.key === "xg_overperformance") {
      normalizedValue = normalizeXGOverperformance(rawValue);
    } else if (kpiDef.key === "psxg_plus_minus") {
      normalizedValue = normalizePSxG(rawValue);
    } else {
      // For per90 stats without percentiles, use a rough normalization
      // This should ideally be replaced with actual percentile calculation
      normalizedValue = Math.min(10, rawValue);
    }

    return {
      label: kpiDef.label,
      value: normalizedValue,
    };
  });
}

/**
 * Generate mock radar data for testing
 */
export function generateMockRadarData(position: string, fitScore: number): RadarChartData[] {
  const positionGroup = getPositionGroup(position);
  const kpiDefs = KPI_MAPPINGS[positionGroup];

  // Generate values that loosely correlate with fit score
  const baseValue = (fitScore / 100) * 10;
  const variance = 2;

  return kpiDefs.map((kpiDef, index) => {
    const randomOffset = (Math.random() - 0.5) * variance;
    const value = Math.max(0, Math.min(10, baseValue + randomOffset));
    const percentile = (value / 10) * 100;

    return {
      label: kpiDef.label,
      value,
      percentile,
    };
  });
}
