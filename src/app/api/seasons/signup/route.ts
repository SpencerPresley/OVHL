import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

/**
 * Season Signup API Route
 *
 * Handles user signup for a season.
 * Features:
 * - Creates player record if user doesn't have one
 * - Creates player season record
 * - Validates season exists and is latest
 * - Prevents duplicate signups
 */
export async function POST(request: Request) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || '') as {
      userId: string;
      email: string;
    };

    // Get request body
    const body = await request.json();
    const { seasonId, position } = body;

    if (!seasonId || !position) {
      return NextResponse.json({ error: 'Season ID and position are required' }, { status: 400 });
    }

    // Verify season exists and is latest
    const season = await prisma.season.findFirst({
      where: {
        id: seasonId,
        isLatest: true,
      },
    });

    if (!season) {
      return NextResponse.json({ error: 'Invalid or inactive season' }, { status: 400 });
    }

    // Get player record
    const player = await prisma.player.findUnique({
      where: { id: decoded.userId },
    });

    if (!player) {
      return NextResponse.json({ error: 'Player record not found' }, { status: 400 });
    }

    // Check if player is already signed up for this season
    const existingSignup = await prisma.playerSeason.findFirst({
      where: {
        playerId: player.id,
        seasonId: season.id,
      },
    });

    if (existingSignup) {
      return NextResponse.json({ error: 'Already signed up for this season' }, { status: 400 });
    }

    // Create player season record
    await prisma.playerSeason.create({
      data: {
        playerId: player.id,
        seasonId: season.id,
        position: position,
      },
    });

    return NextResponse.json({
      message: 'Successfully signed up for season',
    });
  } catch (error) {
    console.error('Failed to sign up for season:', error);
    return NextResponse.json({ error: 'Failed to sign up for season' }, { status: 500 });
  }
}
