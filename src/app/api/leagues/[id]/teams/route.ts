/**
 * @file League Teams API Route
 * @description Handles fetching and formatting of league teams data.
 * This endpoint consolidates the business logic for retrieving team rosters,
 * stats, and management information that was previously handled in the page component.
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const resolvedParams = await params;
    const leagueId = resolvedParams.id;

    if (!leagueId) {
      return NextResponse.json({ error: 'League ID is required' }, { status: 400 });
    }

    // Get the latest season
    const season = await prisma.season.findFirst({
      where: { isLatest: true },
    });

    if (!season) {
      return NextResponse.json({ error: 'No active season found' }, { status: 404 });
    }

    // Get all teams in this league
    const tier = await prisma.tier.findFirst({
      where: {
        seasonId: season.id,
        name: leagueId.toUpperCase(),
      },
      include: {
        teams: {
          include: {
            team: {
              include: {
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
                },
              },
            },
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
      },
    });

    if (!tier) {
      return NextResponse.json({ error: 'League tier not found' }, { status: 404 });
    }

    // Transform the data to match what TeamsDisplay expects
    const teams = tier.teams.map((teamSeason) => ({
      team: {
        id: teamSeason.team.id,
        officialName: teamSeason.team.officialName,
        teamIdentifier: teamSeason.team.teamIdentifier,
        managers: teamSeason.team.managers,
      },
      tier: {
        salaryCap: tier.salaryCap,
      },
      wins: teamSeason.wins || 0,
      losses: teamSeason.losses || 0,
      otLosses: teamSeason.otLosses || 0,
      players: teamSeason.players.map((player) => ({
        playerSeason: {
          player: {
            id: player.playerSeason.player.id,
            name: player.playerSeason.player.name,
            user: {
              id: player.playerSeason.player.user.id,
            },
            gamertags: player.playerSeason.player.gamertags.map((gt) => ({
              gamertag: gt.gamertag,
              system: gt.system,
            })),
          },
          position: player.playerSeason.position,
          contract: player.playerSeason.contract,
        },
        gamesPlayed: player.gamesPlayed,
        goals: player.goals,
        assists: player.assists,
        plusMinus: player.plusMinus,
        goalsAgainst: player.goalsAgainst,
        saves: player.saves,
      })),
    }));

    return NextResponse.json({ teams });
  } catch (error) {
    console.error('Failed to fetch league teams:', error);
    return NextResponse.json({ error: 'Failed to fetch league teams' }, { status: 500 });
  }
}
