import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { biddingUtils } from '@/lib/redis';

// Order of leagues for bidding
const LEAGUE_ORDER = ['nhl', 'ahl', 'echl', 'chl'];

/**
 * This API route should be called by a cron job every few minutes
 * It handles:
 * 1. Checking for expired player bids and finalizing them
 * 2. Checking if a league bidding period has ended and starting the next one
 * 3. Cleaning up database inconsistencies (e.g., players on teams but still marked as in bidding)
 *
 * Normal flow for a player bid:
 * 1. Player is added to bidding via Redis + DB flag isInBidding=true
 * 2. Bids are placed, timer counts down
 * 3. When timer reaches zero, handleExpiredBids marks status=completed in Redis
 *    and isInBidding=false in the DB
 * 4. If a player already has a team, they should NOT be in bidding
 */
export async function GET(request: NextRequest) {
  // Validate the request contains a secret key to prevent unauthorized access
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get('key');

  // This should match an environment variable set in your deployment
  if (apiKey !== process.env.SCHEDULER_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Step 1: Check for expired player bids
    await handleExpiredBids();

    // Step 2: Check for league transitions
    await handleLeagueTransitions();

    // Step 3: Check for inconsistencies in the database
    await cleanupDatabaseInconsistencies();

    return NextResponse.json({
      success: true,
      message: 'Scheduler check completed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in bidding scheduler:', error);
    return NextResponse.json({ error: 'Failed to process bidding schedule' }, { status: 500 });
  }
}

/**
 * Handle expired bids for individual players
 */
async function handleExpiredBids() {
  // Get all active bidding data from Redis
  const allKeys = await biddingUtils.getActivePlayerBids();
  const now = Date.now();

  console.log(`Checking ${allKeys.length} active bids for expiration...`);

  // Process each active bid
  for (const key of allKeys) {
    try {
      const playerSeasonId = key.replace('bidding:', '');
      const bidData = await biddingUtils.getPlayerBidding(playerSeasonId);

      // Skip if already completed or if timer hasn't expired
      if (!bidData || bidData.status !== 'active') {
        continue;
      }

      // Check if the bid has expired
      const hasExpired = bidData.endTime && bidData.endTime <= now;

      if (!hasExpired) {
        // This bid hasn't expired yet
        continue;
      }

      console.log(
        `Processing expired bid for player: ${bidData.playerName}, ID: ${playerSeasonId}, endTime: ${new Date(bidData.endTime).toISOString()}`
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

          // Fix: Update contract amount using currentBid
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

      console.log(
        `Finalized bid for player: ${bidData.playerName}, winning team: ${bidData.currentTeamName || 'None'}`
      );
    } catch (error) {
      console.error(`Error processing expired bid: ${key}`, error);
    }
  }
}

/**
 * Check for league bidding period transitions
 */
async function handleLeagueTransitions() {
  const now = Date.now();

  // Check if any league's bidding period has ended
  for (const leagueId of LEAGUE_ORDER) {
    const status = await biddingUtils.getLeagueBiddingStatus(leagueId);

    // If this league is active but the end time has passed
    if (status && status.active && status.endTime < now) {
      console.log(`Bidding period for ${leagueId.toUpperCase()} has ended`);

      // Finalize all remaining bids for this league
      await finalizeLeagueBidding(leagueId);

      // Mark this league's bidding as inactive
      await biddingUtils.setLeagueBiddingStatus(leagueId, {
        active: false,
        startTime: 0,
        endTime: 0,
        tierLevel: status.tierLevel,
      });

      // Check if we need to start the next league in the sequence
      const currentIndex = LEAGUE_ORDER.indexOf(leagueId);
      if (currentIndex < LEAGUE_ORDER.length - 1) {
        const nextLeagueId = LEAGUE_ORDER[currentIndex + 1];

        // Calculate start time for next league (8pm EST on the day after this one ends)
        const nextDay = new Date();
        nextDay.setDate(nextDay.getDate() + 1);
        nextDay.setHours(20, 0, 0, 0); // 8:00 PM

        // Convert to Eastern Time (EST/EDT)
        // Note: This is a simplified approach, a proper timezone library would be better
        const estOffset = -5 * 60 * 60 * 1000; // EST offset in milliseconds
        const localOffset = nextDay.getTimezoneOffset() * 60 * 1000;
        const estTime = new Date(nextDay.getTime() + localOffset + estOffset);

        const startTime = estTime.getTime();
        const endTime = startTime + 2 * 24 * 60 * 60 * 1000; // 2 days

        // Start the next league's bidding period
        await biddingUtils.setLeagueBiddingStatus(nextLeagueId, {
          active: true,
          startTime,
          endTime,
          tierLevel: status.tierLevel + 1,
        });

        // Initialize players for bidding
        await initializeLeaguePlayers(nextLeagueId);

        console.log(`Started bidding period for ${nextLeagueId.toUpperCase()}`);
      } else {
        console.log('All league bidding periods have completed');
      }
    }
  }
}

/**
 * Finalize all active bids for a league
 */
async function finalizeLeagueBidding(leagueId: string) {
  // Get the tier for this league
  const tier = await prisma.tier.findFirst({
    where: {
      name: leagueId.toUpperCase(),
      season: {
        isLatest: true,
      },
    },
  });

  if (!tier) {
    console.error(`Tier not found for league: ${leagueId}`);
    return;
  }

  // Get all players in bidding for this tier
  const biddingPlayers = await biddingUtils.getPlayersByTier(tier.id);
  console.log(
    `Finalizing bidding for ${leagueId.toUpperCase()}, found ${biddingPlayers.length} players`
  );

  let processedCount = 0;

  // Process each player
  for (const player of biddingPlayers) {
    if (player.status === 'active') {
      console.log(`Finalizing bid for player: ${player.playerName} (ID: ${player.id})`);

      // Same finalization logic as in handleExpiredBids
      await biddingUtils.finalizeBidding(player.id);

      if (player.currentTeamId) {
        const teamSeason = await prisma.teamSeason.findFirst({
          where: {
            teamId: player.currentTeamId,
            tierId: tier.id,
          },
        });

        if (teamSeason) {
          await prisma.playerTeamSeason.create({
            data: {
              playerSeasonId: player.id,
              teamSeasonId: teamSeason.id,
            },
          });

          // Fix: Use currentBid instead of currentAmount, fall back to contract amount if null
          await prisma.contract.update({
            where: { id: player.contractId },
            data: { amount: player.currentBid || player.contract.amount },
          });
        }
      }

      await prisma.playerSeason.update({
        where: { id: player.id },
        data: { isInBidding: false },
      });

      processedCount++;
    }
  }

  console.log(
    `Finalized all bids for ${leagueId.toUpperCase()}, total players: ${biddingPlayers.length}, processed: ${processedCount}`
  );
}

/**
 * Initialize players for bidding in a league
 */
async function initializeLeaguePlayers(leagueId: string) {
  // Get the tier for this league
  const tier = await prisma.tier.findFirst({
    where: {
      name: leagueId.toUpperCase(),
      season: {
        isLatest: true,
      },
    },
    include: {
      season: true,
    },
  });

  if (!tier) {
    console.error(`Tier not found for league: ${leagueId}`);
    return;
  }

  // Get all available players for this tier
  const availablePlayers = await prisma.playerSeason.findMany({
    where: {
      seasonId: tier.seasonId,
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
      player: true,
      contract: true,
    },
  });

  // Get the league status to determine end time
  const status = await biddingUtils.getLeagueBiddingStatus(leagueId);

  if (!status || !status.active) {
    console.error(`League ${leagueId} is not active for bidding`);
    return;
  }

  // Initialize each player in Redis
  for (const player of availablePlayers) {
    await biddingUtils.setPlayerBidding(player.id, {
      startingAmount: player.contract.amount,
      tierId: tier.id,
      tierName: tier.name,
      endTime: status.endTime,
      playerName: player.player.name,
      position: player.position,
      contractId: player.contract.id,
    });
  }

  console.log(
    `Initialized ${availablePlayers.length} players for bidding in ${leagueId.toUpperCase()}`
  );
}

/**
 * Clean up inconsistencies in the database
 * - Players on teams shouldn't be in bidding
 */
async function cleanupDatabaseInconsistencies() {
  try {
    console.log('Checking for database inconsistencies...');

    // Find players marked as in bidding who already have team assignments
    const playersWithTeams = await prisma.playerSeason.findMany({
      where: {
        isInBidding: true,
        teamSeasons: {
          some: {}, // Has at least one team association
        },
      },
      include: {
        player: true,
      },
    });

    console.log(`Found ${playersWithTeams.length} players on teams but still marked as in bidding`);

    // Fix these players
    for (const player of playersWithTeams) {
      console.log(
        `Fixing player ${player.player.name} (ID: ${player.id}) - already on team but marked as in bidding`
      );

      // Update database
      await prisma.playerSeason.update({
        where: { id: player.id },
        data: { isInBidding: false },
      });

      // Also remove from Redis if present
      try {
        const redisData = await biddingUtils.getPlayerBidding(player.id);
        if (redisData) {
          // Finalize in Redis to clean up
          await biddingUtils.finalizeBidding(player.id);
        }
      } catch (error) {
        console.error(`Error cleaning up Redis for player ${player.id}:`, error);
      }
    }

    return playersWithTeams.length;
  } catch (error) {
    console.error('Error cleaning up database inconsistencies:', error);
    return 0;
  }
}
