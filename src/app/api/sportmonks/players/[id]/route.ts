import { NextRequest, NextResponse } from 'next/server';
import { getSportmonksClient } from '@/lib/sportmonks';
import { isPlayerAllowed, mergeIncludes, filterTeamsByAllowed } from '@/lib/sportmonks/leagueFilters';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const include = mergeIncludes(
    searchParams.get('include') ||
      'position;detailedPosition;nationality;country;teams.team;statistics.details.type;transfers.fromTeam;transfers.toTeam;trophies;metadata',
    'teams.team.activeSeasons'
  );

  try {
    const client = getSportmonksClient();
    const response = await client.getPlayerById(parseInt(id), include);

    if (!isPlayerAllowed(response.data)) {
      return NextResponse.json(
        { error: 'Player not available in current plan' },
        { status: 404 }
      );
    }

    const filteredTeams = response.data?.teams
      ? filterTeamsByAllowed(response.data.teams)
      : response.data?.teams;
    return NextResponse.json({
      ...response,
      data: { ...response.data, teams: filteredTeams },
    });
  } catch (error) {
    console.error('Sportmonks API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch player' },
      { status: 500 }
    );
  }
}
