import { NextRequest, NextResponse } from 'next/server';
import { getGNewsClient } from '@/lib/gnews';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const type = searchParams.get('type'); // 'league', 'club', 'player', 'transfer', 'headlines'
  const name = searchParams.get('name'); // League/Club/Player name
  const lang = searchParams.get('lang') || 'en';
  const country = searchParams.get('country') || undefined;
  const max = parseInt(searchParams.get('max') || '10');

  try {
    const client = getGNewsClient();
    let response;

    if (query) {
      // Custom search query
      response = await client.search({
        q: query,
        lang: lang as Parameters<typeof client.search>[0]['lang'],
        country: country as Parameters<typeof client.search>[0]['country'],
        max,
        sortby: 'publishedAt',
      });
    } else if (type === 'league' && name) {
      // League news
      response = await client.getLeagueNews(name, { lang, country, max });
    } else if (type === 'club' && name) {
      // Club news
      response = await client.getClubNews(name, { lang, country, max });
    } else if (type === 'player' && name) {
      // Player news
      response = await client.getPlayerNews(name, { lang, country, max });
    } else if (type === 'transfer') {
      // Transfer market news
      response = await client.getTransferNews({ lang, country, max });
    } else if (type === 'headlines') {
      // Sports headlines
      response = await client.getSportsHeadlines({ lang, country, max });
    } else {
      // Default: sports headlines
      response = await client.getSportsHeadlines({ lang, country, max });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('GNews API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
