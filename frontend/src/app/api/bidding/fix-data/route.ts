import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { AuthOptions } from '@/lib/auth-options';
import redis from '@/lib/redis';

const prisma = new PrismaClient();
const keyPrefix = {
  bidding: 'bidding:',
  leagueStatus: 'leagueStatus:',
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createKey(prefix: keyof typeof keyPrefix, id: string) {
  return `${keyPrefix[prefix]}${id}`;
}

// POST /api/bidding/fix-data
// Fix player data in Redis - adds gamertags and removes endTime for players without bids
export async function POST(request: NextRequest) {
  // Only admins should be able to fix bidding data
  const session = await getServerSession(AuthOptions);

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { leagueId = 'nhl' } = await request.json();

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
        name: leagueId.toUpperCase(),
        seasonId: season.id,
      },
    });

    if (!tier) {
      return NextResponse.json({ error: 'Tier not found' }, { status: 404 });
    }

    // Get all bidding player keys
    const keys = await redis.keys(`${keyPrefix.bidding}*`);
    const updatedPlayers = [];
    const now = Date.now();

    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const player = JSON.parse(data);

        // Only process players in the specified tier
        if (player.tierId === tier.id) {
          // Get the player from the database to get the latest gamertag
          const playerSeasonId = key.replace(keyPrefix.bidding, '');
          const playerData = await prisma.playerSeason.findUnique({
            where: { id: playerSeasonId },
            include: {
              player: {
                include: {
                  gamertags: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                  },
                },
              },
            },
          });

          if (playerData) {
            // Update the player data with the gamertag
            const gamertag = playerData.player.gamertags[0]?.gamertag || playerData.player.name;

            // Check if player has an active bid
            const hasActiveBid =
              player.currentBid !== null &&
              player.currentBid !== player.contract.amount &&
              player.currentTeamId !== null;

            // Determine correct endTime based on bidding rules
            let endTime;
            if (hasActiveBid) {
              // If player has an active bid, apply timer rules

              // For existing bids with incorrect timers, fix according to rules:
              if (!player.endTime || player.endTime - now > 8 * 60 * 60 * 1000) {
                // If timer is more than 8 hours or not set, adjust to 8 hours
                endTime = now + 8 * 60 * 60 * 1000;
              } else {
                // Keep existing timer if it's valid (8 hours or less)
                endTime = player.endTime;
              }
            } else {
              // No active bid, so no timer
              endTime = undefined;
            }

            // Update the player data
            const updatedPlayer = {
              ...player,
              gamertag,
              endTime,
            };

            // Save the updated player data
            await redis.set(key, JSON.stringify(updatedPlayer));
            updatedPlayers.push(playerSeasonId);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedPlayers.length} players in ${leagueId.toUpperCase()}`,
      updatedCount: updatedPlayers.length,
      updatedPlayers,
    });
  } catch (error) {
    console.error('Error fixing bidding data:', error);
    return NextResponse.json({ error: 'Failed to fix bidding data' }, { status: 500 });
  }
}

// GET /api/bidding/fix-data
// Check the status of player data in Redis
export async function GET(request: NextRequest) {
  // Only admins should be able to check bidding data
  const session = await getServerSession(AuthOptions);

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId') || 'nhl';

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
        name: leagueId.toUpperCase(),
        seasonId: season.id,
      },
    });

    if (!tier) {
      return NextResponse.json({ error: 'Tier not found' }, { status: 404 });
    }

    // Get all bidding player keys
    const keys = await redis.keys(`${keyPrefix.bidding}*`);
    const playerData = [];

    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const player = JSON.parse(data);

        // Only process players in the specified tier
        if (player.tierId === tier.id) {
          const playerSeasonId = key.replace(keyPrefix.bidding, '');

          playerData.push({
            id: playerSeasonId,
            name: player.playerName,
            gamertag: player.gamertag || 'Missing',
            position: player.position,
            currentBid: player.currentBid,
            currentTeamId: player.currentTeamId,
            currentTeamName: player.currentTeamName,
            hasEndTime: !!player.endTime,
            hasActiveBid:
              player.currentBid !== player.contract.amount && player.currentTeamId !== null,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      leagueId: leagueId.toUpperCase(),
      tierId: tier.id,
      playerCount: playerData.length,
      playersWithGamertag: playerData.filter((p) => p.gamertag !== 'Missing').length,
      playersWithEndTime: playerData.filter((p) => p.hasEndTime).length,
      playersWithActiveBids: playerData.filter((p) => p.hasActiveBid).length,
      players: playerData,
    });
  } catch (error) {
    console.error('Error checking bidding data:', error);
    return NextResponse.json({ error: 'Failed to check bidding data' }, { status: 500 });
  }
}
