import { NextResponse } from 'next/server';
// TODO: (JWT) NEEDS TO BE REDONE FOR NEXT AUTH
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // TODO: (JWT) NEEDS TO BE REDONE FOR NEXT AUTH
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
    return NextResponse.json({ error: 'Failed to fetch team roster' }, { status: 500 });
  }
}
