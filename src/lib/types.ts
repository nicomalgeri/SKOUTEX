// Core Types for SKOUTEX Platform

// User & Authentication
export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "sporting_director" | "scout" | "analyst";
  clubId: string;
  createdAt: Date;
}

export interface Club {
  id: string;
  name: string;
  logo?: string;
  country: string;
  league: string;
  // Club Profile (from onboarding)
  playingModel: PlayingModel;
  preferences: ClubPreferences;
  createdAt: Date;
}

export interface PlayingModel {
  formation: string;
  style: "possession" | "counter_attack" | "high_press" | "balanced";
  buildUpPlay: "short" | "direct" | "mixed";
  pressingIntensity: "high" | "medium" | "low";
  tempoPreference: "fast" | "controlled" | "varied";
  widthPreference: "wide" | "narrow" | "balanced";
}

export interface ClubPreferences {
  ageRange: { min: number; max: number };
  budgetRange: { transferMin: number; transferMax: number; salaryMax: number };
  priorityPositions: string[];
  preferredLeagues: string[];
  preferredNationalities: string[];
  technicalPriorities: string[];
  physicalRequirements: PhysicalRequirements;
}

export interface PhysicalRequirements {
  minHeight?: number;
  maxHeight?: number;
  speedImportance: "critical" | "important" | "neutral";
  strengthImportance: "critical" | "important" | "neutral";
  enduranceImportance: "critical" | "important" | "neutral";
}

// Player Data
export interface Player {
  id: string;
  name: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  nationality: string;
  secondNationality?: string;
  height: number;
  weight: number;
  preferredFoot: "left" | "right" | "both";
  photo?: string;

  // Current Club
  currentClub: string;
  currentClubLogo?: string;
  league: string;
  country: string;

  // Position
  primaryPosition: string;
  secondaryPositions: string[];
  tacticalRole: string;

  // Contract
  contractExpiry: string;
  marketValue: number;
  estimatedSalary: number;
  transferStatus: "available" | "not_available" | "loan" | "free_agent";

  // Career
  careerHistory: CareerEntry[];
  injuryHistory: Injury[];

  // Stats
  stats: PlayerStats;
  seasonStats: SeasonStats[];

  // Scores
  globalScore: number;
  potential: number;
  fitScore?: number; // Club-specific fit score
}

export interface CareerEntry {
  club: string;
  clubLogo?: string;
  league: string;
  from: string;
  to: string | null;
  appearances: number;
  goals: number;
  assists: number;
  transferFee?: number;
  transferType: "transfer" | "loan" | "free" | "youth";
}

export interface Injury {
  type: string;
  from: string;
  to: string;
  daysOut: number;
  matchesMissed: number;
}

export interface PlayerStats {
  // General
  appearances: number;
  minutesPlayed: number;
  starts: number;

  // Attacking
  goals: number;
  assists: number;
  shotsPerGame: number;
  shotsOnTarget: number;
  conversionRate: number;
  xG: number;
  xA: number;

  // Passing
  passAccuracy: number;
  keyPasses: number;
  throughBalls: number;
  longBallAccuracy: number;
  crossAccuracy: number;

  // Defending
  tackles: number;
  tackleSuccess: number;
  interceptions: number;
  clearances: number;
  blockedShots: number;
  aerialDuelsWon: number;

  // Physical
  duelsWon: number;
  dribbleSuccess: number;
  foulsDrawn: number;
  foulsConceded: number;

  // Goalkeeping (if applicable)
  cleanSheets?: number;
  savePercentage?: number;
  goalsAgainst?: number;
  penaltySaves?: number;
}

export interface SeasonStats {
  season: string;
  club: string;
  league: string;
  appearances: number;
  goals: number;
  assists: number;
  minutesPlayed: number;
  rating: number;
}

// Analysis & Reports
export interface PlayerAnalysis {
  id: string;
  playerId: string;
  clubId: string;
  createdAt: Date;
  createdBy: string;

  fitScore: number;
  fitCategory: "excellent" | "good" | "partial" | "poor";

  // AI Analysis
  executiveSummary: string;
  strengths: string[];
  weaknesses: string[];
  tacticalFit: string;
  developmentPotential: string;
  riskAssessment: string;

  // Comparison to requirements
  matchedCriteria: string[];
  unmatchedCriteria: string[];

  // Monte Carlo Results
  squadImpact?: SquadImpactAnalysis;

  // Shareable
  shareableUrl?: string;
  shareableExpiry?: Date;
}

export interface SquadImpactAnalysis {
  simulationCount: number;
  performanceWithPlayer: PerformanceDistribution;
  performanceWithoutPlayer: PerformanceDistribution;
  improvementProbability: number;
  projectedPointsChange: number;
  projectedGoalDifferenceChange: number;
  positionChange: { min: number; max: number; expected: number };
}

