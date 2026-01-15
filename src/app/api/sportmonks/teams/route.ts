import { NextRequest, NextResponse } from 'next/server';
import { getSportmonksClient } from '@/lib/sportmonks';
import { filterTeamsByAllowed, mergeIncludes } from '@/lib/sportmonks/leagueFilters';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const per_page = parseInt(searchParams.get('per_page') || '25');
  const include = mergeIncludes(
    searchParams.get('include') || 'country;venue;activeSeasons',
    'activeSeasons'
  );

  try {
    const client = getSportmonksClient();
    const response = await client.getAllTeams({
      page,
      per_page,
      include,
    });

    const filtered = filterTeamsByAllowed(response.data || []);
    return NextResponse.json({ ...response, data: filtered });
  } catch (error) {
    console.error('Sportmonks API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}
