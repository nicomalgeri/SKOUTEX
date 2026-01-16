/**
 * Transfer window calculation utilities
 */

import { TransferWindow, TransferWindowStatus } from './config';

/**
 * Calculate the number of days between two dates
 */
export function daysBetween(date1: Date, date2: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.floor((utc2 - utc1) / msPerDay);
}

/**
 * Calculate transfer window status based on current date
 */
export function calculateWindowStatus(
  window: TransferWindow | null,
  now: Date = new Date()
): TransferWindowStatus {
  if (!window) {
    return {
      isOpen: false,
      isClosed: true,
      isUpcoming: false,
      daysRemaining: null,
      daysUntilOpen: null,
      window: null,
    };
  }

  const startDate = new Date(window.start_date);
  const endDate = new Date(window.end_date);

  // Normalize dates to midnight UTC for accurate comparison
  const nowUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const startUTC = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
  const endUTC = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()));

  const isOpen = nowUTC >= startUTC && nowUTC <= endUTC;
  const isClosed = nowUTC > endUTC;
  const isUpcoming = nowUTC < startUTC;

  const daysRemaining = isOpen ? daysBetween(nowUTC, endUTC) : null;
  const daysUntilOpen = isUpcoming ? daysBetween(nowUTC, startUTC) : null;

  return {
    isOpen,
    isClosed,
    isUpcoming,
    daysRemaining,
    daysUntilOpen,
    window,
  };
}

/**
 * Get the current active transfer window for a league
 */
export function getActiveWindow(
  windows: TransferWindow[],
  league: string,
  now: Date = new Date()
): TransferWindow | null {
  // Filter windows for the league
  const leagueWindows = windows.filter((w) => w.league === league);

  // Find the window that contains the current date
  const activeWindow = leagueWindows.find((w) => {
    const start = new Date(w.start_date);
    const end = new Date(w.end_date);
    return now >= start && now <= end;
  });

  if (activeWindow) {
    return activeWindow;
  }

  // If no active window, find the next upcoming window
  const upcomingWindows = leagueWindows
    .filter((w) => new Date(w.start_date) > now)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  return upcomingWindows[0] || null;
}

/**
 * Format days remaining as human-readable text
 */
export function formatDaysRemaining(days: number): string {
  if (days === 0) {
    return 'Closes today';
  }
  if (days === 1) {
    return '1 day remaining';
  }
  if (days < 7) {
    return `${days} days remaining`;
  }
  if (days < 14) {
    return '1 week remaining';
  }
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} weeks remaining`;
  }
  const months = Math.floor(days / 30);
  return `${months} ${months === 1 ? 'month' : 'months'} remaining`;
}

/**
 * Format days until open as human-readable text
 */
export function formatDaysUntilOpen(days: number): string {
  if (days === 0) {
    return 'Opens today';
  }
  if (days === 1) {
    return 'Opens tomorrow';
  }
  if (days < 7) {
    return `Opens in ${days} days`;
  }
  if (days < 14) {
    return 'Opens in 1 week';
  }
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `Opens in ${weeks} weeks`;
  }
  const months = Math.floor(days / 30);
  return `Opens in ${months} ${months === 1 ? 'month' : 'months'}`;
}

/**
 * Get urgency level based on days remaining
 */
export function getUrgencyLevel(daysRemaining: number): 'critical' | 'warning' | 'normal' {
  if (daysRemaining <= 3) {
    return 'critical';
  }
  if (daysRemaining <= 7) {
    return 'warning';
  }
  return 'normal';
}

/**
 * Get color class based on urgency
 */
export function getUrgencyColor(urgency: 'critical' | 'warning' | 'normal'): string {
  switch (urgency) {
    case 'critical':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'warning':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'normal':
      return 'bg-green-50 text-green-700 border-green-200';
  }
}
