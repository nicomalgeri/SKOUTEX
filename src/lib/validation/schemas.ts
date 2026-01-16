/**
 * Zod validation schemas for API endpoints
 * Ensures data quality and prevents invalid inputs
 */

import { z } from "zod";

// ============ COMMON SCHEMAS ============

export const PositiveNumberSchema = z.number().positive("Must be a positive number");
export const NonNegativeNumberSchema = z.number().nonnegative("Must be non-negative");
export const EmailSchema = z.string().email("Invalid email address");
export const URLSchema = z.string().url("Invalid URL");

// ============ TRANSFER TARGETS ============

export const CreateTargetSchema = z.object({
  player_id: z.number().int().positive("Player ID must be a positive integer"),
  player_name: z.string().min(1, "Player name is required").max(100, "Name too long"),
  current_club: z.string().max(100).optional(),
  position: z.string().max(50).optional(),
  age: z.number().int().min(15, "Age must be at least 15").max(50, "Age must be at most 50").optional(),
  nationality: z.string().max(50).optional(),
  market_value_eur: PositiveNumberSchema.optional(),
  priority: z.enum(["high", "medium", "low"], {
    message: "Priority must be high, medium, or low",
  }),
  target_price_eur: PositiveNumberSchema.optional(),
  max_price_eur: PositiveNumberSchema.optional(),
  notes: z.string().max(1000, "Notes too long (max 1000 characters)").optional(),
  status: z
    .enum([
      "scouting",
      "interested",
      "negotiating",
      "offer_made",
      "agreed",
      "completed",
      "rejected",
      "abandoned",
    ])
    .optional()
    .default("scouting"),
}).refine(
  (data) => {
    // Ensure max price is greater than or equal to target price if both are provided
    if (data.target_price_eur && data.max_price_eur) {
      return data.max_price_eur >= data.target_price_eur;
    }
    return true;
  },
  {
    message: "Max price must be greater than or equal to target price",
    path: ["max_price_eur"],
  }
);

export const UpdateTargetSchema = z.object({
  priority: z.enum(["high", "medium", "low"]).optional(),
  target_price_eur: PositiveNumberSchema.optional(),
  max_price_eur: PositiveNumberSchema.optional(),
  notes: z.string().max(1000).optional(),
  status: z
    .enum([
      "scouting",
      "interested",
      "negotiating",
      "offer_made",
      "agreed",
      "completed",
      "rejected",
      "abandoned",
    ])
    .optional(),
}).refine(
  (data) => {
    if (data.target_price_eur && data.max_price_eur) {
      return data.max_price_eur >= data.target_price_eur;
    }
    return true;
  },
  {
    message: "Max price must be greater than or equal to target price",
    path: ["max_price_eur"],
  }
);

// ============ CLUB CONTEXT ============

export const ClubContextUpdateSchema = z.object({
  context: z.object({
    identity: z.object({
      club_name: z.string().min(1, "Club name is required").max(100).optional(),
      country: z.string().max(50).optional(),
      league: z.string().max(100).optional(),
      tier: z.enum(["top_flight", "second_tier", "third_tier", "lower"]).optional(),
      founded_year: z.number().int().min(1800).max(2100).nullable().optional(),
      stadium_capacity: z.number().int().positive().nullable().optional(),
      academy_level: z.enum(["none", "basic", "category_2", "category_1", "elite"]).optional(),
    }).optional(),
    finances: z.object({
      transfer_budget_eur: PositiveNumberSchema.optional(),
      wage_budget_weekly_eur: NonNegativeNumberSchema.optional(),
      currency: z.string().length(3, "Currency must be 3 characters (e.g., EUR, GBP)").optional(),
      sell_to_buy: z.boolean().optional(),
      installment_preference: z.enum(["upfront", "installments_ok", "loan_preferred"]).optional(),
      agent_fee_ceiling_pct: z.number().min(0).max(100, "Percentage must be 0-100").optional(),
    }).optional(),
    recruitment: z.object({
      priority_positions: z.array(z.string()).max(5, "Maximum 5 priority positions").optional(),
      age_preference: z.object({
        min: z.number().int().min(15).max(50),
        max: z.number().int().min(15).max(50),
        ideal: z.number().int().min(15).max(50),
      }).refine(
        (data) => data.max >= data.min,
        { message: "Max age must be >= min age", path: ["max"] }
      ).refine(
        (data) => data.ideal >= data.min && data.ideal <= data.max,
        { message: "Ideal age must be between min and max", path: ["ideal"] }
      ).optional(),
      experience_level: z.enum(["proven", "emerging", "prospect", "any"]).optional(),
    }).optional(),
  }),
  club: z.object({
    name: z.string().max(100).optional(),
    logo_url: URLSchema.optional().nullable(),
  }).optional(),
});

