import { NextRequest, NextResponse } from 'next/server';
import { getSportmonksClient } from '@/lib/sportmonks';
import { filterTeamsByAllowed, mergeIncludes } from '@/lib/sportmonks/leagueFilters';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const include = mergeIncludes(
    searchParams.get('include') || 'country;venue;activeSeasons',
    'activeSeasons'
  );

  if (!query) {
    return NextResponse.json(
      { error: 'Search query is required' },
      { status: 400 }
    );
  }

  try {
    const client = getSportmonksClient();
    const response = await client.searchTeams(query, include);

    const filtered = filterTeamsByAllowed(response.data || []);
    return NextResponse.json({ ...response, data: filtered });
  } catch (error) {
    console.error('Sportmonks API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search teams' },
      { status: 500 }
    );
  }
}
