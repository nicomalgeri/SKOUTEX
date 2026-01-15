import { z } from "zod";

export const CLUB_TIERS = [
  "top_flight",
  "second_tier",
  "third_tier",
  "lower",
] as const;

export const ACADEMY_LEVELS = [
  "none",
  "basic",
  "category_2",
  "category_1",
  "elite",
] as const;

export const PLAYING_STYLES = [
  "possession",
  "counter_attack",
  "pressing",
  "balanced",
] as const;

export const BUILD_UP_STYLES = ["short", "mixed", "direct"] as const;

export const PRESSING_INTENSITIES = [
  "low",
  "medium",
  "high",
  "gegenpressing",
] as const;

export const WING_PLAY_PREFERENCES = ["wide", "inverted", "mixed"] as const;

export const SET_PIECE_IMPORTANCE = ["low", "medium", "high"] as const;

export const INSTALLMENT_PREFERENCES = [
  "upfront",
  "installments_ok",
  "loan_preferred",
] as const;

export const YOUTH_INTEGRATION_POLICIES = [
  "aggressive",
  "moderate",
  "conservative",
] as const;

export const EXPERIENCE_LEVELS = ["proven", "emerging", "prospect", "any"] as const;

export const PHYSICAL_PROFILES = ["athletic", "technical", "balanced"] as const;

export const IMPORTANCE_LEVELS = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export const INJURY_TOLERANCE_LEVELS = ["strict", "moderate", "lenient"] as const;

export const RELEASE_CLAUSE_POLICIES = [
  "never",
  "high_only",
  "case_by_case",
] as const;

export const IMAGE_RIGHTS_POLICIES = [
  "club_owns",
  "split",
  "player_owns",
] as const;

export const SEASON_OBJECTIVES = [
  "promotion",
  "survival",
  "mid_table",
  "top_half",
  "title",
  "european",
] as const;

export const TRANSFER_PHILOSOPHIES = [
  "buy_young_sell_high",
  "buy_ready",
  "mix",
] as const;

export const RISK_APPETITES = ["conservative", "moderate", "aggressive"] as const;

export const PROJECT_TIMELINES = [
  "immediate",
  "1_2_years",
  "3_5_years",
] as const;

export const BRAND_VALUE_IMPORTANCE = ["low", "medium", "high"] as const;

export const ClubContextSchema = z.object({
  version: z.literal("1.0"),
  club_id: z.string(),
  updated_at: z.string(),
  identity: z.object({
    club_name: z.string(),
    country: z.string(),
    league: z.string(),
    tier: z.enum(CLUB_TIERS),
    founded_year: z.number().nullable(),
    stadium_capacity: z.number().nullable(),
    academy_level: z.enum(ACADEMY_LEVELS),
  }),
  finances: z.object({
    transfer_budget_eur: z.number(),
    wage_budget_weekly_eur: z.number(),
    currency: z.string(),
    sell_to_buy: z.boolean(),
    installment_preference: z.enum(INSTALLMENT_PREFERENCES),
    agent_fee_ceiling_pct: z.number(),
  }),
  playing_style: z.object({
    formation_primary: z.string(),
    formation_secondary: z.string().nullable(),
    style: z.enum(PLAYING_STYLES),
    build_up: z.enum(BUILD_UP_STYLES),
    pressing_intensity: z.enum(PRESSING_INTENSITIES),
    wing_play_preference: z.enum(WING_PLAY_PREFERENCES),
    set_piece_importance: z.enum(SET_PIECE_IMPORTANCE),
  }),
  squad: z.object({
    squad_size_target: z.number(),
    current_squad_size: z.number().nullable(),
    foreign_player_limit: z.number(),
    homegrown_requirement: z.number(),
    average_squad_age: z.number().nullable(),
    youth_integration_policy: z.enum(YOUTH_INTEGRATION_POLICIES),
  }),
  recruitment: z.object({
    priority_positions: z.array(z.string()),
    age_preference: z.object({
      min: z.number(),
      max: z.number(),
      ideal: z.number(),
    }),
    experience_level: z.enum(EXPERIENCE_LEVELS),
    preferred_leagues: z.array(z.string()),
    preferred_nationalities: z.array(z.string()),
    avoid_leagues: z.array(z.string()),
    left_foot_priority: z.boolean(),
  }),
  technical: z.object({
    physical_profile: z.enum(PHYSICAL_PROFILES),
    minimum_height_cm: z.number().nullable(),
    speed_importance: z.enum(IMPORTANCE_LEVELS),
    aerial_importance: z.enum(IMPORTANCE_LEVELS),
    technical_floor: z.number().nullable(),
    injury_history_tolerance: z.enum(INJURY_TOLERANCE_LEVELS),
  }),
  contracts: z.object({
    contract_length_preference: z.object({
      min_years: z.number(),
      max_years: z.number(),
    }),
    loan_interest: z.boolean(),
    sell_on_clause_ok: z.boolean(),
    buyback_clause_ok: z.boolean(),
    release_clause_policy: z.enum(RELEASE_CLAUSE_POLICIES),
    image_rights_policy: z.enum(IMAGE_RIGHTS_POLICIES),
  }),
  strategy: z.object({
    season_objective: z.enum(SEASON_OBJECTIVES),
    transfer_philosophy: z.enum(TRANSFER_PHILOSOPHIES),
    risk_appetite: z.enum(RISK_APPETITES),
    project_timeline: z.enum(PROJECT_TIMELINES),
    brand_value_importance: z.enum(BRAND_VALUE_IMPORTANCE),
    social_media_presence_factor: z.boolean(),
  }),
});

