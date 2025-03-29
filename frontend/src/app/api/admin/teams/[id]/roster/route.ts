import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Admin Team Roster API Route
 *
 * Retrieves detailed roster information for a specific team for the latest season.
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
        league: true, // Include base league info
        seasons: { // Includes TeamSeason records
          where: {
            // Corrected: Filter through leagueSeason -> season
            leagueSeason: {
              season: {
                isLatest: true,
              },
            },
          },
          include: {
            // Include LeagueSeason details instead of non-existent tier
            leagueSeason: {
              include: {
                league: true, // League specific to this season entry
                season: true, // Season details (like number)
              },
            },
            players: { // PlayerTeamSeason records
              include: {
                playerSeason: { // PlayerSeason record
                  include: {
                    player: { // User record for the player
                      include: {
                        gamertags: {
                          orderBy: { createdAt: 'desc' },
                          take: 1,
                        },
                      },
                    },
                    contract: true, // Contract details
                  },
                },
              },
            },
          },
        },
      },
    });

    // Ensure team and its data for the latest season exist
    if (!team || !team.seasons || team.seasons.length === 0) {
       // Check if the team exists at all but just has no season data yet
       const teamExists = await prisma.team.findUnique({ where: { id: params.id }, select: { id: true } });
       if (teamExists) {
           return NextResponse.json({ error: 'Team found, but no roster data available for the latest season.' }, { status: 404 });
       }
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const currentSeason = team.seasons[0]; // Get the TeamSeason for the latest season
    const players = currentSeason.players || []; // Get PlayerTeamSeason records

    // Transform data for the frontend
    const transformedTeam = {
      id: team.id,
      // Corrected field names
      fullTeamName: team.fullTeamName,
      teamAbbreviation: team.teamAbbreviation,
      // Use info from leagueSeason instead of tier
      leagueSeasonInfo: {
        leagueName: currentSeason.leagueSeason.league.name,
        seasonNumber: currentSeason.leagueSeason.season.seasonNumber,
        salaryCap: currentSeason.leagueSeason.salaryCap, 
        teamSeasonId: currentSeason.id, // ID of the TeamSeason record itself
      },
      baseLeague: team.league.name, // The team's primary league affiliation
      roster: {
        forwards: players
          .filter((pts) => ['C', 'LW', 'RW'].includes(pts.playerSeason.primaryPosition)) // Use primaryPosition from PlayerSeason
          .map((pts) => ({
            playerTeamSeasonId: pts.id, // ID for this specific player-team-season link
            playerSeasonId: pts.playerSeason.id,
            name: pts.playerSeason.player.name,
            position: pts.playerSeason.primaryPosition,
            gamertag: pts.playerSeason.player.gamertags[0]?.gamertag || pts.playerSeason.player.name,
            contract: {
              amount: pts.playerSeason.contract?.amount ?? 0, // Handle potentially missing contract
              contractId: pts.playerSeason.contractId,
            },
            // Removed stats object as fields like gamesPlayed, goals are not on PlayerTeamSeason
          })),
        defense: players
          .filter((pts) => ['LD', 'RD'].includes(pts.playerSeason.primaryPosition))
          .map((pts) => ({
            playerTeamSeasonId: pts.id,
            playerSeasonId: pts.playerSeason.id,
            name: pts.playerSeason.player.name,
            position: pts.playerSeason.primaryPosition,
            gamertag: pts.playerSeason.player.gamertags[0]?.gamertag || pts.playerSeason.player.name,
            contract: {
              amount: pts.playerSeason.contract?.amount ?? 0,
              contractId: pts.playerSeason.contractId,
            },
            // Removed stats object
          })),
        goalies: players
          .filter((pts) => pts.playerSeason.primaryPosition === 'G')
          .map((pts) => ({
            playerTeamSeasonId: pts.id,
            playerSeasonId: pts.playerSeason.id,
            name: pts.playerSeason.player.name,
            position: pts.playerSeason.primaryPosition,
            gamertag: pts.playerSeason.player.gamertags[0]?.gamertag || pts.playerSeason.player.name,
            contract: {
              amount: pts.playerSeason.contract?.amount ?? 0,
              contractId: pts.playerSeason.contractId,
            },
            // Removed stats object
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
