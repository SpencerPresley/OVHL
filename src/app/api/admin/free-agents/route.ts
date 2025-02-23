import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verify(token.value, process.env.JWT_SECRET!) as {
      id: string;
      isAdmin?: boolean;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const league = searchParams.get('league');
    const search = searchParams.get('search') || '';
    const position = searchParams.get('position') || 'all';

    if (!league) {
      return NextResponse.json({ error: 'League is required' }, { status: 400 });
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
        name: league,
      },
    });

    if (!tier) {
      return NextResponse.json({ error: 'League tier not found' }, { status: 404 });
    }

    // Build position filter
    let positionFilter = {};
    if (position === 'forwards') {
      positionFilter = { position: { in: ['C', 'LW', 'RW'] } };
    } else if (position === 'defense') {
      positionFilter = { position: { in: ['LD', 'RD'] } };
    } else if (position === 'G') {
      positionFilter = { position: 'G' };
    }

    // Get all free agents (players in bidding pool)
    const freeAgents = await prisma.playerSeason.findMany({
      where: {
        seasonId: season.id,
        isInBidding: true,
        // Make sure they're not already on a team in this tier
        teamSeasons: {
          none: {
            teamSeason: {
              tierId: tier.id,
            },
          },
        },
        // Add position filter
        ...positionFilter,
        // Add search filter
        OR: search
          ? [
              { player: { name: { contains: search, mode: 'insensitive' } } },
              {
                player: {
                  gamertags: { some: { gamertag: { contains: search, mode: 'insensitive' } } },
                },
              },
            ]
          : undefined,
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
      orderBy: [{ player: { name: 'asc' } }],
    });

    // Transform the data for the frontend
    const players = freeAgents.map((fa) => ({
      id: fa.id,
      name: fa.player.name,
      position: fa.position,
      gamertag: fa.player.gamertags[0]?.gamertag || fa.player.name,
      contract: {
        amount: fa.contract.amount,
      },
      isInBidding: fa.isInBidding,
    }));

    return NextResponse.json({ players });
  } catch (error) {
    console.error('Failed to fetch free agents:', error);
    return NextResponse.json({ error: 'Failed to fetch free agents' }, { status: 500 });
  }
}
