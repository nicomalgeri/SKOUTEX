import { NextRequest, NextResponse } from 'next/server';
import { getSportmonksClient } from '@/lib/sportmonks';
import {
  getTeamActiveLeagueIds,
  isTransferAllowed,
  mergeIncludes,
} from '@/lib/sportmonks/leagueFilters';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const teamId = searchParams.get('teamId');
  const playerId = searchParams.get('playerId');
  const latest = searchParams.get('latest') === 'true';
  const page = parseInt(searchParams.get('page') || '1');
  const per_page = parseInt(searchParams.get('per_page') || '25');
  const include = mergeIncludes(
    searchParams.get('include') || 'player;fromTeam;toTeam;type',
    'fromTeam',
    'toTeam'
  );

  try {
    const client = getSportmonksClient();
    let response;

    if (latest) {
      // Get latest transfers
      response = await client.getLatestTransfers(include);
    } else if (teamId) {
      // Get transfers by team
      response = await client.getTransfersByTeam(parseInt(teamId), include);
    } else if (playerId) {
      // Get transfers by player
      response = await client.getTransfersByPlayer(parseInt(playerId), include);
    } else {
      // Get all transfers
      response = await client.getAllTransfers({
        page,
        per_page,
        include,
      });
    }

    const transfers = response.data || [];
    const teamIds = new Set<number>();
    transfers.forEach((transfer) => {
      if (transfer.from_team_id) teamIds.add(transfer.from_team_id);
      if (transfer.to_team_id) teamIds.add(transfer.to_team_id);
    });

    const teamLeagueIds = new Map<number, number[]>();
    await Promise.all(
      Array.from(teamIds).map(async (teamId) => {
        try {
          const teamResponse = await client.getTeamById(teamId, 'activeSeasons');
          teamLeagueIds.set(teamId, getTeamActiveLeagueIds(teamResponse.data));
        } catch {
          teamLeagueIds.set(teamId, []);
        }
      })
    );

    const filtered = transfers.filter((transfer) =>
      isTransferAllowed(transfer, teamLeagueIds)
    );

    const normalized = filtered.map((transfer) => {
      const fromTeam =
        transfer.fromTeam || transfer.fromteam || transfer.from_team;
      const toTeam = transfer.toTeam || transfer.toteam || transfer.to_team;
      return {
        ...transfer,
        fromTeam: fromTeam || transfer.fromTeam,
        toTeam: toTeam || transfer.toTeam,
      };
    });

    return NextResponse.json({ ...response, data: normalized });
  } catch (error) {
    console.error('Sportmonks API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch transfers' },
      { status: 500 }
    );
  }
}
