import { NextRequest, NextResponse } from 'next/server';
import { getSportmonksClient } from '@/lib/sportmonks';
import { filterPlayersByAllowed, mergeIncludes } from '@/lib/sportmonks/leagueFilters';
import { withRateLimit, RateLimitPresets } from '@/lib/middleware/rate-limit';
import { validateQuery } from '@/lib/middleware/validate';
import { PlayerSearchSchema } from '@/lib/validation/schemas';

async function searchPlayers(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Validate query parameters
  const filters = validateQuery(PlayerSearchSchema, searchParams);

  const include = mergeIncludes(
    filters.include || 'position;nationality;teams.team;statistics',
    'teams.team.activeSeasons'
  );

  try {
    const client = getSportmonksClient();
    const response = await client.searchPlayers(filters.q, include);

    const filtered = filterPlayersByAllowed(response.data || []);
    return NextResponse.json({ ...response, data: filtered });
  } catch (error) {
    console.error('Sportmonks API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search players' },
      { status: 500 }
    );
  }
}

// Export with rate limiting
export const GET = withRateLimit(RateLimitPresets.NORMAL, searchPlayers);
