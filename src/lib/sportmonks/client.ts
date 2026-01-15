// Sportmonks API Client
import type {
  SportmonksResponse,
  SportmonksPlayer,
  SportmonksTeam,
  SportmonksLeague,
  SportmonksSeason,
  SportmonksFixture,
  SportmonksStanding,
  SportmonksTransfer,
  SportmonksCountry,
} from './types';
import { toLocalISODate } from '../utils';

const SPORTMONKS_BASE_URL = 'https://api.sportmonks.com/v3/football';

class SportmonksClient {
  private apiKey: string;

  constructor() {
    const apiKey = process.env.SPORTMONKS_API_KEY;
    if (!apiKey) {
      console.error('[SportmonksClient] SPORTMONKS_API_KEY is missing');
      throw new Error('SPORTMONKS_API_KEY environment variable is not set. Please add it to your Vercel environment variables and redeploy.');
    }
    this.apiKey = apiKey;
  }

  private async fetch<T>(
    endpoint: string,
    params: Record<string, string | number | boolean | undefined> = {}
  ): Promise<SportmonksResponse<T>> {
    const url = new URL(`${SPORTMONKS_BASE_URL}${endpoint}`);
    url.searchParams.set('api_token', this.apiKey);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Sportmonks API error: ${response.status} - ${error.message || response.statusText}`
      );
    }

    return response.json();
  }

  // ============ PLAYERS ============

  async getAllPlayers(options: {
    page?: number;
    per_page?: number;
    include?: string;
    filters?: Record<string, string | number>;
  } = {}): Promise<SportmonksResponse<SportmonksPlayer[]>> {
    const { page = 1, per_page = 25, include, filters = {} } = options;
    return this.fetch<SportmonksPlayer[]>('/players', {
      page,
      per_page,
      include,
      ...filters,
    });
  }

  async getPlayerById(
    id: number,
    include?: string
  ): Promise<SportmonksResponse<SportmonksPlayer>> {
    return this.fetch<SportmonksPlayer>(`/players/${id}`, { include });
  }

  async getPlayersByCountry(
    countryId: number,
    options: { page?: number; per_page?: number; include?: string } = {}
  ): Promise<SportmonksResponse<SportmonksPlayer[]>> {
    const { page = 1, per_page = 25, include } = options;
    return this.fetch<SportmonksPlayer[]>(`/players/countries/${countryId}`, {
      page,
      per_page,
      include,
    });
  }

  async searchPlayers(
    query: string,
    include?: string
  ): Promise<SportmonksResponse<SportmonksPlayer[]>> {
    return this.fetch<SportmonksPlayer[]>(`/players/search/${encodeURIComponent(query)}`, {
      include,
    });
  }

  async getLastUpdatedPlayers(
    include?: string
  ): Promise<SportmonksResponse<SportmonksPlayer[]>> {
    return this.fetch<SportmonksPlayer[]>('/players/latest', { include });
  }

  // ============ TEAMS ============

  async getAllTeams(options: {
    page?: number;
    per_page?: number;
    include?: string;
  } = {}): Promise<SportmonksResponse<SportmonksTeam[]>> {
    const { page = 1, per_page = 25, include } = options;
    return this.fetch<SportmonksTeam[]>('/teams', { page, per_page, include });
  }

  async getTeamById(
    id: number,
    include?: string
  ): Promise<SportmonksResponse<SportmonksTeam>> {
    return this.fetch<SportmonksTeam>(`/teams/${id}`, { include });
  }

  async getTeamsByCountry(
    countryId: number,
    options: { page?: number; per_page?: number; include?: string } = {}
  ): Promise<SportmonksResponse<SportmonksTeam[]>> {
    const { page = 1, per_page = 25, include } = options;
    return this.fetch<SportmonksTeam[]>(`/teams/countries/${countryId}`, {
      page,
      per_page,
      include,
    });
  }

  async getTeamsBySeason(
    seasonId: number,
    include?: string
  ): Promise<SportmonksResponse<SportmonksTeam[]>> {
    return this.fetch<SportmonksTeam[]>(`/teams/seasons/${seasonId}`, { include });
  }

  async searchTeams(
    query: string,
    include?: string
  ): Promise<SportmonksResponse<SportmonksTeam[]>> {
    return this.fetch<SportmonksTeam[]>(`/teams/search/${encodeURIComponent(query)}`, {
      include,
    });
  }

  // ============ LEAGUES ============

  async getAllLeagues(options: {
    page?: number;
    per_page?: number;
    include?: string;
  } = {}): Promise<SportmonksResponse<SportmonksLeague[]>> {
    const { page = 1, per_page = 25, include } = options;
    return this.fetch<SportmonksLeague[]>('/leagues', { page, per_page, include });
  }

  async getLeagueById(
    id: number,
    include?: string
  ): Promise<SportmonksResponse<SportmonksLeague>> {
    return this.fetch<SportmonksLeague>(`/leagues/${id}`, { include });
  }

  async getLeaguesByCountry(
    countryId: number,
    include?: string
  ): Promise<SportmonksResponse<SportmonksLeague[]>> {
    return this.fetch<SportmonksLeague[]>(`/leagues/countries/${countryId}`, { include });
  }

  async searchLeagues(
    query: string,
    include?: string
  ): Promise<SportmonksResponse<SportmonksLeague[]>> {
    return this.fetch<SportmonksLeague[]>(`/leagues/search/${encodeURIComponent(query)}`, {
      include,
    });
  }

  // ============ SEASONS ============

  async getAllSeasons(options: {
    page?: number;
    per_page?: number;
    include?: string;
  } = {}): Promise<SportmonksResponse<SportmonksSeason[]>> {
    const { page = 1, per_page = 25, include } = options;
    return this.fetch<SportmonksSeason[]>('/seasons', { page, per_page, include });
  }

  async getSeasonById(
    id: number,
    include?: string
  ): Promise<SportmonksResponse<SportmonksSeason>> {
    return this.fetch<SportmonksSeason>(`/seasons/${id}`, { include });
  }

  async getSeasonsByTeam(
    teamId: number,
    include?: string
  ): Promise<SportmonksResponse<SportmonksSeason[]>> {
    return this.fetch<SportmonksSeason[]>(`/seasons/teams/${teamId}`, { include });
  }

  // ============ FIXTURES ============

  async getAllFixtures(options: {
    page?: number;
    per_page?: number;
    include?: string;
  } = {}): Promise<SportmonksResponse<SportmonksFixture[]>> {
    const { page = 1, per_page = 25, include } = options;
    return this.fetch<SportmonksFixture[]>('/fixtures', { page, per_page, include });
  }

  async getFixtureById(
    id: number,
    include?: string
  ): Promise<SportmonksResponse<SportmonksFixture>> {
    return this.fetch<SportmonksFixture>(`/fixtures/${id}`, { include });
  }

  async getFixturesByDate(
    date: string, // YYYY-MM-DD format
    include?: string
  ): Promise<SportmonksResponse<SportmonksFixture[]>> {
    return this.fetch<SportmonksFixture[]>(`/fixtures/date/${date}`, { include });
  }

  async getFixturesByDateRange(
    startDate: string,
    endDate: string,
    options: { page?: number; per_page?: number; include?: string } = {}
  ): Promise<SportmonksResponse<SportmonksFixture[]>> {
    const { page = 1, per_page = 25, include } = options;
    return this.fetch<SportmonksFixture[]>(
      `/fixtures/between/${startDate}/${endDate}`,
      { page, per_page, include }
    );
  }

  async getFixturesByTeam(
    teamId: number,
    options: { page?: number; per_page?: number; include?: string } = {}
  ): Promise<SportmonksResponse<SportmonksFixture[]>> {
    const { page = 1, per_page = 25, include } = options;
    return this.fetch<SportmonksFixture[]>(`/fixtures/teams/${teamId}`, {
      page,
      per_page,
      include,
    });
  }

  async getFixturesByTeamDateRange(
    teamId: number,
    startDate: string,
    endDate: string,
    include?: string
  ): Promise<SportmonksResponse<SportmonksFixture[]>> {
    return this.fetch<SportmonksFixture[]>(
      `/fixtures/between/${startDate}/${endDate}/${teamId}`,
      { include }
    );
  }

  async getUpcomingFixturesByTeam(
    teamId: number,
    include?: string
  ): Promise<SportmonksResponse<SportmonksFixture[]>> {
    // Get fixtures from today to 30 days ahead
    const today = toLocalISODate(new Date());
    const futureDate = toLocalISODate(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    );
    return this.getFixturesByTeamDateRange(teamId, today, futureDate, include);
  }

  async getHeadToHead(
    team1Id: number,
    team2Id: number,
    include?: string
  ): Promise<SportmonksResponse<SportmonksFixture[]>> {
    return this.fetch<SportmonksFixture[]>(`/fixtures/head-to-head/${team1Id}/${team2Id}`, {
      include,
    });
  }

  // ============ LIVESCORES ============

  async getLivescores(
    include?: string
  ): Promise<SportmonksResponse<SportmonksFixture[]>> {
    return this.fetch<SportmonksFixture[]>('/livescores', { include });
  }

  async getLivescoresInplay(
    include?: string
  ): Promise<SportmonksResponse<SportmonksFixture[]>> {
    return this.fetch<SportmonksFixture[]>('/livescores/inplay', { include });
  }

  // ============ STANDINGS ============

  async getStandingsBySeason(
    seasonId: number,
    include?: string
  ): Promise<SportmonksResponse<SportmonksStanding[]>> {
    return this.fetch<SportmonksStanding[]>(`/standings/seasons/${seasonId}`, { include });
  }

  async getStandingsBySeasonLive(
    seasonId: number,
    include?: string
  ): Promise<SportmonksResponse<SportmonksStanding[]>> {
    return this.fetch<SportmonksStanding[]>(`/standings/live/seasons/${seasonId}`, {
      include,
    });
  }

  // ============ TRANSFERS ============

  async getAllTransfers(options: {
    page?: number;
    per_page?: number;
    include?: string;
  } = {}): Promise<SportmonksResponse<SportmonksTransfer[]>> {
    const { page = 1, per_page = 25, include } = options;
    return this.fetch<SportmonksTransfer[]>('/transfers', { page, per_page, include });
  }

  async getTransferById(
    id: number,
    include?: string
  ): Promise<SportmonksResponse<SportmonksTransfer>> {
    return this.fetch<SportmonksTransfer>(`/transfers/${id}`, { include });
  }

  async getTransfersByTeam(
    teamId: number,
    include?: string
  ): Promise<SportmonksResponse<SportmonksTransfer[]>> {
    return this.fetch<SportmonksTransfer[]>(`/transfers/teams/${teamId}`, { include });
  }

  async getTransfersByPlayer(
    playerId: number,
    include?: string
  ): Promise<SportmonksResponse<SportmonksTransfer[]>> {
    return this.fetch<SportmonksTransfer[]>(`/transfers/players/${playerId}`, { include });
  }

  async getLatestTransfers(
    include?: string
  ): Promise<SportmonksResponse<SportmonksTransfer[]>> {
    return this.fetch<SportmonksTransfer[]>('/transfers/latest', { include });
  }

  // ============ COUNTRIES ============

  async getAllCountries(
    include?: string
  ): Promise<SportmonksResponse<SportmonksCountry[]>> {
    return this.fetch<SportmonksCountry[]>('/countries', { include });
  }

  async getCountryById(
    id: number,
    include?: string
  ): Promise<SportmonksResponse<SportmonksCountry>> {
    return this.fetch<SportmonksCountry>(`/countries/${id}`, { include });
  }

  // ============ STATISTICS ============

  async getPlayerStatisticsBySeason(
    playerId: number,
    seasonId: number,
    include?: string
  ): Promise<SportmonksResponse<SportmonksPlayer>> {
    return this.fetch<SportmonksPlayer>(`/players/${playerId}`, {
      include: include || 'statistics',
      'filters[playerStatisticSeasons]': seasonId,
    });
  }

  async getTeamStatisticsBySeason(
    teamId: number,
    seasonId: number,
    include?: string
  ): Promise<SportmonksResponse<SportmonksTeam>> {
    return this.fetch<SportmonksTeam>(`/teams/${teamId}`, {
      include: include || 'statistics',
      'filters[teamStatisticSeasons]': seasonId,
    });
  }
}

// Singleton instance
let client: SportmonksClient | null = null;

export function getSportmonksClient(): SportmonksClient {
  if (!client) {
    client = new SportmonksClient();
  }
  return client;
}

export default SportmonksClient;
