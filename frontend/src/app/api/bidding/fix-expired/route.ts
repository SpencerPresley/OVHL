import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { biddingUtils } from '@/lib/redis';
import { requireAdmin } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * This endpoint manually fixes expired bids that are stuck in the "Ending..." state
 */
export async function POST(request: NextRequest) {
  try {
    // Ensure user is authorized (admin) using our Auth.js-compatible helper
    try {
      await requireAdmin(); // This will throw if user is not admin
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all keys in the bidding namespace
    const keys = await biddingUtils.getActivePlayerBids();
    const now = Date.now();
    let fixedCount = 0;

    // Process each active bid
    for (const key of keys) {
      try {
        const playerSeasonId = key.replace('bidding:', '');
        const bidData = await biddingUtils.getPlayerBidding(playerSeasonId);

        // Skip if already completed or not active
        if (!bidData || bidData.status !== 'active') {
          continue;
        }

        // Check if the bid has expired
        if (bidData.endTime && bidData.endTime <= now) {
          console.log(
            `Fixing expired bid for player: ${bidData.playerName}, ID: ${playerSeasonId}`
          );

          // Finalize the bid in Redis
          await biddingUtils.finalizeBidding(playerSeasonId);

          // Process the winning bid in the database
          if (bidData.currentTeamId) {
            // Get the team season record
            const teamSeason = await prisma.teamSeason.findFirst({
              where: {
                teamId: bidData.currentTeamId,
                tierId: bidData.tierId,
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
                where: { id: bidData.contractId },
                data: { amount: bidData.currentBid || bidData.contract.amount },
              });
            }
          }

          // Mark player as no longer in bidding
          await prisma.playerSeason.update({
            where: { id: playerSeasonId },
            data: { isInBidding: false },
          });

          fixedCount++;
        }
      } catch (error) {
        console.error(`Error fixing expired bid: ${key}`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixedCount} expired bids`,
      fixedCount,
    });
  } catch (error) {
    console.error('Error fixing expired bids:', error);
    return NextResponse.json({ error: 'Failed to fix expired bids' }, { status: 500 });
  }
}
