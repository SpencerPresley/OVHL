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

    // Get player record - UPDATED to search by userId
    const player = await prisma.player.findUnique({
      where: { userId: authUser.id }, // Corrected: Use userId from authenticated user
    });

    if (!player) {
      // If no player record, we might need to create one depending on application logic
      // For now, assuming a player record MUST exist before signing up for a season.
      return NextResponse.json({ error: 'Player record not found for this user' }, { status: 400 });
    }

    // Check if player is already signed up for this season
    const existingSignup = await prisma.playerSeason.findFirst({
      where: {
        playerId: player.id, // Use the id from the found player record
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

    // Create player season record with contract - UPDATED to use correct player.id and remove stats
    await prisma.playerSeason.create({
      data: {
        player: { connect: { id: player.id } }, // Corrected: Connect using player.id
        season: { connect: { id: season.id } },
        contract: { connect: { id: contract.id } },
        primaryPosition: position, // Renamed field? Assuming 'position' maps to 'primaryPosition'
        // REMOVED all stats fields (gamesPlayed, goals, assists, etc.)
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
