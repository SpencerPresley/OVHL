/**
 * @file League Teams API Route
 * @description Handles fetching and formatting of league teams data.
 * This endpoint consolidates the business logic for retrieving team rosters,
 * stats, and management information that was previously handled in the page component.
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { NHL_TEAMS } from '@/lib/teams/nhl';
import { AHL_TEAMS } from '@/lib/teams/ahl';
import { ECHL_TEAMS } from '@/lib/teams/echl';
import { CHL_TEAMS } from '@/lib/teams/chl';
import { NHLDivision, AHLDivision, ECHLDivision } from '@/lib/teams/types';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// Helper function to get division for a team
function getTeamDivision(teamIdentifier: string, teamName: string, leagueId: string) {
  const teamId = teamIdentifier.toLowerCase();
  console.log('Looking up division for:', { teamId, teamName, leagueId });

  switch (leagueId) {
    case 'nhl': {
      const team = NHL_TEAMS.find((t) => t.id === teamId);
      console.log('Found NHL team:', { team, validDivisions: Object.values(NHLDivision) });
      // Verify it's an NHL division AND the name matches
      if (
        team?.division &&
        Object.values(NHLDivision).includes(team.division) &&
        team.name === teamName
      ) {
        return team.division;
      }
      return null;
    }
    case 'ahl': {
      const team = AHL_TEAMS.find((t) => t.id === teamId);
      console.log('Found AHL team:', { team, validDivisions: Object.values(AHLDivision) });
      // Verify it's an AHL division AND the name matches
      if (
        team?.division &&
        Object.values(AHLDivision).includes(team.division) &&
        team.name === teamName
      ) {
        return team.division;
      }
      return null;
    }
    case 'echl': {
      const team = ECHL_TEAMS.find((t) => t.id === teamId);
      console.log('Found ECHL team:', { team, validDivisions: Object.values(ECHLDivision) });
      // Verify it's an ECHL division AND the name matches
      if (
        team?.division &&
        Object.values(ECHLDivision).includes(team.division) &&
        team.name === teamName
      ) {
        return team.division;
      }
      return null;
    }
    case 'chl': {
      const team = CHL_TEAMS.find((t) => t.id === teamId);
      console.log('Found CHL team:', { team });
      // For CHL we also check the league property AND the name matches
      if (team?.division && team.league && team.name === teamName) {
        return team.division;
      }
      return null;
    }
    default:
      return null;
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get('tier');
    const resolvedParams = await params;
    const leagueId = resolvedParams.id.toLowerCase();

    console.log('Fetching teams for:', { tier, leagueId });

    if (!tier) {
      return NextResponse.json({ error: 'Tier parameter is required' }, { status: 400 });
    }

    // Get the latest season
    const season = await prisma.season.findFirst({
      where: { isLatest: true },
    });

    console.log('Found season:', season);

    if (!season) {
      return NextResponse.json({ error: 'No active season found' }, { status: 404 });
    }

    // Get all teams in this league
    const tierData = await prisma.tier.findFirst({
      where: {
        seasonId: season.id,
        name: tier,
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

    console.log('Found tier:', {
      id: tierData?.id,
      name: tierData?.name,
      teamCount: tierData?.teams.length,
      teams: tierData?.teams.map((t) => ({
        id: t.team.id,
        name: t.team.officialName,
        identifier: t.team.teamIdentifier,
      })),
    });

    if (!tierData) {
      return NextResponse.json({ error: 'League tier not found' }, { status: 404 });
    }

    // Filter teams based on league-specific data BEFORE transforming
    console.log('About to filter teams. Total teams before filter:', tierData.teams.length);

    const validTeams = tierData.teams
      .map((teamSeason) => {
        const teamId = teamSeason.team.teamIdentifier.toLowerCase();
        let leagueTeam;

        switch (leagueId) {
          case 'nhl':
            leagueTeam = NHL_TEAMS.find((t) => t.id === teamId);
            break;
          case 'ahl':
            leagueTeam = AHL_TEAMS.find((t) => t.id === teamId);
            break;
          case 'echl':
            leagueTeam = ECHL_TEAMS.find((t) => t.id === teamId);
            break;
          case 'chl':
            leagueTeam = CHL_TEAMS.find((t) => t.id === teamId);
            break;
          default:
            leagueTeam = null;
        }

        console.log('Team check:', {
          teamId: teamSeason.team.teamIdentifier,
          dbName: teamSeason.team.officialName,
          leagueTeamName: leagueTeam?.name,
          valid: !!leagueTeam,
        });

        if (!leagueTeam) return null;

        // Return a new object with the CORRECT name from our league data
        return {
          ...teamSeason,
          team: {
            ...teamSeason.team,
            officialName: leagueTeam.name, // Use the name from our league data
          },
        };
      })
      .filter(Boolean) as typeof tierData.teams; // Filter out nulls and cast back to correct type

    console.log('Teams after filter:', validTeams.length);
    console.log(
      'Valid teams:',
      validTeams.map((t) => ({
        id: t.team.teamIdentifier,
        name: t.team.officialName,
      }))
    );

    // Transform ONLY the valid teams
    const teams = validTeams.map((teamSeason) => ({
      team: {
        id: teamSeason.team.id,
        officialName: teamSeason.team.officialName,
        teamIdentifier: teamSeason.team.teamIdentifier,
        managers: teamSeason.team.managers,
      },
      tier: {
        salaryCap: tierData.salaryCap,
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
