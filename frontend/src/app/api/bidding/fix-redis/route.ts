import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { biddingUtils } from '@/lib/redis';
import redis from '@/lib/redis';

const prisma = new PrismaClient();

/**
 * POST /api/bidding/fix-redis
 *
 * This endpoint performs a deep cleanup of the Redis database to fix issues with players
 * showing as "Ending..." or other inconsistencies. It:
 *
 * 1. Identifies and removes stale Redis entries
 * 2. Finalizes any bids that should have expired
 * 3. Aligns Redis state with database state
 */
export async function POST(request: NextRequest) {
  try {
    // Security - only admins can access this endpoint
    // Using requireAdmin from our Auth.js-compatible helper
    try {
      await requireAdmin(); // This will throw if user is not admin
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Results to track what we've fixed
    const results = {
      expiredBidsFixed: 0,
      playersOnTeamsFixed: 0,
      redisEntriesRemoved: 0,
      inconsistentStatesFixed: 0,
    };

    // Step 1: Get all keys from Redis
    const allKeys = await redis.keys('ovhl:bidding:*');
    console.log(`Found ${allKeys.length} bidding keys in Redis`);

    // Step 2: Process each key
    const now = Date.now();

    for (const key of allKeys) {
      const playerSeasonId = key.replace('ovhl:bidding:', '');
      const redisData = await redis.get(key);

      if (!redisData) continue; // Skip if no data

      const playerData = JSON.parse(redisData);

      // Check database state for this player
      const playerInDB = await prisma.playerSeason.findUnique({
        where: { id: playerSeasonId },
        include: {
          teamSeasons: true,
          player: true,
        },
      });

      if (!playerInDB) {
        // Player doesn't exist in DB, remove from Redis
        console.log(`Removing Redis key for non-existent player: ${playerSeasonId}`);
        await redis.del(key);
        results.redisEntriesRemoved++;
        continue;
      }

      // Check if player is on a team
      const isOnTeam = playerInDB.teamSeasons.length > 0;

      // Case 1: Player is on team but still in Redis
      if (isOnTeam) {
        console.log(
          `Player ${playerInDB.player.name} (${playerSeasonId}) is on a team but still in Redis`
        );

        // Mark player as not in bidding in DB (if needed)
        if (playerInDB.isInBidding) {
          await prisma.playerSeason.update({
            where: { id: playerSeasonId },
            data: { isInBidding: false },
          });
        }

        // Remove from Redis
        await redis.del(key);
        results.playersOnTeamsFixed++;
        continue;
      }

      // Case 2: Expired bids
      const isExpired = playerData.endTime && playerData.endTime <= now;
      const isActive = playerData.status === 'active';

      if (isExpired && isActive) {
        console.log(`Fixing expired bid for player ${playerData.playerName} (${playerSeasonId})`);

        // Finalize the bid in Redis
        await biddingUtils.finalizeBidding(playerSeasonId);

        // Update database
        // If there's a winning bid (currentTeamId exists), process it
        if (playerData.currentTeamId) {
          // Get the team season record
          const teamSeason = await prisma.teamSeason.findFirst({
            where: {
              teamId: playerData.currentTeamId,
              tierId: playerData.tierId,
            },
          });

          if (teamSeason) {
            // Create player-team association
            await prisma.playerTeamSeason.create({
              data: {
                playerSeasonId,
                teamSeasonId: teamSeason.id,
              },
            });

            // Update contract amount using currentBid
            await prisma.contract.update({
              where: { id: playerData.contractId },
              data: { amount: playerData.currentBid || playerData.contract.amount },
            });
          }
        }

        // Mark player as no longer in bidding
        await prisma.playerSeason.update({
          where: { id: playerSeasonId },
          data: { isInBidding: false },
        });

        results.expiredBidsFixed++;
        continue;
      }

      // Case 3: DB says not in bidding, but Redis says it is
      if (!playerInDB.isInBidding && isActive) {
        console.log(
          `Player ${playerInDB.player.name} (${playerSeasonId}) is not in bidding in DB but is active in Redis`
        );

        // Remove from Redis
        await redis.del(key);
        results.inconsistentStatesFixed++;
        continue;
      }
    }

    // Return summary of fixes
    return NextResponse.json({
      success: true,
      message: 'Redis cleanup completed successfully',
      results,
    });
  } catch (error) {
    console.error('Error fixing Redis:', error);
    return NextResponse.json({ error: 'Failed to fix Redis data' }, { status: 500 });
  }
}
