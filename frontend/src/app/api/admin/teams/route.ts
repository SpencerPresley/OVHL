import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Admin Teams API Route
 *
 * Retrieves all teams with roster information.
 * Requires admin authentication.
 *
 * @route GET /api/admin/teams
 * @returns {Promise<NextResponse>} JSON response with teams data
 */
export async function GET() {
  try {
    // Verify admin authentication using NextAuth
    await requireAdmin();

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

    // Check if it's an authentication error
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      if (error.message === 'Admin privileges required') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    }

    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}
