import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { League, LeagueType } from '@prisma/client';

export const dynamic = 'force-dynamic';

const defaultSalaryCaps: Record<LeagueType, number> = {
  NHL: 45000000,
  AHL: 35000000,
  ECHL: 25000000,
  CHL: 25000000,
};

/**
 * Create New Season API Route
 *
 * Creates a new season, generates LeagueSeason entries for all leagues,
 * and initializes TeamSeason records for all teams within those leagues.
 * Requires admin authentication.
 *
 * Expects { "seasonNumber": number } in the request body.
 *
 * @route POST /api/admin/seasons
 * @returns {Promise<NextResponse>} JSON response with creation status
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication using NextAuth
    await requireAdmin();

    const body = await request.json();
    // Expect seasonNumber (e.g., 1, 2, 3)
    const { seasonNumber } = body; 

    if (typeof seasonNumber !== 'number' || seasonNumber <= 0) {
      return NextResponse.json({ error: 'Valid Season Number (seasonNumber) is required' }, { status: 400 });
    }

    // Use a transaction for atomicity
    const season = await prisma.$transaction(async (tx) => {
      // Set all other seasons to not latest
      await tx.season.updateMany({
        where: { isLatest: true },
        data: { isLatest: false },
      });

      // Create the new season using seasonNumber
      const newSeason = await tx.season.create({
        data: {
          seasonNumber: seasonNumber,
          isLatest: true,
        },
      });

      // Get all leagues
      const allLeagues = await tx.league.findMany();

      // Create LeagueSeason and TeamSeason entries for each league
      for (const league of allLeagues) {
        // Determine salary cap (use default based on type, or a global default)
        const salaryCap = defaultSalaryCaps[league.leagueType] ?? 20000000; // Fallback default

        // Create LeagueSeason
        const leagueSeason = await tx.leagueSeason.create({
          data: {
            leagueId: league.id,
            seasonId: newSeason.id,
            salaryCap: salaryCap,
            // Add other LeagueSeason defaults if necessary
          },
        });

        // Get all teams belonging to this league
        const teamsInLeague = await tx.team.findMany({
          where: { leagueId: league.id },
          select: { id: true }, // Only need team IDs
        });

        // Prepare data for TeamSeason creation
        const teamSeasonData = teamsInLeague.map((team) => ({
          teamId: team.id,
          leagueSeasonId: leagueSeason.id,
          // Initialize only the fields present in the provided schema
          forwardCount: 0, 
          defenseCount: 0,
          goalieCount: 0,
        }));

        // Batch create TeamSeason records if data exists
        if (teamSeasonData.length > 0) {
          await tx.teamSeason.createMany({
            data: teamSeasonData,
          });
        }
      }

      return newSeason; // Return the created season from the transaction
    });

    return NextResponse.json({
      message: `Season ${seasonNumber} created successfully with league/team structures.`, // Updated message
      season, // Return the season object created
    });

  } catch (error) {
    console.error('Failed to create season:', error);

    // Check for potential unique constraint errors (e.g., duplicate seasonNumber)
    if (error instanceof Error && (error as any).code === 'P2002') { // Prisma unique constraint violation code
       // Need to access body again here if needed
       const reqBody = await request.json().catch(() => ({ seasonNumber: 'unknown' })); 
       return NextResponse.json({ error: `Season number ${reqBody.seasonNumber} already exists.` }, { status: 409 });
    }

    // Check for authentication errors
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      if (error.message === 'Admin privileges required') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    }

    // Generic error
    return NextResponse.json({ error: 'Failed to create season' }, { status: 500 });
  }
}
