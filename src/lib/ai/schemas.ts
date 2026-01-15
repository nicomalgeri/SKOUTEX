import { z } from "zod";

export const ScoutIntentSchema = z.object({
  language: z
    .string()
    .min(2)
    .max(15)
    .describe('BCP-47 tag like "en", "es", "pt-BR"'),

  intent: z.enum([
    "search_players",
    "open_player",
    "compare_players",
    "generate_report",
    "club_history_query",
    "unknown",
  ]),

  query: z.string().describe("Original user request (cleaned)"),

  entities: z.object({
    player_id: z.string().nullable().default(null),
    player_name: z.string().nullable().default(null),
    player_ids: z.array(z.string()).default([]),
    team_name: z.string().nullable().default(null),
    competition_name: z.string().nullable().default(null),
  }),

  filters: z
    .object({
      position: z.string().nullable().default(null), // e.g. RB, LB, CB, DM, AM, W, ST
      tactical_role: z.string().nullable().default(null), // e.g. "inverted fullback"
      style_keywords: z.array(z.string()).default([]), // e.g. ["long passing", "high pressing"]

      age_min: z.number().int().nullable().default(null),
      age_max: z.number().int().nullable().default(null),
      minutes_min: z.number().int().nullable().default(null),

      contract_status: z
        .array(z.enum(["expiring", "loan", "free_agent", "unknown"]))
        .default([]),

      fee_max_eur: z.number().int().nullable().default(null),
      salary_max_eur: z.number().int().nullable().default(null),

      leagues: z.array(z.string()).default([]),
      countries: z.array(z.string()).default([]),
    })
    .default(() => ({
      position: null,
      tactical_role: null,
      style_keywords: [],
      age_min: null,
      age_max: null,
      minutes_min: null,
      contract_status: [],
      fee_max_eur: null,
      salary_max_eur: null,
      leagues: [],
      countries: [],
    })),

  sort: z
    .enum(["best_fit", "potential", "value", "minutes"])
    .default("best_fit"),

  limit: z.number().int().min(1).max(20).default(10),

  needs_clarification: z.boolean().default(false),
  follow_up_question: z.string().nullable().default(null),
});

export const PlayerReportSchema = z.object({
  language: z.string(),
  depth: z.enum(["quick", "dense"]).default("quick"),

  title: z.string(),

  executive_summary: z.string(),

  fit_snapshot: z.object({
    fit_percent: z.number().min(0).max(100).nullable().default(null),
    verdict: z.enum(["fits", "partial", "no_fit", "unknown"]).default("unknown"),
    role: z.string().nullable().default(null),
    key_reasons: z.array(z.string()).max(6).default([]),
    red_flags: z.array(z.string()).max(6).default([]),
  }),

  player_overview: z.object({
    name: z.string(),
    age: z.number().int().nullable().default(null),
    nationality: z.string().nullable().default(null),
    current_club: z.string().nullable().default(null),
    primary_position: z.string().nullable().default(null),
    contract_end: z.string().nullable().default(null),
  }),

  key_metrics: z
    .array(
      z.object({
        metric: z.string(),
        value: z.string(),
        context: z.string().nullable().default(null), // e.g. "82nd percentile vs RBs in league"
      })
    )
    .max(14)
    .default([]),

  strengths: z.array(z.string()).max(10).default([]),
  risks: z.array(z.string()).max(10).default([]),

  recommended_next_steps: z.array(z.string()).max(8).default([]),
  questions_to_validate: z.array(z.string()).max(8).default([]),

  data_gaps: z.array(z.string()).max(10).default([]),
  sources: z.array(z.string()).max(8).default([]),
});

export type ScoutIntent = z.infer<typeof ScoutIntentSchema>;
export type PlayerReport = z.infer<typeof PlayerReportSchema>;
