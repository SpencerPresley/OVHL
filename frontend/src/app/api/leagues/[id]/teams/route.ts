/**
 * @file League Teams API Route
 * @description Handles fetching and formatting of league teams data.
 * This endpoint consolidates the business logic for retrieving team rosters,
 * stats, and management information that was previously handled in the page component.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NHL_TEAMS } from '@/lib/teams/nhl';
import { AHL_TEAMS } from '@/lib/teams/ahl';
import { ECHL_TEAMS } from '@/lib/teams/echl';
import { CHL_TEAMS } from '@/lib/teams/chl';
import { NHLDivision, AHLDivision, ECHLDivision } from '@/lib/teams/types';

export const dynamic = 'force-dynamic';

// Helper function to get division for a team
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // We don't need the 'tier' search param anymore
    // const { searchParams } = new URL(request.url);
    // const tier = searchParams.get('tier');
    const resolvedParams = await params;
    const leagueShortName = resolvedParams.id.toLowerCase(); // Use league short name like 'nhl', 'ahl'

    console.log('Fetching teams for league:', { leagueShortName });

    // Find the League ID based on the shortName (case-insensitive)
    const league = await prisma.league.findFirst({
      where: {
         shortName: {
           equals: leagueShortName,
           mode: 'insensitive', // Add case-insensitive mode
         }
       },
      select: { id: true },
    });

    if (!league) {
      console.error('League not found for shortName:', leagueShortName);
      return NextResponse.json({ error: 'League not found' }, { status: 404 });
    }
    const leagueId = league.id;

    // Get the latest season
    const season = await prisma.season.findFirst({
      where: { isLatest: true },
      select: { id: true }, // Only select ID
    });

    console.log('Found latest season:', season);

    if (!season) {
      return NextResponse.json({ error: 'No active season found' }, { status: 404 });
    }

    // Get the LeagueSeason which links the league and the latest season
    const leagueSeason = await prisma.leagueSeason.findUnique({
      where: {
        leagueId_seasonId: { // Use the @@unique compound index
          leagueId: leagueId,
          seasonId: season.id,
        },
      },
      include: {
        teams: { // Include TeamSeason records linked to this LeagueSeason
          include: {
            // Include the base Team details
            team: {
              include: {
                // Include division if needed later, might be useful
                division: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            // Include TeamManagers for this season
            managers: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    username: true,
                    // Include player/gamertag info for manager if needed
                    // player: { include: { gamertags: { orderBy: { createdAt: 'desc' }, take: 1 } } },
                  },
                },
              },
            },
            // Include players on the roster for this TeamSeason
            players: { // This is PlayerTeamSeason
              include: {
                playerSeason: { // Include the related PlayerSeason
                  include: {
                    // Include the User details directly from PlayerSeason
                    user: {
                      select: {
                        id: true,
                        name: true, // Assuming name is on the User model
                        // Include gamertags relation *from the User*
                        gamertags: {
                          orderBy: { createdAt: 'desc' },
                          take: 1,
                          select: { gamertag: true, system: true },
                        }
                      }
                    },
                    contract: true, // Include contract details
                    // Also include position fields if needed by frontend
                    // primaryPosition: true,
                    // positionGroup: true,
                  },
                },
                // Include stats from PlayerTeamSeason (Assuming these exist)
                // If not, they need to be added to the schema or fetched differently
                // For example:
                // gamesPlayed: true,
                // goals: true,
                // assists: true,
              },
            },
          },
        },
      },
    });

    console.log('Found LeagueSeason:', {
      id: leagueSeason?.id,
      leagueId: leagueSeason?.leagueId,
      seasonId: leagueSeason?.seasonId,
      teamCount: leagueSeason?.teams?.length,
    });

    if (!leagueSeason) {
      return NextResponse.json({ error: 'League season data not found' }, { status: 404 });
    }

    // No need to filter with hardcoded lists anymore.
    // The query fetches teams directly associated with the LeagueSeason.
    // Team names come from `team.fullTeamName`.

    // Transform the fetched TeamSeason data
    const teams = leagueSeason.teams.map((teamSeason) => ({
      // TeamSeason basic stats (Assuming these fields exist on TeamSeason model)
      // If not, they need to be added to the schema or calculated differently
      id: teamSeason.id, // Add TeamSeason ID if needed
      wins: teamSeason.wins || 0,
      losses: teamSeason.losses || 0,
      otLosses: teamSeason.otLosses || 0,
      forwardCount: teamSeason.forwardCount,
      defenseCount: teamSeason.defenseCount,
      goalieCount: teamSeason.goalieCount,

      // Include salary cap from LeagueSeason
      salaryCap: leagueSeason.salaryCap,

      // Team details from related Team model
      team: {
        id: teamSeason.team.id,
        fullTeamName: teamSeason.team.fullTeamName, // Use fullTeamName from DB
        teamAbbreviation: teamSeason.team.teamAbbreviation,
        logoPath: teamSeason.team.logoPath,
        primaryColor: teamSeason.team.primaryColor,
        secondaryColor: teamSeason.team.secondaryColor,
        division: teamSeason.team.division ? {
          id: teamSeason.team.division.id,
          name: teamSeason.team.division.name,
        } : null,
        // We don't include managers here as they are per-season now
      },

      // Map managers for this season
      managers: teamSeason.managers.map(manager => ({
        role: manager.role,
        user: {
          id: manager.user.id,
          name: manager.user.name,
          username: manager.user.username,
          email: manager.user.email,
          // gamertag: manager.user.player?.gamertags[0]?.gamertag // Example if manager gamertag needed
        }
      })),

      // Map players (PlayerTeamSeason records)
      players: teamSeason.players.map((playerTeamSeason) => ({
        // Include stats from PlayerTeamSeason
        gamesPlayed: playerTeamSeason.gamesPlayed || 0,
        goals: playerTeamSeason.goals || 0,
        assists: playerTeamSeason.assists || 0,
        points: (playerTeamSeason.goals || 0) + (playerTeamSeason.assists || 0),
        plusMinus: playerTeamSeason.plusMinus || 0,
        goalsAgainst: playerTeamSeason.goalsAgainst || 0,
        saves: playerTeamSeason.saves || 0,

        // Include details from the related PlayerSeason
        playerSeason: {
          id: playerTeamSeason.playerSeason.id,
          position: playerTeamSeason.playerSeason.primaryPosition, // Use position from PlayerSeason
          contract: playerTeamSeason.playerSeason.contract
            ? {
                id: playerTeamSeason.playerSeason.contract.id,
                amount: playerTeamSeason.playerSeason.contract.amount,
              }
            : null,
          // User details (associated with this PlayerSeason)
          // Renaming the 'player' key to 'user' for clarity
          user: {
            id: playerTeamSeason.playerSeason.user.id, // User ID
            name: playerTeamSeason.playerSeason.user.name, // User name
            gamertag: playerTeamSeason.playerSeason.user.gamertags[0]
              ? {
                  gamertag: playerTeamSeason.playerSeason.user.gamertags[0].gamertag,
                  system: playerTeamSeason.playerSeason.user.gamertags[0].system,
                }
              : null,
          },
        },
      })),
    }));

    return NextResponse.json({ teams });
  } catch (error) {
    console.error('Failed to fetch league teams:', error);
    // Check for Prisma-specific errors if needed
    // if (error instanceof Prisma.PrismaClientKnownRequestError) { ... }
    return NextResponse.json(
      { error: 'Failed to fetch league teams', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Ensure prisma instance is correctly imported
// import { prisma } from '@/lib/prisma'; should be correct
// Ensure all referenced models and fields exist in your combined schema.
