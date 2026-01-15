import { NextRequest, NextResponse } from 'next/server';
import { getSportmonksClient } from '@/lib/sportmonks';
import { filterFixturesByAllowed } from '@/lib/sportmonks/leagueFilters';
import type { SportmonksFixture, SportmonksResponse } from '@/lib/sportmonks/types';

const MAX_RANGE_PAGES = 10;

async function getAllFixturesByDateRange(args: {
  client: ReturnType<typeof getSportmonksClient>;
  startDate: string;
  endDate: string;
  include?: string;
  perPage: number;
}): Promise<SportmonksResponse<SportmonksFixture[]>> {
  const { client, startDate, endDate, include, perPage } = args;
  const all: SportmonksFixture[] = [];
  let page = 1;
  let lastResponse: SportmonksResponse<SportmonksFixture[]> | null = null;
  let hasMore = true;

  while (hasMore && page <= MAX_RANGE_PAGES) {
    const response = await client.getFixturesByDateRange(startDate, endDate, {
      page,
      per_page: perPage,
      include,
    });
    lastResponse = response;
    all.push(...(response.data || []));
    if (response.pagination) {
      hasMore = response.pagination.has_more;
    } else {
      hasMore = response.data.length === perPage;
    }
    page += 1;
  }

  return {
    data: all,
    pagination: {
      count: all.length,
      per_page: perPage,
      current_page: 1,
      has_more: false,
    },
    subscription: lastResponse?.subscription,
    rate_limit: lastResponse?.rate_limit,
    timezone: lastResponse?.timezone,
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get('date');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const teamId = searchParams.get('teamId');
  const page = parseInt(searchParams.get('page') || '1');
  const per_page = parseInt(searchParams.get('per_page') || '25');
  const include = searchParams.get('include') ||
    'participants;league;venue;state;scores';

  try {
    const client = getSportmonksClient();
    let response;

    if (date) {
      // Get fixtures for a specific date
      response = await client.getFixturesByDate(date, include);
    } else if (startDate && endDate) {
      if (teamId) {
        // Get fixtures for a team within date range
        response = await client.getFixturesByTeamDateRange(
          parseInt(teamId),
          startDate,
          endDate,
          include
        );
      } else {
        // Get fixtures within date range
        response = await getAllFixturesByDateRange({
          client,
          startDate,
          endDate,
          include,
          perPage: per_page,
        });
      }
    } else if (teamId) {
      // Get all fixtures for a team
      response = await client.getFixturesByTeam(parseInt(teamId), {
        page,
        per_page,
        include,
      });
    } else {
      // Get all fixtures
      response = await client.getAllFixtures({
        page,
        per_page,
        include,
      });
    }

    const filtered = filterFixturesByAllowed(response.data || []);
    const pagination = response.pagination
      ? { ...response.pagination, count: filtered.length, has_more: false }
      : response.pagination;
    return NextResponse.json({ ...response, data: filtered, pagination });
  } catch (error) {
    console.error('Sportmonks API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch fixtures' },
      { status: 500 }
    );
  }
}
