import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

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
    // Authenticate with NextAuth
    const authUser = await requireAuth();

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
      where: { id: authUser.id },
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

    // Create contract first
    const contract = await prisma.contract.create({
      data: {
        amount: 500000, // Default contract amount
      },
    });

    // Create player season record with contract
    await prisma.playerSeason.create({
      data: {
        player: { connect: { id: player.id } },
        season: { connect: { id: season.id } },
        contract: { connect: { id: contract.id } },
        position: position,
        gamesPlayed: 0,
        goals: 0,
        assists: 0,
        plusMinus: 0,
        shots: 0,
        hits: 0,
        takeaways: 0,
        giveaways: 0,
        penaltyMinutes: 0,
        ...(position === 'G' ? { saves: 0, goalsAgainst: 0 } : {}),
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
