'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  SportmonksPlayer,
  SportmonksTeam,
  SportmonksLeague,
  SportmonksFixture,
  SportmonksTransfer,
  SportmonksResponse,
} from '@/lib/sportmonks/types';
import { toLocalISODate } from '@/lib/utils';

// Generic fetch hook
function useApiData<T>(
  url: string | null,
  options?: { enabled?: boolean; refetchInterval?: number }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!url) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (options?.enabled === false) return;
    fetchData();

    if (options?.refetchInterval) {
      const interval = setInterval(fetchData, options.refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, options?.enabled, options?.refetchInterval]);

  return { data, loading, error, refetch: fetchData };
}

// ============ PLAYERS ============

export function usePlayers(options?: {
  page?: number;
  per_page?: number;
  include?: string;
  enabled?: boolean;
}) {
  const { page = 1, per_page = 25, include, enabled = true } = options || {};

  const url = enabled
    ? `/api/sportmonks/players?page=${page}&per_page=${per_page}${include ? `&include=${include}` : ''}`
    : null;

  return useApiData<SportmonksResponse<SportmonksPlayer[]>>(url, { enabled });
}

export function usePlayer(id: number | string | null, include?: string) {
  const url = id
    ? `/api/sportmonks/players/${id}${include ? `?include=${include}` : ''}`
    : null;

  return useApiData<SportmonksResponse<SportmonksPlayer>>(url);
}

export function usePlayerSearch(query: string | null, include?: string) {
  const url = query
    ? `/api/sportmonks/players/search?q=${encodeURIComponent(query)}${include ? `&include=${include}` : ''}`
    : null;

  return useApiData<SportmonksResponse<SportmonksPlayer[]>>(url);
}

// ============ TEAMS ============

export function useTeams(options?: {
  page?: number;
  per_page?: number;
  include?: string;
  enabled?: boolean;
}) {
  const { page = 1, per_page = 25, include, enabled = true } = options || {};

  const url = enabled
    ? `/api/sportmonks/teams?page=${page}&per_page=${per_page}${include ? `&include=${include}` : ''}`
    : null;

  return useApiData<SportmonksResponse<SportmonksTeam[]>>(url, { enabled });
}

export function useTeam(id: number | string | null, include?: string) {
  const url = id
    ? `/api/sportmonks/teams/${id}${include ? `?include=${include}` : ''}`
    : null;

  return useApiData<SportmonksResponse<SportmonksTeam>>(url);
}

export function useTeamSearch(query: string | null, include?: string) {
  const url = query
    ? `/api/sportmonks/teams/search?q=${encodeURIComponent(query)}${include ? `&include=${include}` : ''}`
    : null;

  return useApiData<SportmonksResponse<SportmonksTeam[]>>(url);
}

// ============ CLUBS (TEAMS) ============

export function useClub(id: number | string | null, include?: string) {
  return useTeam(id, include);
}

export function useClubSearch(query: string | null, include?: string) {
  return useTeamSearch(query, include);
}

// ============ LEAGUES ============

export function useLeagues(options?: {
  page?: number;
  per_page?: number;
  include?: string;
  enabled?: boolean;
}) {
  const { page = 1, per_page = 50, include, enabled = true } = options || {};

  const url = enabled
    ? `/api/sportmonks/leagues?page=${page}&per_page=${per_page}${include ? `&include=${include}` : ''}`
    : null;

  return useApiData<SportmonksResponse<SportmonksLeague[]>>(url, { enabled });
}

// ============ FIXTURES ============

export function useFixtures(options?: {
  date?: string;
  startDate?: string;
  endDate?: string;
  teamId?: number;
  page?: number;
  per_page?: number;
  include?: string;
  enabled?: boolean;
}) {
  const {
    date,
    startDate,
    endDate,
    teamId,
    page = 1,
    per_page = 25,
    include,
    enabled = true,
  } = options || {};

  let url: string | null = null;

  if (enabled) {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('per_page', String(per_page));
    if (date) params.set('date', date);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (teamId) params.set('teamId', String(teamId));
    if (include) params.set('include', include);

    url = `/api/sportmonks/fixtures?${params.toString()}`;
  }

  return useApiData<SportmonksResponse<SportmonksFixture[]>>(url, { enabled });
}

