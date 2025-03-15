import { NextRequest, NextResponse } from 'next/server';
import { biddingUtils } from '@/lib/redis';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Define the type for bidding status
interface BiddingStatus {
  active: boolean;
  startTime?: number;
  endTime?: number;
  leagueId: string;
  tierLevel?: number;
  lastUpdate?: number;
}

/**
 * Admin Bidding API - Get Status
 *
 * Returns the status of all bidding periods across leagues.
 * Requires admin authentication.
 *
 * @route GET /api/admin/bidding
 * @returns {Promise<NextResponse>} JSON response with bidding status for all leagues
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication using NextAuth
    await requireAdmin();

    const leagueIds = ['nhl', 'ahl', 'echl', 'chl'];
    const biddingStatus: Record<string, BiddingStatus> = {};

    // Get the status of all bidding periods
    for (const leagueId of leagueIds) {
      const status = await biddingUtils.getLeagueBiddingStatus(leagueId);
      biddingStatus[leagueId] = status || { active: false, leagueId };
    }

    // Get the current active league
    const activeBidding = await biddingUtils.getCurrentActiveBidding();

    return NextResponse.json({
      biddingStatus,
      activeBidding,
    });
  } catch (error) {
    console.error('Error fetching bidding status:', error);

    // Check if it's an authentication error
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      if (error.message === 'Admin privileges required') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    }

    return NextResponse.json({ error: 'Failed to fetch bidding status' }, { status: 500 });
  }
}

/**
 * Admin Bidding API - Control Bidding
 *
 * Controls bidding periods (start, stop, finalize) for specific leagues.
 * Requires admin authentication.
 *
 * @route POST /api/admin/bidding
 * @param {Object} body - Request body
 * @param {string} body.action - Action to perform (start, stop, finalize)
 * @param {string} body.leagueId - League ID to perform action on
 * @returns {Promise<NextResponse>} JSON response with operation result
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication using NextAuth
    await requireAdmin();

    const body = await request.json();
    const { action, leagueId } = body;

    if (!action || !leagueId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if the league exists
    const tier = await prisma.tier.findFirst({
      where: {
        name: leagueId.toUpperCase(),
        season: {
          isLatest: true,
        },
      },
    });

    if (!tier) {
      return NextResponse.json({ error: 'Tier not found' }, { status: 404 });
    }

    // Get the current active bidding
    const activeBidding = await biddingUtils.getCurrentActiveBidding();

    // Only allow one active bidding period at a time
    if (action === 'start' && activeBidding && activeBidding.leagueId !== leagueId) {
      return NextResponse.json(
        {
          error: `Cannot start bidding for ${leagueId} while ${activeBidding.leagueId} is active`,
        },
        { status: 400 }
      );
    }

    // Handle the action
    switch (action) {
      case 'start': {
        const now = Date.now();
        const twoDaysMs = 2 * 24 * 60 * 60 * 1000;

        // Map league ID to tier level
        const tierLevels = {
          nhl: 1,
          ahl: 2,
          echl: 3,
          chl: 4,
        };

        // Start bidding period
        await biddingUtils.setLeagueBiddingStatus(leagueId, {
          active: true,
          startTime: now,
          endTime: now + twoDaysMs,
          tierLevel: tierLevels[leagueId as keyof typeof tierLevels] || 0,
        });

        // Initialize players
        await initializeLeaguePlayers(leagueId, tier.id);

        return NextResponse.json({
          success: true,
          message: `Bidding started for ${leagueId.toUpperCase()}`,
        });
      }

      case 'stop': {
        // Stop bidding period
        await biddingUtils.setLeagueBiddingStatus(leagueId, {
          active: false,
          startTime: 0,
          endTime: 0,
          tierLevel: 0,
        });

        return NextResponse.json({
          success: true,
          message: `Bidding stopped for ${leagueId.toUpperCase()}`,
        });
      }

      case 'finalize': {
        // Get all players in bidding for this league
        const biddingPlayers = await biddingUtils.getPlayersByTier(tier.id);

        // Process all remaining bids
        let processedCount = 0;

        for (const player of biddingPlayers) {
          if (player.status === 'active') {
            // Mark as finalized in Redis
            await biddingUtils.finalizeBidding(player.id);

            // If there's a winning team, assign the player
            if (player.currentTeamId) {
              const teamSeason = await prisma.teamSeason.findFirst({
                where: {
                  teamId: player.currentTeamId,
                  tierId: tier.id,
                },
              });

              if (teamSeason) {
                // Create player-team association
                await prisma.playerTeamSeason.create({
                  data: {
                    playerSeasonId: player.id,
                    teamSeasonId: teamSeason.id,
                  },
                });

                // Update contract if needed
                await prisma.contract.update({
                  where: { id: player.contractId },
                  data: {
                    amount: player.currentBid,
                    updatedAt: new Date(),
                  },
                });

                processedCount++;
              }
            }

            // Mark player as no longer in bidding
            await prisma.playerSeason.update({
              where: { id: player.id },
              data: { isInBidding: false },
            });
          }
        }

        // Stop bidding period
        await biddingUtils.setLeagueBiddingStatus(leagueId, {
          active: false,
          startTime: 0,
          endTime: 0,
          tierLevel: 0,
        });

        return NextResponse.json({
          success: true,
          message: `Bidding finalized for ${leagueId.toUpperCase()}`,
          processedPlayers: processedCount,
          totalPlayers: biddingPlayers.length,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error managing bidding:', error);

    // Check if it's an authentication error
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      if (error.message === 'Admin privileges required') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    }

    return NextResponse.json({ error: 'Failed to manage bidding' }, { status: 500 });
  }
}

/**
 * Initialize players for bidding in a league
 */
async function initializeLeaguePlayers(leagueId: string, tierId: string) {
  // Get league status to determine end time
  const status = await biddingUtils.getLeagueBiddingStatus(leagueId);

  if (!status || !status.active) {
    throw new Error(`League ${leagueId} is not active for bidding`);
  }

  // Get all available players for this tier
  const availablePlayers = await prisma.playerSeason.findMany({
    where: {
      isInBidding: true,
      teamSeasons: {
        none: {
          teamSeason: {
            tierId,
          },
        },
      },
    },
    include: {
      player: true,
      contract: true,
    },
  });

  // Initialize each player in Redis
  let initCount = 0;
  for (const player of availablePlayers) {
    await biddingUtils.setPlayerBidding(player.id, {
      startingAmount: player.contract.amount,
      tierId,
      tierName: leagueId.toUpperCase(),
      endTime: status.endTime,
      playerName: player.player.name,
      position: player.position,
      contractId: player.contract.id,
      // Include player stats
      stats: {
        gamesPlayed: player.gamesPlayed || 0,
        goals: player.goals || 0,
        assists: player.assists || 0,
        plusMinus: player.plusMinus || 0,
      },
    });
    initCount++;
  }

  console.log(`Initialized ${initCount} players for bidding in ${leagueId.toUpperCase()}`);
  return initCount;
}