export interface PerformanceDistribution {
  mean: number;
  median: number;
  stdDev: number;
  percentile5: number;
  percentile25: number;
  percentile75: number;
  percentile95: number;
}

// Search & Filters
export interface PlayerSearchFilters {
  query?: string;
  positions?: string[];
  tacticalRoles?: string[];
  playingStyles?: string[];
  ageRange?: { min: number; max: number };
  minutesPlayedMin?: number;
  leagues?: string[];
  nationalities?: string[];
  contractExpiry?: { before: string; after: string };
  marketValueRange?: { min: number; max: number };
  transferStatus?: string[];
  sortBy?: "fitScore" | "marketValue" | "age" | "globalScore" | "potential";
  sortOrder?: "asc" | "desc";
}

// Watchlist & History
export interface Watchlist {
  id: string;
  name: string;
  clubId: string;
  createdBy: string;
  players: WatchlistPlayer[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WatchlistPlayer {
  playerId: string;
  addedAt: Date;
  addedBy: string;
  notes?: string;
  priority: "high" | "medium" | "low";
  status: "monitoring" | "contacted" | "negotiating" | "rejected" | "signed";
}

export interface SearchHistory {
  id: string;
  clubId: string;
  userId: string;
  query: string;
  filters: PlayerSearchFilters;
  resultCount: number;
  createdAt: Date;
}

export interface OfferedPlayer {
  id: string;
  playerId: string;
  clubId: string;
  offeredBy: string; // Agent name or club
  offeredAt: Date;
  source: "agent" | "whatsapp" | "email" | "direct";
  fitScore?: number;
  status: "pending" | "reviewed" | "interested" | "rejected";
  notes?: string;
}

// Chat & Conversations
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  audioUrl?: string;
  attachments?: ChatAttachment[];
}

export interface ChatAttachment {
  type: "player" | "comparison" | "report" | "chart";
  data: unknown;
}

export interface ChatConversation {
  id: string;
  clubId: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Reports
export interface Report {
  id: string;
  type: "quick" | "detailed" | "comparison" | "sale_page";
  playerId?: string;
  playerIds?: string[]; // For comparisons
  clubId: string;
  createdBy: string;
  createdAt: Date;
  pdfUrl?: string;
  shareableUrl?: string;
  views: number;
  averageTimeOnPage: number;
}

// Sale Landing Page
export interface SaleLandingPage {
  id: string;
  playerId: string;
  clubId: string;
  createdBy: string;
  createdAt: Date;

  // Customization
  clubBranding: {
    primaryColor: string;
    secondaryColor: string;
    logo: string;
  };
  includeVideo: boolean;
  videoUrl?: string;
  customNotes?: string;

  // Content
  showMetrics: string[];
  showCharts: string[];

  // Tracking
  url: string;
  visits: number;
  totalTimeSpent: number; // seconds
  uniqueVisitors: number;
}

// Positions and Roles
export const POSITIONS = [
  "GK",
  "CB",
  "LB",
  "RB",
  "LWB",
  "RWB",
  "CDM",
  "CM",
  "CAM",
  "LM",
  "RM",
  "LW",
  "RW",
  "CF",
  "ST",
] as const;

export const TACTICAL_ROLES = {
  GK: ["Sweeper Keeper", "Traditional GK", "Ball-Playing GK"],
  CB: ["Ball-Playing CB", "Stopper", "Covering CB", "Wide CB"],
  LB: ["Inverted Full-Back", "Attacking Full-Back", "Defensive Full-Back"],
  RB: ["Inverted Full-Back", "Attacking Full-Back", "Defensive Full-Back"],
  LWB: ["Wing-Back", "Inverted Wing-Back"],
  RWB: ["Wing-Back", "Inverted Wing-Back"],
  CDM: ["Anchor", "Ball-Winner", "Deep-Lying Playmaker", "Half-Back"],
  CM: ["Box-to-Box", "Mezzala", "Carrilero", "Roaming Playmaker"],
  CAM: ["Advanced Playmaker", "Shadow Striker", "Enganche", "Trequartista"],
  LM: ["Wide Midfielder", "Inside Forward"],
  RM: ["Wide Midfielder", "Inside Forward"],
  LW: ["Winger", "Inside Forward", "Inverted Winger", "Wide Target Man"],
  RW: ["Winger", "Inside Forward", "Inverted Winger", "Wide Target Man"],
  CF: ["False 9", "Deep-Lying Forward", "Target Man"],
  ST: ["Poacher", "Complete Forward", "Pressing Forward", "Target Man"],
} as const;

export const PLAYING_STYLES = [
  "Technical",
  "Physical",
  "Pace Merchant",
  "Playmaker",
  "Defensive Anchor",
  "Goal Scorer",
  "Creator",
  "All-Rounder",
  "Set-Piece Specialist",
  "Aerial Threat",
] as const;
