// GNews API Client
import type {
  GNewsResponse,
  GNewsSearchParams,
  GNewsTopHeadlinesParams,
} from './types';

const GNEWS_BASE_URL = 'https://gnews.io/api/v4';

class GNewsClient {
  private apiKey: string;

  constructor() {
    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey) {
      throw new Error('GNEWS_API_KEY environment variable is not set');
    }
    this.apiKey = apiKey;
  }

  private async fetch(
    endpoint: string,
    params: Record<string, string | number | undefined> = {}
  ): Promise<GNewsResponse> {
    const url = new URL(`${GNEWS_BASE_URL}${endpoint}`);
    url.searchParams.set('apikey', this.apiKey);

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
        `GNews API error: ${response.status} - ${error.errors?.[0] || response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Search for news articles
   * @param params Search parameters
   */
  async search(params: GNewsSearchParams): Promise<GNewsResponse> {
    const { q, lang, country, max, from, to, sortby, nullable } = params;
    return this.fetch('/search', {
      q,
      lang,
      country,
      max,
      from,
      to,
      sortby,
      nullable,
    });
  }

  /**
   * Get top headlines
   * @param params Top headlines parameters
   */
  async topHeadlines(params: GNewsTopHeadlinesParams = {}): Promise<GNewsResponse> {
    const { category, lang, country, max, nullable } = params;
    return this.fetch('/top-headlines', {
      category,
      lang,
      country,
      max,
      nullable,
    });
  }

  // ============ CONVENIENCE METHODS FOR FOOTBALL NEWS ============

  /**
   * Get football/soccer news by league name
   * @param leagueName Name of the league (e.g., "Premier League", "La Liga")
   * @param options Additional options
   */
  async getLeagueNews(
    leagueName: string,
    options: { lang?: string; country?: string; max?: number } = {}
  ): Promise<GNewsResponse> {
    const { lang = 'en', country, max = 10 } = options;
    return this.search({
      q: `${leagueName} football`,
      lang: lang as GNewsSearchParams['lang'],
      country: country as GNewsSearchParams['country'],
      max,
      sortby: 'publishedAt',
    });
  }

  /**
   * Get news about a specific football club
   * @param clubName Name of the club (e.g., "Manchester United", "Real Madrid")
   * @param options Additional options
   */
  async getClubNews(
    clubName: string,
    options: { lang?: string; country?: string; max?: number } = {}
  ): Promise<GNewsResponse> {
    const { lang = 'en', country, max = 10 } = options;
    return this.search({
      q: `"${clubName}" football`,
      lang: lang as GNewsSearchParams['lang'],
      country: country as GNewsSearchParams['country'],
      max,
      sortby: 'publishedAt',
    });
  }

  /**
   * Get news about a specific player
   * @param playerName Name of the player (e.g., "Erling Haaland", "Kylian Mbappé")
   * @param options Additional options
   */
  async getPlayerNews(
    playerName: string,
    options: { lang?: string; country?: string; max?: number } = {}
  ): Promise<GNewsResponse> {
    const { lang = 'en', country, max = 10 } = options;
    return this.search({
      q: `"${playerName}" football`,
      lang: lang as GNewsSearchParams['lang'],
      country: country as GNewsSearchParams['country'],
      max,
      sortby: 'publishedAt',
    });
  }

  /**
   * Get transfer market news
   * @param options Additional options
   */
  async getTransferNews(
    options: { lang?: string; country?: string; max?: number } = {}
  ): Promise<GNewsResponse> {
    const { lang = 'en', country, max = 10 } = options;
    return this.search({
      q: 'football transfer market',
      lang: lang as GNewsSearchParams['lang'],
      country: country as GNewsSearchParams['country'],
      max,
      sortby: 'publishedAt',
    });
  }

  /**
   * Get general sports headlines
   * @param options Additional options
   */
  async getSportsHeadlines(
    options: { lang?: string; country?: string; max?: number } = {}
  ): Promise<GNewsResponse> {
    const { lang = 'en', country, max = 10 } = options;
    return this.topHeadlines({
      category: 'sports',
      lang: lang as GNewsTopHeadlinesParams['lang'],
      country: country as GNewsTopHeadlinesParams['country'],
      max,
    });
  }

  /**
   * Search for multiple keywords (OR logic)
   * @param keywords Array of keywords
   * @param options Additional options
   */
  async searchMultiple(
    keywords: string[],
    options: { lang?: string; country?: string; max?: number } = {}
  ): Promise<GNewsResponse> {
    const { lang = 'en', country, max = 10 } = options;
    const query = keywords.map(k => `"${k}"`).join(' OR ');
    return this.search({
      q: query,
      lang: lang as GNewsSearchParams['lang'],
      country: country as GNewsSearchParams['country'],
      max,
      sortby: 'publishedAt',
    });
  }
}

// Singleton instance
let client: GNewsClient | null = null;

export function getGNewsClient(): GNewsClient {
  if (!client) {
    client = new GNewsClient();
  }
  return client;
}

export default GNewsClient;
