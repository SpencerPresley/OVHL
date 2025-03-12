import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Admin Team Roster API Route
 * 
 * Retrieves detailed roster information for a specific team.
 * Requires admin authentication.
 * 
 * @route GET /api/admin/teams/[id]/roster
 * @param {Object} params - Route parameters
 * @param {string} params.id - Team ID
 * @returns {Promise<NextResponse>} JSON response with team roster data
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verify admin authentication using NextAuth
    await requireAdmin();

    // Get team data with current season and players
    const team = await prisma.team.findUnique({
      where: { id: params.id },
      include: {
        seasons: {
          where: {
            tier: {
              season: {
                isLatest: true,
              },
            },
          },
          include: {
            tier: true,
            players: {
              include: {
                playerSeason: {
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
                },
              },
            },
          },
        },
      },
    });

    if (!team || !team.seasons[0]) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const currentSeason = team.seasons[0];
    const players = currentSeason.players;

    // Transform data for the frontend
    const transformedTeam = {
      id: team.id,
      officialName: team.officialName,
      teamIdentifier: team.teamIdentifier,
      tier: {
        name: currentSeason.tier.name,
        salaryCap: currentSeason.tier.salaryCap,
      },
      roster: {
        forwards: players
          .filter((p) => ['C', 'LW', 'RW'].includes(p.playerSeason.position))
          .map((p) => ({
            id: p.playerSeason.id,
            name: p.playerSeason.player.name,
            position: p.playerSeason.position,
            gamertag: p.playerSeason.player.gamertags[0]?.gamertag || p.playerSeason.player.name,
            contract: {
              amount: p.playerSeason.contract.amount,
            },
            stats: {
              gamesPlayed: p.gamesPlayed,
              goals: p.goals,
              assists: p.assists,
              plusMinus: p.plusMinus,
            },
          })),
        defense: players
          .filter((p) => ['LD', 'RD'].includes(p.playerSeason.position))
          .map((p) => ({
            id: p.playerSeason.id,
            name: p.playerSeason.player.name,
            position: p.playerSeason.position,
            gamertag: p.playerSeason.player.gamertags[0]?.gamertag || p.playerSeason.player.name,
            contract: {
              amount: p.playerSeason.contract.amount,
            },
            stats: {
              gamesPlayed: p.gamesPlayed,
              goals: p.goals,
              assists: p.assists,
              plusMinus: p.plusMinus,
            },
          })),
        goalies: players
          .filter((p) => p.playerSeason.position === 'G')
          .map((p) => ({
            id: p.playerSeason.id,
            name: p.playerSeason.player.name,
            position: p.playerSeason.position,
            gamertag: p.playerSeason.player.gamertags[0]?.gamertag || p.playerSeason.player.name,
            contract: {
              amount: p.playerSeason.contract.amount,
            },
            stats: {
              gamesPlayed: p.gamesPlayed,
              saves: p.saves,
              goalsAgainst: p.goalsAgainst,
            },
          })),
      },
    };

    return NextResponse.json({ team: transformedTeam });
  } catch (error) {
    console.error('Failed to fetch team roster:', error);
    
    // Check if it's an authentication error
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      if (error.message === 'Admin privileges required') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    }
    
    return NextResponse.json({ error: 'Failed to fetch team roster' }, { status: 500 });
  }
}
