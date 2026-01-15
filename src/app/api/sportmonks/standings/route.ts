import { NextRequest, NextResponse } from 'next/server';
import { getSportmonksClient } from '@/lib/sportmonks';
import { isAllowedLeagueId } from '@/lib/sportmonks/leagueFilters';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const seasonId = searchParams.get('seasonId');
  const live = searchParams.get('live') === 'true';
  const include = searchParams.get('include') ||
    'participant;details.type;form';

  if (!seasonId) {
    return NextResponse.json(
      { error: 'Season ID is required' },
      { status: 400 }
    );
  }

  try {
    const client = getSportmonksClient();
    let response;

    if (live) {
      response = await client.getStandingsBySeasonLive(parseInt(seasonId), include);
    } else {
      response = await client.getStandingsBySeason(parseInt(seasonId), include);
    }

    const filtered = (response.data || []).filter((standing) =>
      isAllowedLeagueId(standing.league_id)
    );

    if (filtered.length === 0) {
      return NextResponse.json(
        { error: 'Standings not available in current plan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ...response, data: filtered });
  } catch (error) {
    console.error('Sportmonks API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch standings' },
      { status: 500 }
    );
  }
}
