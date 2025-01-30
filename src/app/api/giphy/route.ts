import { NextRequest } from 'next/server';
import { GiphyFetch } from '@giphy/js-fetch-api';
import type { Rating } from '@giphy/js-fetch-api';
import { BLOCKED_TERMS } from '@/lib/giphy-blocked-terms/constants';

const gf = new GiphyFetch(process.env.GIPHY_API_KEY!);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.toLowerCase();
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Check if query contains blocked terms
    if (query && BLOCKED_TERMS.some((term) => query.includes(term))) {
      return Response.json({ data: [], pagination: { total_count: 0, count: 0, offset: 0 } });
    }

    const options = {
      offset,
      limit,
      rating: 'r' as Rating,
      lang: 'en', // Restrict to English content
      bundle: 'clips_grid_picker', // Use the more restricted content bundle
    };

    const result = query ? await gf.search(query, options) : await gf.trending(options);

    return Response.json(result);
  } catch (error) {
    console.error('Giphy API error:', error);
    return Response.json({ error: 'Failed to fetch GIFs' }, { status: 500 });
  }
}
