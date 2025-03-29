import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // Ensure fresh data on each request

/**
 * Get Latest Season API Route
 *
 * Fetches the season record marked as 'isLatest'.
 *
 * @route GET /api/seasons/latest
 * @returns {Promise<NextResponse>} JSON response with the latest season or null
 */
export async function GET() {
  try {
    const latestSeason = await prisma.season.findFirst({
      where: { isLatest: true },
      orderBy: { seasonNumber: 'desc' }, // Ensure finding the highest number if multiple are marked
      select: {
        id: true,
        seasonNumber: true,
        isLatest: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Return the season found, or null if none exists
    return NextResponse.json({ season: latestSeason });

  } catch (error) {
    console.error('Failed to fetch latest season:', error);
    return NextResponse.json({ error: 'Failed to fetch latest season' }, { status: 500 });
  }
} 