export function useUpcomingFixtures(teamId: number | null, days: number = 30) {
  const today = toLocalISODate(new Date());
  const futureDate = toLocalISODate(
    new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  );

  return useFixtures({
    teamId: teamId || undefined,
    startDate: today,
    endDate: futureDate,
    enabled: !!teamId,
  });
}

// ============ TRANSFERS ============

export function useTransfers(options?: {
  teamId?: number;
  playerId?: number;
  latest?: boolean;
  page?: number;
  per_page?: number;
  include?: string;
  enabled?: boolean;
}) {
  const {
    teamId,
    playerId,
    latest,
    page = 1,
    per_page = 25,
    include,
    enabled = true,
  } = options || {};

  let url: string | null = null;

  if (enabled) {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('per_page', String(per_page));
    if (teamId) params.set('teamId', String(teamId));
    if (playerId) params.set('playerId', String(playerId));
    if (latest) params.set('latest', 'true');
    if (include) params.set('include', include);

    url = `/api/sportmonks/transfers?${params.toString()}`;
  }

  return useApiData<SportmonksResponse<SportmonksTransfer[]>>(url, { enabled });
}

export function useLatestTransfers(include?: string) {
  return useTransfers({ latest: true, include });
}

// ============ NEWS ============

interface NewsResponse {
  totalArticles: number;
  articles: {
    title: string;
    description: string;
    content: string;
    url: string;
    image: string | null;
    publishedAt: string;
    source: { name: string; url: string };
  }[];
}

export function useNews(options?: {
  query?: string;
  type?: 'league' | 'club' | 'player' | 'transfer' | 'headlines';
  name?: string;
  lang?: string;
  country?: string;
  max?: number;
  enabled?: boolean;
}) {
  const {
    query,
    type,
    name,
    lang = 'en',
    country,
    max = 10,
    enabled = true,
  } = options || {};

  let url: string | null = null;

  if (enabled) {
    const params = new URLSearchParams();
    params.set('lang', lang);
    params.set('max', String(max));
    if (query) params.set('q', query);
    if (type) params.set('type', type);
    if (name) params.set('name', name);
    if (country) params.set('country', country);

    url = `/api/news?${params.toString()}`;
  }

  return useApiData<NewsResponse>(url, { enabled });
}

export function useLeagueNews(leagueName: string | null, options?: { lang?: string; max?: number }) {
  return useNews({
    type: 'league',
    name: leagueName || undefined,
    lang: options?.lang,
    max: options?.max,
    enabled: !!leagueName,
  });
}

export function useClubNews(clubName: string | null, options?: { lang?: string; max?: number }) {
  return useNews({
    type: 'club',
    name: clubName || undefined,
    lang: options?.lang,
    max: options?.max,
    enabled: !!clubName,
  });
}

export function usePlayerNews(playerName: string | null, options?: { lang?: string; max?: number }) {
  return useNews({
    type: 'player',
    name: playerName || undefined,
    lang: options?.lang,
    max: options?.max,
    enabled: !!playerName,
  });
}

export function useTransferNews(options?: { lang?: string; max?: number }) {
  return useNews({
    type: 'transfer',
    lang: options?.lang,
    max: options?.max,
  });
}

export function useSportsHeadlines(options?: { lang?: string; country?: string; max?: number }) {
  return useNews({
    type: 'headlines',
    lang: options?.lang,
    country: options?.country,
    max: options?.max,
  });
}

// Featured players hook - matches club recruitment needs
export function useFeaturedPlayers() {
  return useApiData<{ data: SportmonksPlayer[]; total: number }>('/api/club/featured-players', {
    enabled: true,
  });
}
