import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
// import { getServerSession } from 'next-auth';
// import { AuthOptions } from '@/lib/auth-options';
import redis from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { biddingUtils } from '@/lib/redis';


// Define the key prefixes used in Redis
const keyPrefix = {
  bidding: 'bidding:',
  leagueStatus: 'leagueStatus:',
};

/**
 * POST /api/bidding/reset
 *
 * Completely resets all bidding data in Redis and the database.
 * Optional parameters:
 * - reinitialize: boolean - If true, will reinitialize players for bidding after clearing
 * - leagueId: string - The league to reset (default: 'nhl')
 * - resetDatabase: boolean - If true, will also reset database records (bids, player flags, etc)
 *
 * This is a destructive operation and should only be available to admins.
 */
export async function POST(request: NextRequest) {
  try {
    // Use requireAdmin instead of direct session check
    await requireAdmin();
    // The function will throw if user is not an admin, so no need for additional checks

    const {
      reinitialize = false,
      leagueId = 'nhl',
      resetDatabase = true, // Default to true for a complete reset
    } = await request.json();

    // Results tracking
    let results = {
      redis: {
        biddingKeysDeleted: 0,
        statusKeysDeleted: 0,
      },
      database: {
        bidsDeleted: 0,
        playerBiddingFlagsReset: 0,
      },
      initialized: {
        playersInitialized: 0,
      },
    };

    // Step 1: Delete all bidding keys from Redis
    const biddingKeys = await redis.keys(`${keyPrefix.bidding}*`);
    console.log(`Found ${biddingKeys.length} bidding keys to delete in Redis`);

    if (biddingKeys.length > 0) {
      // Delete in batches to avoid blocking the Redis connection
      const batchSize = 100;
      for (let i = 0; i < biddingKeys.length; i += batchSize) {
        const batch = biddingKeys.slice(i, i + batchSize);
        if (batch.length > 0) {
          await redis.del(...batch);
          results.redis.biddingKeysDeleted += batch.length;
        }
      }
    }

    // Step 2: Delete league status keys from Redis
    const leagueStatusKeys = await redis.keys(`${keyPrefix.leagueStatus}*`);
    console.log(`Found ${leagueStatusKeys.length} league status keys to delete in Redis`);

    if (leagueStatusKeys.length > 0) {
      await redis.del(...leagueStatusKeys);
      results.redis.statusKeysDeleted += leagueStatusKeys.length;
    }

    // Step 3: Reset database records if requested
    if (resetDatabase) {
      console.log('Resetting database records...');

      // Get the latest season
      const season = await prisma.season.findFirst({
        where: { isLatest: true },
      });

      if (!season) {
        return NextResponse.json({
          success: true,
          message:
            'Redis bidding data cleared, but could not reset database: No active season found',
          results,
        });
      }

      // Get the tier for this league
      const tier = await prisma.tier.findFirst({
        where: {
          name: leagueId.toUpperCase(),
          seasonId: season.id,
        },
      });

      if (!tier) {
        return NextResponse.json({
          success: true,
          message: 'Redis bidding data cleared, but could not reset database: Tier not found',
          results,
        });
      }

      // Delete all bids for this season
      const deletedBids = await prisma.bid.deleteMany({
        where: {
          teamSeason: {
            tierId: tier.id,
          },
        },
      });

      results.database.bidsDeleted = deletedBids.count;
      console.log(`Deleted ${deletedBids.count} bids from database`);

      // Reset player bidding flags - this marks all players as not in bidding
      const resetPlayers = await prisma.playerSeason.updateMany({
        where: {
          seasonId: season.id,
          isInBidding: true,
        },
        data: {
          isInBidding: false,
        },
      });

      results.database.playerBiddingFlagsReset = resetPlayers.count;
      console.log(`Reset ${resetPlayers.count} player bidding flags in database`);
    }

    // Step 4: Reinitialize bidding if requested
    if (reinitialize) {
      // Get the latest season
      const season = await prisma.season.findFirst({
        where: { isLatest: true },
      });

      if (!season) {
        return NextResponse.json({
          success: true,
          message: 'Bidding data cleared, but could not reinitialize: No active season found',
          results,
        });
      }

      // Get the tier for this league
      const tier = await prisma.tier.findFirst({
        where: {
          name: leagueId.toUpperCase(),
          seasonId: season.id,
        },
      });

      if (!tier) {
        return NextResponse.json({
          success: true,
          message: 'Bidding data cleared, but could not reinitialize: Tier not found',
          results,
        });
      }

      // If we've reset database flags, we need to set players back to bidding
      if (resetDatabase) {
        // Find players not on a team for this tier and mark them for bidding
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
        });

        console.log(`Found ${eligiblePlayers.length} players eligible for bidding`);

        // Mark these players as in bidding
        if (eligiblePlayers.length > 0) {
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
        }
      }

      // Find all eligible players for bidding
      const players = await prisma.playerSeason.findMany({
        where: {
          seasonId: season.id,
          isInBidding: true,
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

      console.log(`Found ${players.length} players to initialize for bidding`);

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
      for (const player of players) {
        // Get the player's most recent gamertag if available
        const gamertag = player.player.gamertags[0]?.gamertag || player.player.name;

        await biddingUtils.setPlayerBidding(player.id, {
          startingAmount: player.contract.amount,
          tierId: tier.id,
          tierName: leagueId.toUpperCase(),
          playerName: player.player.name,
          gamertag,
          position: player.position,
          contractId: player.contract.id,
          stats: {
            gamesPlayed: player.gamesPlayed || 0,
            goals: player.goals || 0,
            assists: player.assists || 0,
            plusMinus: player.plusMinus || 0,
          },
        });
        results.initialized.playersInitialized++;
      }
    }

    // Prepare a detailed message about what was done
    let message = `Bidding system reset complete.\n`;
    message += `- ${results.redis.biddingKeysDeleted + results.redis.statusKeysDeleted} Redis keys deleted\n`;

    if (resetDatabase) {
      message += `- ${results.database.bidsDeleted} bids deleted from database\n`;
      message += `- ${results.database.playerBiddingFlagsReset} player bidding flags reset\n`;
    }

    if (reinitialize) {
      message += `- ${results.initialized.playersInitialized} players initialized for bidding`;
    }

    return NextResponse.json({
      success: true,
      message,
      results,
    });
  } catch (error) {
    console.error('Error resetting bidding data:', error);
    return NextResponse.json({ error: 'Failed to reset bidding data' }, { status: 500 });
  }
}