// ============ SCOUTING REPORTS ============

export const GenerateReportSchema = z.object({
  player_id: z.number().int().positive("Player ID must be a positive integer"),
  player_name: z.string().min(1, "Player name is required").max(100),
  position: z.string().max(50).optional(),
  age: z.number().int().min(15).max(50).optional(),
  nationality: z.string().max(50).optional(),
  current_club: z.string().max(100).optional(),
  market_value_eur: PositiveNumberSchema.optional(),
});

// ============ STRATEGY ANALYSIS ============

export const AnalyzeStrategySchema = z.object({
  strategy: z.string()
    .min(10, "Strategy description too short (minimum 10 characters)")
    .max(5000, "Strategy description too long (maximum 5000 characters)"),
});

// ============ PLAYER SEARCH ============

export const PlayerSearchSchema = z.object({
  q: z.string().min(1, "Search query is required").max(100),
  include: z.string().max(500).optional(),
});

export const PlayerFiltersSchema = z.object({
  position: z.string().max(50).optional(),
  min_age: z.number().int().min(15).max(50).optional(),
  max_age: z.number().int().min(15).max(50).optional(),
  min_value: PositiveNumberSchema.optional(),
  max_value: PositiveNumberSchema.optional(),
  league: z.string().max(100).optional(),
  nationality: z.string().max(50).optional(),
  page: z.number().int().positive().default(1),
  per_page: z.number().int().min(1).max(100).default(25),
}).refine(
  (data) => {
    if (data.min_age && data.max_age) {
      return data.max_age >= data.min_age;
    }
    return true;
  },
  { message: "Max age must be >= min age", path: ["max_age"] }
).refine(
  (data) => {
    if (data.min_value && data.max_value) {
      return data.max_value >= data.min_value;
    }
    return true;
  },
  { message: "Max value must be >= min value", path: ["max_value"] }
);

// ============ AI OPERATIONS ============

export const AIChatSchema = z.object({
  message: z.string().min(1, "Message is required").max(2000, "Message too long"),
  depth: z.enum(["quick", "dense"]).optional().default("quick"),
});

// ============ FILE UPLOADS ============

export const PDFUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, "File size must be less than 10MB")
    .refine(
      (file) => file.type === "application/pdf",
      "File must be a PDF"
    ),
  title: z.string().min(1).max(200).optional(),
});

// ============ PAGINATION ============

export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  per_page: z.number().int().min(1).max(100).default(25),
  sort_by: z.string().max(50).optional(),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
});

// ============ FILTERS ============

export const TargetFiltersSchema = z.object({
  status: z.enum([
    "scouting",
    "interested",
    "negotiating",
    "offer_made",
    "agreed",
    "completed",
    "rejected",
    "abandoned",
  ]).optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
});

export const TransferWindowFiltersSchema = z.object({
  league: z.string().max(100).optional(),
  season: z.string().regex(/^\d{4}-\d{2}$/, "Season must be in format YYYY-YY").optional(),
  window_type: z.enum(["summer", "winter"]).optional(),
});

// ============ XSS SANITIZATION ============

/**
 * Sanitize user input to prevent XSS attacks
 * Removes HTML tags and dangerous characters
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[<>\"']/g, "") // Remove dangerous characters
    .trim();
}

/**
 * Sanitize object with string values
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  for (const key in sanitized) {
    if (typeof sanitized[key] === "string") {
      (sanitized as any)[key] = sanitizeString(sanitized[key] as string);
    } else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      (sanitized as any)[key] = sanitizeObject(sanitized[key]);
    }
  }
  return sanitized;
}
