// Utility functions for SKOUTEX platform

import type {
  SportmonksPlayer,
  SportmonksPlayerStatistic,
  SportmonksTeam,
  SportmonksTeamPlayer,
} from "./sportmonks/types";

// Format currency
export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null) return 'N/A';
  if (value >= 1000000) {
    return `€${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `€${(value / 1000).toFixed(0)}K`;
  }
  return `€${value}`;
}

// Format percentage
export function formatPercentage(value: number | undefined | null): string {
  if (value === undefined || value === null) return 'N/A';
  return `${value.toFixed(1)}%`;
}

// Get position color for badges
export function getPositionColor(position: string | undefined): string {
  if (!position) return 'bg-gray-500';

  const colors: Record<string, string> = {
    // Goalkeepers
    GK: 'bg-yellow-500',
    Goalkeeper: 'bg-yellow-500',

    // Defenders
    CB: 'bg-blue-600',
    'Centre-Back': 'bg-blue-600',
    LB: 'bg-blue-500',
    'Left-Back': 'bg-blue-500',
    RB: 'bg-blue-500',
    'Right-Back': 'bg-blue-500',
    LWB: 'bg-blue-400',
    RWB: 'bg-blue-400',
    Defender: 'bg-blue-600',

    // Midfielders
    CDM: 'bg-green-600',
    'Defensive Midfield': 'bg-green-600',
    CM: 'bg-green-500',
    'Central Midfield': 'bg-green-500',
    CAM: 'bg-green-400',
    'Attacking Midfield': 'bg-green-400',
    LM: 'bg-purple-500',
    'Left Midfield': 'bg-purple-500',
    RM: 'bg-purple-500',
    'Right Midfield': 'bg-purple-500',
    Midfielder: 'bg-green-500',

    // Forwards
    LW: 'bg-red-500',
    'Left Winger': 'bg-red-500',
    RW: 'bg-red-500',
    'Right Winger': 'bg-red-500',
    CF: 'bg-red-600',
    'Centre-Forward': 'bg-red-600',
    ST: 'bg-red-700',
    Attacker: 'bg-red-600',
  };

  return colors[position] || 'bg-gray-500';
}

// Get short position code
export function getPositionCode(position: string | undefined): string {
  if (!position) return '?';

  const codes: Record<string, string> = {
    Goalkeeper: 'GK',
    'Centre-Back': 'CB',
    'Left-Back': 'LB',
    'Right-Back': 'RB',
    'Defensive Midfield': 'CDM',
    'Central Midfield': 'CM',
    'Attacking Midfield': 'CAM',
    'Left Midfield': 'LM',
    'Right Midfield': 'RM',
    'Left Winger': 'LW',
    'Right Winger': 'RW',
    'Centre-Forward': 'CF',
    Attacker: 'ST',
    Defender: 'DEF',
    Midfielder: 'MID',
  };

  // Return as-is if already short code
  if (position.length <= 3) return position;

  return codes[position] || position.substring(0, 3).toUpperCase();
}

// Get fit score color
export function getFitScoreColor(score: number | undefined | null): string {
  if (score === undefined || score === null) return 'text-gray-500';
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

// Get fit score label
export function getFitScoreLabel(score: number | undefined | null): string {
  if (score === undefined || score === null) return 'Unknown';
  if (score >= 80) return 'Excellent Fit';
  if (score >= 60) return 'Good Fit';
  if (score >= 40) return 'Partial Fit';
  return 'Poor Fit';
}

// Calculate age from date of birth
export function calculateAge(dateOfBirth: string | undefined | null): number | null {
  if (!dateOfBirth) return null;

  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

// Format date
export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function toLocalISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalISODate(dateString: string | undefined | null): Date | null {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

// Format date short (MMM YYYY)
export function formatDateShort(dateString: string | undefined | null): string {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
  });
}

// Get relative time (e.g., "2 hours ago")
export function getRelativeTime(dateString: string): string {
  const date =
    /^\d{4}-\d{2}-\d{2}$/.test(dateString)
      ? parseLocalISODate(dateString) || new Date(dateString)
      : new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDate(dateString);
}

// Format height (cm to readable)
export function formatHeight(cm: number | undefined | null): string {
  if (!cm) return 'N/A';
  return `${cm} cm`;
}

// Format weight (kg to readable)
export function formatWeight(kg: number | undefined | null): string {
  if (!kg) return 'N/A';
  return `${kg} kg`;
}

// Get player initials
export function getInitials(name: string | undefined | null): string {
  if (!name) return '?';

  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

type TeamLike = SportmonksTeamPlayer & { team?: SportmonksTeam };

export function getCurrentTeam(player?: Pick<SportmonksPlayer, "teams">): SportmonksTeam | undefined {
  const teams = player?.teams as TeamLike[] | undefined;
  if (!teams || teams.length === 0) return undefined;

  const activeTeam =
    teams.find((t) => t.pivot?.end === null || !t.pivot?.end || !t.end) || teams[0];
  const resolvedTeam = activeTeam?.team || activeTeam;

  if (!resolvedTeam || !("name" in resolvedTeam)) return undefined;
  return resolvedTeam as SportmonksTeam;
}

export function getPrimaryPlayerStats(
  player?: Pick<SportmonksPlayer, "statistics" | "teams">
): SportmonksPlayerStatistic | undefined {
  const stats = player?.statistics ?? [];
  if (stats.length === 0) return undefined;

  const currentTeamId = getCurrentTeam(player)?.id;
  const teamStats = currentTeamId
    ? stats.filter((stat) => stat.team_id === currentTeamId)
    : stats;
  const statsPool = teamStats.length > 0 ? teamStats : stats;

  const withDetails = statsPool.filter(
    (stat) => (stat.details?.length ?? 0) > 0
  );
  const candidates = withDetails.length > 0 ? withDetails : statsPool;

  return [...candidates].sort((a, b) => {
    const detailDiff = (b.details?.length ?? 0) - (a.details?.length ?? 0);
    if (detailDiff !== 0) return detailDiff;
    return (b.id ?? 0) - (a.id ?? 0);
  })[0];
}

// Truncate text with ellipsis
export function truncate(text: string | undefined | null, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

// Generate a simple hash for caching purposes
export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

// Debounce function
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Deep clone object
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Check if value is empty (null, undefined, empty string, empty array)
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

// Capitalize first letter
export function capitalize(str: string | undefined | null): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Format number with commas
export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return 'N/A';
  return num.toLocaleString('en-US');
}
