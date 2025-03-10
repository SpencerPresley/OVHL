import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { AuthOptions } from '@/lib/auth-options';
import { PrismaClient } from '@prisma/client';
import { biddingUtils } from '@/lib/redis';

const prisma = new PrismaClient();

/**
 * POST /api/admin/prepare-bidding
 *
 * This endpoint marks eligible players as available for bidding.
 * Eligible players are those who:
 * 1. Are in the current season
 * 2. Are not already on a team for the specified tier
 *
 * Parameters:
 * - leagueId: string (e.g., 'nhl', 'ahl') - Required
 * - initializeRedis: boolean - Whether to also initialize players in Redis (default: true)
 */
export async function POST(request: NextRequest) {
  // Only allow admins to access this endpoint
  const session = await getServerSession(AuthOptions);

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { leagueId, initializeRedis = true } = await request.json();

    if (!leagueId) {
      return NextResponse.json({ error: 'League ID is required' }, { status: 400 });
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
        name: leagueId.toUpperCase(),
      },
    });

    if (!tier) {
      return NextResponse.json({ error: 'Tier not found' }, { status: 404 });
    }

    // Find players not on a team for this tier
    const eligiblePlayers = await prisma.playerSeason.findMany({
      where: {
        seasonId: season.id,
        teamSeasons: {
          none: {
            teamSeason: {
              tierId: tier.id,
            },
          },
        },
      },
      include: {
        player: {
          include: {
            gamertags: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
        contract: true,
      },
    });

    console.log(`Found ${eligiblePlayers.length} eligible players for bidding in ${leagueId}`);

    if (eligiblePlayers.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No eligible players found for bidding',
        count: 0,
      });
    }

    // Mark these players as in bidding
    const playerIds = eligiblePlayers.map((p) => p.id);

    await prisma.playerSeason.updateMany({
      where: {
        id: {
          in: playerIds,
        },
      },
      data: {
        isInBidding: true,
      },
    });

    console.log(`Marked ${playerIds.length} players as in bidding`);

    // Initialize Redis data if requested
    if (initializeRedis) {
      // Start bidding for the league
      const now = Date.now();
      const twoDaysMs = 2 * 24 * 60 * 60 * 1000;

      await biddingUtils.setLeagueBiddingStatus(leagueId, {
        active: true,
        startTime: now,
        endTime: now + twoDaysMs,
        tierLevel: tier.leagueLevel,
      });

      // Initialize each player in Redis
      for (const player of eligiblePlayers) {
        await biddingUtils.setPlayerBidding(player.id, {
          startingAmount: player.contract.amount,
          tierId: tier.id,
          tierName: tier.name,
          playerName: player.player.name,
          position: player.position,
          contractId: player.contract.id,
          gamertag: player.player.gamertags[0]?.gamertag || undefined,
        });
      }

      console.log(`Initialized ${eligiblePlayers.length} players in Redis`);
    }

    return NextResponse.json({
      success: true,
      message: `${playerIds.length} players marked as available for bidding in ${leagueId}${initializeRedis ? ' and initialized in Redis' : ''}`,
      count: playerIds.length,
    });
  } catch (error) {
    console.error('Error preparing players for bidding:', error);
    return NextResponse.json({ error: 'Failed to prepare players for bidding' }, { status: 500 });
  }
}
