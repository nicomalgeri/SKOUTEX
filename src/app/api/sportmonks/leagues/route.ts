import { NextRequest, NextResponse } from 'next/server';
import { getSportmonksClient } from '@/lib/sportmonks';
import { filterLeaguesByAllowed } from '@/lib/sportmonks/leagueFilters';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const per_page = parseInt(searchParams.get('per_page') || '50');
  const include = searchParams.get('include') || 'country;currentSeason';

  try {
    const client = getSportmonksClient();
    const response = await client.getAllLeagues({
      page,
      per_page,
      include,
    });

    const filtered = filterLeaguesByAllowed(response.data || []);
    return NextResponse.json({ ...response, data: filtered });
  } catch (error) {
    console.error('Sportmonks API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch leagues' },
      { status: 500 }
    );
  }
}
