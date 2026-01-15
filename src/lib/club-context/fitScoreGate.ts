import type { ClubContext } from "../club/context";

export type FitScoreGateResult = {
  unlocked: boolean;
  missing_required_fields: string[];
  blocking_missing_fields: string[];
};

const REQUIRED_FIELDS = [
  "identity.club_name",
  "identity.league",
  "identity.tier",
  "finances.transfer_budget_eur",
  "finances.wage_budget_weekly_eur",
  "playing_style.formation_primary",
  "playing_style.style",
  "recruitment.priority_positions",
  "recruitment.age_preference.min",
  "recruitment.age_preference.max",
  "recruitment.age_preference.ideal",
  "squad.foreign_player_limit",
  "strategy.season_objective",
  "strategy.risk_appetite",
] as const;

const HARD_GATES = [
  "finances.transfer_budget_eur",
  "finances.wage_budget_weekly_eur",
  "recruitment.priority_positions",
] as const;

function getValueByPath(obj: Record<string, unknown>, path: string) {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function isNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value);
}

function isNonEmptyArray(value: unknown) {
  return Array.isArray(value) && value.length > 0;
}

function isRequiredFieldPresent(path: string, value: unknown): boolean {
  if (path === "finances.transfer_budget_eur") {
    return isNumber(value) && value > 0;
  }
  if (path === "finances.wage_budget_weekly_eur") {
    return isNumber(value) && value > 0;
  }
  if (path === "recruitment.priority_positions") {
    return isNonEmptyArray(value);
  }
  if (path.startsWith("recruitment.age_preference")) {
    return isNumber(value);
  }

  if (typeof value === "string") return isNonEmptyString(value);
  if (Array.isArray(value)) return isNonEmptyArray(value);
  if (typeof value === "number") return isNumber(value);

  return value !== null && value !== undefined;
}

function isHardGatePassing(path: string, value: unknown): boolean {
  if (path === "finances.transfer_budget_eur") {
    return isNumber(value) && value > 0;
  }
  if (path === "finances.wage_budget_weekly_eur") {
    return isNumber(value) && value > 0;
  }
  if (path === "recruitment.priority_positions") {
    return isNonEmptyArray(value);
  }
  return true;
}

export function getFitScoreGate(
  context?: Partial<ClubContext> | null
): FitScoreGateResult {
  const source = (context ?? {}) as Record<string, unknown>;

  const missing_required_fields = REQUIRED_FIELDS.filter((path) => {
    const value = getValueByPath(source, path);
    return !isRequiredFieldPresent(path, value);
  });

  const blocking_missing_fields = HARD_GATES.filter((path) => {
    const value = getValueByPath(source, path);
    return !isHardGatePassing(path, value);
  });

  return {
    unlocked: missing_required_fields.length === 0 && blocking_missing_fields.length === 0,
    missing_required_fields,
    blocking_missing_fields,
  };
}
