// This file is deprecated and exists only for backwards compatibility
// Use @/lib/utils and @/lib/hooks/useSportmonks instead

export {
  formatCurrency,
  formatPercentage,
  getPositionColor,
  getPositionCode,
  getFitScoreColor,
  getFitScoreLabel,
  calculateAge,
  formatDate,
  formatDateShort,
  getRelativeTime,
  formatHeight,
  formatWeight,
  getInitials,
  truncate,
  formatNumber,
} from './utils';

// Empty arrays for backwards compatibility - components should migrate to using API hooks
export const mockPlayers: never[] = [];
export const mockClubs: never[] = [];

// Deprecated functions that now require API calls
export function getPlayerById(id: string): undefined {
  console.warn('getPlayerById is deprecated. Use usePlayer hook from @/lib/hooks instead');
  return undefined;
}

export function searchPlayers(): never[] {
  console.warn('searchPlayers is deprecated. Use usePlayerSearch hook from @/lib/hooks instead');
  return [];
}

export function getAvailableLeagues(): string[] {
  console.warn('getAvailableLeagues is deprecated. Use useLeagues hook from @/lib/hooks instead');
  return [];
}

export function getAvailableNationalities(): string[] {
  console.warn('getAvailableNationalities is deprecated.');
  return [];
}
