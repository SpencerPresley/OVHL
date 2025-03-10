import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const leagueId = searchParams.get('leagueId') || 'nhl';

  try {
    // Get latest season
    const season = await prisma.season.findFirst({
      where: { isLatest: true },
    });

    if (!season) {
      return NextResponse.json({ error: 'No active season found' }, { status: 404 });
    }

    // Get tier for the league
    const tier = await prisma.tier.findFirst({
      where: {
        name: leagueId.toUpperCase(),
        seasonId: season.id,
      },
    });

    if (!tier) {
      return NextResponse.json({ error: 'Tier not found' }, { status: 404 });
    }

    // Count all player seasons
    const allPlayerSeasonsCount = await prisma.playerSeason.count({
      where: {
        seasonId: season.id,
      },
    });

    // Count player seasons in bidding
    const inBiddingCount = await prisma.playerSeason.count({
      where: {
        seasonId: season.id,
        isInBidding: true,
      },
    });

    // Count player seasons not on a team for this tier
    const notOnTeamCount = await prisma.playerSeason.count({
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

    // Count player seasons that meet both criteria
    const availablePlayersCount = await prisma.playerSeason.count({
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
    });

    // Get some sample player seasons
    const samplePlayers = await prisma.playerSeason.findMany({
      where: {
        seasonId: season.id,
      },
      include: {
        player: true,
      },
      take: 5,
    });

    // Get the query criteria we use for bidding
    const queryCriteria = {
      seasonId: season.id,
      isInBidding: true,
      teamSeasons: {
        none: {
          teamSeason: {
            tierId: tier.id,
          },
        },
      },
    };

    return NextResponse.json({
      season: {
        id: season.id,
        seasonId: season.seasonId,
        isLatest: season.isLatest,
      },
      tier: {
        id: tier.id,
        name: tier.name,
        leagueLevel: tier.leagueLevel,
      },
      counts: {
        allPlayerSeasons: allPlayerSeasonsCount,
        inBidding: inBiddingCount,
        notOnTeam: notOnTeamCount,
        availablePlayers: availablePlayersCount,
      },
      samplePlayers: samplePlayers.map((p) => ({
        id: p.id,
        playerName: p.player.name,
        isInBidding: p.isInBidding,
        position: p.position,
      })),
      queryCriteria,
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: 'Debug endpoint failed' }, { status: 500 });
  }
}
