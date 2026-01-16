/**
 * Transfer window configuration and types
 */

export type WindowType = 'summer' | 'winter';

export interface TransferWindow {
  id: string;
  league: string;
  season: string;
  window_type: WindowType;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TransferWindowStatus {
  isOpen: boolean;
  isClosed: boolean;
  isUpcoming: boolean;
  daysRemaining: number | null;
  daysUntilOpen: number | null;
  window: TransferWindow | null;
}

/**
 * League names that should match the database
 */
export const SUPPORTED_LEAGUES = [
  'Premier League',
  'La Liga',
  'Serie A',
  'Bundesliga',
  'Ligue 1',
  'Eredivisie',
  'Primeira Liga',
  'Champions League',
] as const;

export type SupportedLeague = typeof SUPPORTED_LEAGUES[number];

/**
 * Default transfer window dates if not found in database
 * These are approximate dates based on historical patterns
 */
export const DEFAULT_WINDOW_DATES = {
  summer: {
    start: { month: 6, day: 14 }, // Mid-June
    end: { month: 9, day: 1 },    // September 1st
  },
  winter: {
    start: { month: 1, day: 1 },  // January 1st
    end: { month: 2, day: 3 },    // Early February
  },
} as const;