export type ClubContext = z.infer<typeof ClubContextSchema>;

export const clubContextDefaults: ClubContext = {
  version: "1.0",
  club_id: "",
  updated_at: "",
  identity: {
    club_name: "",
    country: "",
    league: "",
    tier: "second_tier",
    founded_year: null,
    stadium_capacity: null,
    academy_level: "basic",
  },
  finances: {
    transfer_budget_eur: 0,
    wage_budget_weekly_eur: 0,
    currency: "EUR",
    sell_to_buy: false,
    installment_preference: "installments_ok",
    agent_fee_ceiling_pct: 10,
  },
  playing_style: {
    formation_primary: "4-3-3",
    formation_secondary: null,
    style: "balanced",
    build_up: "mixed",
    pressing_intensity: "medium",
    wing_play_preference: "mixed",
    set_piece_importance: "medium",
  },
  squad: {
    squad_size_target: 25,
    current_squad_size: null,
    foreign_player_limit: 17,
    homegrown_requirement: 8,
    average_squad_age: null,
    youth_integration_policy: "moderate",
  },
  recruitment: {
    priority_positions: [],
    age_preference: {
      min: 18,
      max: 32,
      ideal: 25,
    },
    experience_level: "any",
    preferred_leagues: [],
    preferred_nationalities: [],
    avoid_leagues: [],
    left_foot_priority: false,
  },
  technical: {
    physical_profile: "balanced",
    minimum_height_cm: null,
    speed_importance: "medium",
    aerial_importance: "medium",
    technical_floor: null,
    injury_history_tolerance: "moderate",
  },
  contracts: {
    contract_length_preference: {
      min_years: 2,
      max_years: 5,
    },
    loan_interest: true,
    sell_on_clause_ok: true,
    buyback_clause_ok: false,
    release_clause_policy: "case_by_case",
    image_rights_policy: "split",
  },
  strategy: {
    season_objective: "mid_table",
    transfer_philosophy: "mix",
    risk_appetite: "moderate",
    project_timeline: "1_2_years",
    brand_value_importance: "medium",
    social_media_presence_factor: false,
  },
};

export const CLUB_CONTEXT_REQUIRED_FIELDS = [
  "identity.club_name",
  "identity.league",
  "identity.tier",
  "finances.transfer_budget_eur",
  "finances.wage_budget_weekly_eur",
  "playing_style.formation_primary",
  "playing_style.style",
  "recruitment.priority_positions",
  "recruitment.age_preference",
  "squad.foreign_player_limit",
  "strategy.season_objective",
  "strategy.risk_appetite",
] as const;

export const CLUB_CONTEXT_FIELD_PATHS = [
  "identity.club_name",
  "identity.country",
  "identity.league",
  "identity.tier",
  "identity.founded_year",
  "identity.stadium_capacity",
  "identity.academy_level",
  "finances.transfer_budget_eur",
  "finances.wage_budget_weekly_eur",
  "finances.currency",
  "finances.sell_to_buy",
  "finances.installment_preference",
  "finances.agent_fee_ceiling_pct",
  "playing_style.formation_primary",
  "playing_style.formation_secondary",
  "playing_style.style",
  "playing_style.build_up",
  "playing_style.pressing_intensity",
  "playing_style.wing_play_preference",
  "playing_style.set_piece_importance",
  "squad.squad_size_target",
  "squad.current_squad_size",
  "squad.foreign_player_limit",
  "squad.homegrown_requirement",
  "squad.average_squad_age",
  "squad.youth_integration_policy",
  "recruitment.priority_positions",
  "recruitment.age_preference.min",
  "recruitment.age_preference.max",
  "recruitment.age_preference.ideal",
  "recruitment.experience_level",
  "recruitment.preferred_leagues",
  "recruitment.preferred_nationalities",
  "recruitment.avoid_leagues",
  "recruitment.left_foot_priority",
  "technical.physical_profile",
  "technical.minimum_height_cm",
  "technical.speed_importance",
  "technical.aerial_importance",
  "technical.technical_floor",
  "technical.injury_history_tolerance",
  "contracts.contract_length_preference.min_years",
  "contracts.contract_length_preference.max_years",
  "contracts.loan_interest",
  "contracts.sell_on_clause_ok",
  "contracts.buyback_clause_ok",
  "contracts.release_clause_policy",
  "contracts.image_rights_policy",
  "strategy.season_objective",
  "strategy.transfer_philosophy",
  "strategy.risk_appetite",
  "strategy.project_timeline",
  "strategy.brand_value_importance",
  "strategy.social_media_presence_factor",
] as const;

export type ClubContextFieldPath = typeof CLUB_CONTEXT_FIELD_PATHS[number];

