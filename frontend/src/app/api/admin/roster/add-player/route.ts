import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // TODO: (JWT) NEEDS TO BE REDONE FOR NEXT AUTH
    const decoded = verify(token.value, process.env.JWT_SECRET!) as {
      id: string;
      isAdmin?: boolean;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get request body
    const body = await request.json();
    const { playerId, teamId, leagueId } = body;

    if (!playerId || !teamId || !leagueId) {
      return NextResponse.json(
        { error: 'Player ID, Team ID, and League ID are required' },
        { status: 400 }
      );
    }

    // Get the latest season
    const season = await prisma.season.findFirst({
      where: { isLatest: true },
    });

    if (!season) {
      return NextResponse.json({ error: 'No active season found' }, { status: 404 });
    }

    // Get the tier for this league
    const tier = await prisma.tier.findFirst({
      where: {
        seasonId: season.id,
        name: leagueId,
      },
    });

    if (!tier) {
      return NextResponse.json({ error: 'League tier not found' }, { status: 404 });
    }

    // Get the team season
    const teamSeason = await prisma.teamSeason.findFirst({
      where: {
        teamId: teamId,
        tierId: tier.id,
      },
    });

    if (!teamSeason) {
      return NextResponse.json({ error: 'Team season not found' }, { status: 404 });
    }

    // Get the player season
    const playerSeason = await prisma.playerSeason.findFirst({
      where: {
        id: playerId,
        seasonId: season.id,
      },
    });

    if (!playerSeason) {
      return NextResponse.json({ error: 'Player season not found' }, { status: 404 });
    }

    // Start a transaction to handle all the updates
    await prisma.$transaction(async (tx) => {
      // 1. Update isInBidding to false
      await tx.playerSeason.update({
        where: { id: playerSeason.id },
        data: { isInBidding: false },
      });

      // 2. Create PlayerTeamSeason record
      await tx.playerTeamSeason.create({
        data: {
          playerSeasonId: playerSeason.id,
          teamSeasonId: teamSeason.id,
          assists: 0,
          gamesPlayed: 0,
          giveaways: 0,
          goals: 0,
          hits: 0,
          penaltyMinutes: 0,
          plusMinus: 0,
          shots: 0,
          takeaways: 0,
          saves: playerSeason.position === 'G' ? 0 : null,
          goalsAgainst: playerSeason.position === 'G' ? 0 : null,
        },
      });

      // 3. Create or update PlayerTierHistory
      await tx.playerTierHistory.create({
        data: {
          playerSeasonId: playerSeason.id,
          tierId: tier.id,
          startDate: new Date(),
        },
      });

      // 4. Update team roster counts
      const isForward = ['C', 'LW', 'RW'].includes(playerSeason.position);
      const isDefense = ['LD', 'RD'].includes(playerSeason.position);
      const isGoalie = playerSeason.position === 'G';

      await tx.teamSeason.update({
        where: { id: teamSeason.id },
        data: {
          forwardCount: isForward ? { increment: 1 } : undefined,
          defenseCount: isDefense ? { increment: 1 } : undefined,
          goalieCount: isGoalie ? { increment: 1 } : undefined,
        },
      });
    });

    return NextResponse.json({
      message: 'Player added to team successfully',
    });
  } catch (error) {
    console.error('Failed to add player to team:', error);
    return NextResponse.json({ error: 'Failed to add player to team' }, { status: 500 });
  }
}
