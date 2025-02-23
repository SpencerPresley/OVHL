/**
 * @file Individual Team API Route
 * @description Handles fetching and formatting of individual team data.
 * This endpoint consolidates the business logic for retrieving detailed team information,
 * including roster, management, and performance statistics.
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string; teamId: string } }
) {
  try {
    const resolvedParams = await params;
    const leagueId = resolvedParams.id;
    const teamId = resolvedParams.teamId;

    if (!leagueId || !teamId) {
      return NextResponse.json({ error: 'League ID and Team ID are required' }, { status: 400 });
    }

    // Get the latest season
    const season = await prisma.season.findFirst({
      where: { isLatest: true },
    });

    if (!season) {
      return NextResponse.json({ error: 'No active season found' }, { status: 404 });
    }

    // Get the team and its current season data
    const team = await prisma.team.findFirst({
      where: { teamIdentifier: teamId.toUpperCase() },
      include: {
        seasons: {
          where: {
            tier: {
              seasonId: season.id,
              name: leagueId.toUpperCase(),
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
                        user: true,
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
        managers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true,
                player: {
                  include: {
                    gamertags: {
                      orderBy: { createdAt: 'desc' },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            role: 'asc',
          },
        },
      },
    });

    if (!team || !team.seasons[0]) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const teamSeason = team.seasons[0];

    return NextResponse.json({
      team: {
        id: team.id,
        officialName: team.officialName,
        managers: team.managers,
      },
      teamSeason: {
        ...teamSeason,
        tier: teamSeason.tier,
      },
      managers: team.managers,
    });
  } catch (error) {
    console.error('Failed to fetch team data:', error);
    return NextResponse.json({ error: 'Failed to fetch team data' }, { status: 500 });
  }
}
