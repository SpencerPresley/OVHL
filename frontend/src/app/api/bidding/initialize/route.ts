import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { biddingUtils } from '@/lib/redis';
import { requireAdmin } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Only admins should be able to initialize bidding data
    try {
      await requireAdmin(); // This will throw if user is not admin
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    if (players.length === 0) {
      return NextResponse.json({
        message: 'No eligible players found. Creating sample player for testing.',
        initializedCount: 0,
      });
    }

    // Start bidding for the league if not already active
    const now = Date.now();
    const twoDaysMs = 2 * 24 * 60 * 60 * 1000;

    await biddingUtils.setLeagueBiddingStatus(leagueId, {
      active: true,
      startTime: now,
      endTime: now + twoDaysMs,
      tierLevel: tier.leagueLevel,
    });

    // Initialize each player in Redis
    let initializedCount = 0;
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
      initializedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Initialized ${initializedCount} players for bidding in ${leagueId.toUpperCase()}`,
      initializedCount,
    });
  } catch (error) {
    console.error('Error initializing bidding data:', error);
    return NextResponse.json({ error: 'Failed to initialize bidding data' }, { status: 500 });
  }
}

// Create a test player for bidding if needed
export async function GET(request: NextRequest) {
  try {
    // Only admins should be able to create test data
    try {
      await requireAdmin(); // This will throw if user is not admin
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId') || 'nhl';
    const count = parseInt(searchParams.get('count') || '5', 10);

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

    // Create test players with contracts for bidding
    const positions = ['C', 'LW', 'RW', 'LD', 'RD', 'G'];
    const createdPlayers = [];

    for (let i = 0; i < count; i++) {
      // Check if test player exists
      const existingPlayer = await prisma.player.findFirst({
        where: {
          name: `Test Player ${i + 1}`,
        },
      });

      let playerId;

      if (!existingPlayer) {
        // Create a test user first
        const user = await prisma.user.create({
          data: {
            email: `testplayer${i + 1}@example.com`,
            username: `testplayer${i + 1}`,
            password: 'password123', // Very secure 😉
            name: `Test Player ${i + 1}`,
          },
        });

        // Create a player linked to the user
        const player = await prisma.player.create({
          data: {
            id: user.id,
            ea_id: `testea${i + 1}`,
            name: `Test Player ${i + 1}`,
            activeSystem: 'PS',
          },
        });

        playerId = player.id;

        // Create a gamertag
        await prisma.gamertagHistory.create({
          data: {
            playerId: player.id,
            system: 'PS',
            gamertag: `Gamertag${i + 1}`,
          },
        });
      } else {
        playerId = existingPlayer.id;
      }

      // Create a contract
      const contract = await prisma.contract.create({
        data: {
          amount: 500000 + Math.floor(Math.random() * 5000000), // Random contract amount
        },
      });

      // Create the player season
      const position = positions[Math.floor(Math.random() * positions.length)];
      const playerSeason = await prisma.playerSeason.create({
        data: {
          playerId,
          seasonId: season.id,
          position,
          contractId: contract.id,
          isInBidding: true,
          gamesPlayed: Math.floor(Math.random() * 82),
          goals: Math.floor(Math.random() * 40),
          assists: Math.floor(Math.random() * 60),
          plusMinus: Math.floor(Math.random() * 40) - 20,
        },
      });

      // When initializing the player in Redis, include the gamertag
      const gamertag = `Gamertag${i + 1}`;

      await biddingUtils.setPlayerBidding(playerSeason.id, {
        startingAmount: contract.amount,
        tierId: tier.id,
        tierName: leagueId.toUpperCase(),
        playerName: `Test Player ${i + 1}`,
        gamertag,
        position,
        contractId: contract.id,
        stats: {
          gamesPlayed: playerSeason.gamesPlayed || 0,
          goals: playerSeason.goals || 0,
          assists: playerSeason.assists || 0,
          plusMinus: playerSeason.plusMinus || 0,
        },
      });

      createdPlayers.push({
        id: playerSeason.id,
        name: `Test Player ${i + 1}`,
        position,
        contractAmount: contract.amount,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdPlayers.length} test players for bidding`,
      players: createdPlayers,
    });
  } catch (error) {
    console.error('Error creating test data:', error);
    return NextResponse.json({ error: 'Failed to create test data' }, { status: 500 });
  }
}
