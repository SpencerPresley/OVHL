import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { biddingUtils } from '@/lib/redis';
import { getServerSession } from 'next-auth';
import { AuthOptions } from '@/lib/auth-options';

const prisma = new PrismaClient();

/**
 * This endpoint fixes players that are stuck in bidding in the database
 * This can happen if Redis was cleared but players remain marked as isInBidding=true
 * It also checks if players are already on a team - they shouldn't be in bidding
 */
export async function POST(request: NextRequest) {
  try {
    // Ensure user is authorized (admin)
    const session = await getServerSession(AuthOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find all players marked as in bidding in the database
    const playersInBidding = await prisma.playerSeason.findMany({
      where: {
        isInBidding: true,
      },
      include: {
        player: true,
        contract: true,
        teamSeasons: true,  // Include team assignments
      },
    });

    console.log(`Found ${playersInBidding.length} players marked as in bidding in the database`);

    let fixedCount = 0;
    let activeInRedisCount = 0;
    let notInRedisCount = 0;
    let alreadyOnTeamCount = 0;

    // Check each player
    for (const player of playersInBidding) {
      try {
        // First check: Is player already on a team?
        if (player.teamSeasons && player.teamSeasons.length > 0) {
          console.log(`Player ${player.player.name} (ID: ${player.id}) is already on a team but marked as in bidding. Fixing...`);
          alreadyOnTeamCount++;
          
          // Fix: Mark player as no longer in bidding
          await prisma.playerSeason.update({
            where: { id: player.id },
            data: { isInBidding: false },
          });
          
          fixedCount++;
          continue; // Skip further checks
        }
        
        // Second check: Redis status
        const redisData = await biddingUtils.getPlayerBidding(player.id);
        
        if (!redisData) {
          console.log(`Player ${player.player.name} (ID: ${player.id}) is marked as in bidding but not in Redis. Fixing...`);
          notInRedisCount++;
          
          // Fix: Mark player as no longer in bidding
          await prisma.playerSeason.update({
            where: { id: player.id },
            data: { isInBidding: false },
          });
          
          fixedCount++;
        } else if (redisData.status === 'completed') {
          console.log(`Player ${player.player.name} (ID: ${player.id}) is marked as completed in Redis but still in bidding in DB. Fixing...`);
          
          // Fix: Mark player as no longer in bidding
          await prisma.playerSeason.update({
            where: { id: player.id },
            data: { isInBidding: false },
          });
          
          fixedCount++;
        } else {
          console.log(`Player ${player.player.name} (ID: ${player.id}) is still active in Redis`);
          activeInRedisCount++;
        }
      } catch (error) {
        console.error(`Error processing player ${player.player.name} (ID: ${player.id}):`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixedCount} players in the database`,
      stats: {
        totalPlayersInBidding: playersInBidding.length,
        fixedCount,
        activeInRedisCount,
        notInRedisCount,
        alreadyOnTeamCount
      }
    });
  } catch (error) {
    console.error('Error fixing players in database:', error);
    return NextResponse.json({ error: 'Failed to fix players in database' }, { status: 500 });
  }
} 