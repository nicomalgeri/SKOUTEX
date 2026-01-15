import { NextRequest, NextResponse } from 'next/server';
import { getSportmonksClient } from '@/lib/sportmonks';
import { isTeamAllowed, mergeIncludes } from '@/lib/sportmonks/leagueFilters';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const include = mergeIncludes(
    searchParams.get('include') ||
      'country;venue;players.player.position;players.player.nationality;coaches;activeSeasons;statistics;upcoming;latest',
    'activeSeasons'
  );

  try {
    const client = getSportmonksClient();
    const response = await client.getTeamById(parseInt(id), include);

    if (!isTeamAllowed(response.data)) {
      return NextResponse.json(
        { error: 'Team not available in current plan' },
        { status: 404 }
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Sportmonks API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch team' },
      { status: 500 }
    );
  }
}
