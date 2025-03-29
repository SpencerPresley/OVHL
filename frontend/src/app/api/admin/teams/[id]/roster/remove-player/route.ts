import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Remove Player from Team Roster API Route
 *
 * Removes a player from a team for the current season and puts them back in bidding.
 * Requires admin authentication.
 *
 * @route POST /api/admin/teams/[id]/roster/remove-player
 * @param {Object} params - Route parameters
 * @param {string} params.id - Team ID
 * @returns {Promise<NextResponse>} JSON response with removal status
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verify admin authentication using NextAuth
    await requireAdmin();

    // Get request body
    const body = await request.json();
    // Expecting playerSeasonId in the body
    const { playerSeasonId } = body; 

    if (!playerSeasonId) {
      return NextResponse.json({ error: 'Player Season ID (playerSeasonId) is required' }, { status: 400 });
    }

    // Start a transaction to handle all updates
    await prisma.$transaction(async (tx) => {
      // 1. Find the relevant TeamSeason for the given team and latest season
      const teamSeason = await tx.teamSeason.findFirst({
        where: {
          teamId: params.id,
          // Corrected path to filter by latest season
          leagueSeason: {
            season: {
              isLatest: true,
            },
          },
        },
        select: { id: true }, // Only need the ID
      });

      if (!teamSeason) {
        throw new Error('Team season not found for the latest season');
      }

      // 2. Get the player season to check position and ensure it exists
      const playerSeason = await tx.playerSeason.findUnique({
        where: { id: playerSeasonId },
        select: { id: true, primaryPosition: true }, // Select necessary fields
      });

      if (!playerSeason) {
        throw new Error('Player season not found');
      }

      // 3. Delete the specific PlayerTeamSeason link
      const deleteResult = await tx.playerTeamSeason.deleteMany({
        where: {
          playerSeasonId: playerSeason.id,
          teamSeasonId: teamSeason.id, // Use the specific TeamSeason ID found
        },
      });

      // Check if a record was actually deleted
      if (deleteResult.count === 0) {
        // This could mean the player wasn't on this team's latest season roster
        throw new Error('Player not found on this team\'s roster for the latest season.');
      }

      // 4. Update player season to be in bidding
      await tx.playerSeason.update({
        where: { id: playerSeason.id },
        data: { isInBidding: true },
      });

      // 5. Update team roster counts using the already found teamSeason.id
      // Corrected position check using primaryPosition
      const isForward = ['C', 'LW', 'RW'].includes(playerSeason.primaryPosition);
      const isDefense = ['LD', 'RD'].includes(playerSeason.primaryPosition);
      const isGoalie = playerSeason.primaryPosition === 'G';

      await tx.teamSeason.update({
        where: { id: teamSeason.id },
        data: {
          forwardCount: isForward ? { decrement: 1 } : undefined,
          defenseCount: isDefense ? { decrement: 1 } : undefined,
          goalieCount: isGoalie ? { decrement: 1 } : undefined,
        },
      });
      
    });

    return NextResponse.json({
      message: 'Player removed from team successfully and placed back into bidding',
    });
  } catch (error) {
    console.error('Failed to remove player from team:', error);

    // Check specific errors like player not found on roster
    if (error instanceof Error && error.message.includes('Player not found on this team')) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }
    // Check other known errors
    if (error instanceof Error) {
        if (error.message === 'Player season not found') {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
        if (error.message === 'Team season not found for the latest season') {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
        if (error.message === 'Authentication required') {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        if (error.message === 'Admin privileges required') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }
    }

    // Generic error for other issues
    return NextResponse.json({ error: 'Failed to remove player from team' }, { status: 500 });
  }
}