export type ClubContextValidationResult = {
  fields_completed: number;
  total_fields: number;
  confidence_score: number;
  confidence_level: "low" | "medium" | "high";
  fit_score_confidence: "insufficient" | "basic" | "good" | "high";
  fit_score_display: string;
  missing_required_fields: string[];
  blocking_missing_fields: string[];
};

function cloneDefaults(): ClubContext {
  return JSON.parse(JSON.stringify(clubContextDefaults)) as ClubContext;
}

function mergeDeep<T>(base: T, update: Partial<T>): T {
  if (update === null || update === undefined) return base;
  if (Array.isArray(base)) {
    return (Array.isArray(update) ? update : base) as T;
  }
  if (typeof base !== "object") {
    return (update as T) ?? base;
  }
  const result: Record<string, unknown> = { ...(base as object) };
  Object.entries(update as object).forEach(([key, value]) => {
    const baseValue = (base as Record<string, unknown>)[key];
    if (baseValue !== null && typeof baseValue === "object" && !Array.isArray(baseValue)) {
      result[key] = mergeDeep(baseValue, value as Partial<typeof baseValue>);
    } else if (value !== undefined) {
      result[key] = value;
    }
  });
  return result as T;
}

export function mergeClubContext(
  partial?: Partial<ClubContext>
): ClubContext {
  const base = cloneDefaults();
  if (!partial) return base;
  return mergeDeep(base, partial);
}

export function applyClubContextUpdate(
  base: ClubContext,
  update: Partial<ClubContext>
): ClubContext {
  return mergeDeep(base, update);
}

function getValueByPath(obj: Record<string, unknown>, path: string) {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function isValuePresent(path: string, value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") {
    if (
      path === "finances.transfer_budget_eur" ||
      path === "finances.wage_budget_weekly_eur"
    ) {
      return value > 0;
    }
    return true;
  }
  return true;
}

export function validateClubContext(
  context: ClubContext
): ClubContextValidationResult {
  const missingRequired = CLUB_CONTEXT_REQUIRED_FIELDS.filter((path) => {
    const value = getValueByPath(context as unknown as Record<string, unknown>, path);
    if (path === "recruitment.age_preference") {
      const age = value as { min?: number; max?: number; ideal?: number } | undefined;
      return !age || age.min === undefined || age.max === undefined || age.ideal === undefined;
    }
    return !isValuePresent(path, value);
  });

  const blockingMissing = [
    "finances.transfer_budget_eur",
    "finances.wage_budget_weekly_eur",
    "recruitment.priority_positions",
  ].filter((path) => {
    const value = getValueByPath(context as unknown as Record<string, unknown>, path);
    return !isValuePresent(path, value);
  });

  const fieldsCompleted = CLUB_CONTEXT_FIELD_PATHS.reduce((count, path) => {
    const value = getValueByPath(context as unknown as Record<string, unknown>, path);
    return isValuePresent(path, value) ? count + 1 : count;
  }, 0);

  const totalFields = CLUB_CONTEXT_FIELD_PATHS.length;
  const confidenceScore = totalFields > 0 ? (fieldsCompleted / totalFields) * 100 : 0;
  const confidenceLevel =
    confidenceScore < 40 ? "low" : confidenceScore <= 70 ? "medium" : "high";

  let fitScoreConfidence: ClubContextValidationResult["fit_score_confidence"] =
    "insufficient";
  let fitScoreDisplay = "Complete profile to see fit score";

  if (fieldsCompleted >= 12 && fieldsCompleted <= 18) {
    fitScoreConfidence = "basic";
    fitScoreDisplay = "Low confidence";
  } else if (fieldsCompleted >= 19 && fieldsCompleted <= 30) {
    fitScoreConfidence = "good";
    fitScoreDisplay = "Medium confidence";
  } else if (fieldsCompleted >= 31) {
    fitScoreConfidence = "high";
    fitScoreDisplay = "High confidence";
  }

  return {
    fields_completed: fieldsCompleted,
    total_fields: totalFields,
    confidence_score: Math.round(confidenceScore),
    confidence_level: confidenceLevel,
    fit_score_confidence: fitScoreConfidence,
    fit_score_display: fitScoreDisplay,
    missing_required_fields: missingRequired,
    blocking_missing_fields: blockingMissing,
  };
}

export function applySoftDefaultsForScoring(
  context: Partial<ClubContext>
): ClubContext {
  const merged = mergeClubContext(context);

  const agePreference = context?.recruitment?.age_preference;
  if (
    !agePreference ||
    agePreference.min === undefined ||
    agePreference.max === undefined ||
    agePreference.ideal === undefined
  ) {
    merged.recruitment.age_preference = { min: 18, max: 35, ideal: 26 };
  }

  if (!context?.playing_style?.style) {
    merged.playing_style.style = "balanced";
  }

  if (!context?.strategy?.risk_appetite) {
    merged.strategy.risk_appetite = "moderate";
  }

  if (
    context?.squad?.foreign_player_limit === null ||
    context?.squad?.foreign_player_limit === undefined
  ) {
    merged.squad.foreign_player_limit = 25;
  }

  return merged;
}
