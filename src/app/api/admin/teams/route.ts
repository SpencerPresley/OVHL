import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
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

    // Get the latest season
    const season = await prisma.season.findFirst({
      where: { isLatest: true },
    });

    if (!season) {
      return NextResponse.json({ error: 'No active season found' }, { status: 404 });
    }

    // Get all teams with their current season data
    const teams = await prisma.team.findMany({
      include: {
        nhlAffiliate: true,
        ahlAffiliate: true,
        seasons: {
          where: {
            tier: {
              seasonId: season.id,
            },
          },
          include: {
            tier: true,
            players: {
              include: {
                playerSeason: {
                  select: {
                    position: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Transform the data to include roster counts
    const transformedTeams = teams.map((team) => {
      const currentSeason = team.seasons[0];
      const players = currentSeason?.players || [];

      // Calculate roster counts
      const forwards = players.filter((p) =>
        ['C', 'LW', 'RW'].includes(p.playerSeason.position)
      ).length;
      const defense = players.filter((p) => ['LD', 'RD'].includes(p.playerSeason.position)).length;
      const goalies = players.filter((p) => p.playerSeason.position === 'G').length;

      return {
        id: team.id,
        officialName: team.officialName,
        teamIdentifier: team.teamIdentifier,
        eaClubId: team.eaClubId,
        eaClubName: team.eaClubName,
        nhlAffiliate: team.nhlAffiliate,
        ahlAffiliate: team.ahlAffiliate,
        seasons: [
          {
            tier: {
              name: currentSeason?.tier.name || '',
            },
          },
        ],
        roster: {
          forwards,
          defense,
          goalies,
        },
      };
    });

    return NextResponse.json({ teams: transformedTeams });
  } catch (error) {
    console.error('Failed to fetch teams:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}
