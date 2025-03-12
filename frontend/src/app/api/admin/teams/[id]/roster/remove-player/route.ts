import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Remove Player from Team Roster API Route
 * 
 * Removes a player from a team and puts them back in bidding.
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
    const { playerId } = body;

    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }

    // Start a transaction to handle all updates
    await prisma.$transaction(async (tx) => {
      // Get the player season
      const playerSeason = await tx.playerSeason.findUnique({
        where: { id: playerId },
      });

      if (!playerSeason) {
        throw new Error('Player season not found');
      }

      // Delete the player team season record
      await tx.playerTeamSeason.deleteMany({
        where: {
          playerSeasonId: playerSeason.id,
          teamSeason: {
            teamId: params.id,
          },
        },
      });

      // Update player season to be in bidding
      await tx.playerSeason.update({
        where: { id: playerSeason.id },
        data: { isInBidding: true },
      });

      // Update team roster counts
      const teamSeason = await tx.teamSeason.findFirst({
        where: {
          teamId: params.id,
          tier: {
            season: {
              isLatest: true,
            },
          },
        },
      });

      if (teamSeason) {
        const isForward = ['C', 'LW', 'RW'].includes(playerSeason.position);
        const isDefense = ['LD', 'RD'].includes(playerSeason.position);
        const isGoalie = playerSeason.position === 'G';

        await tx.teamSeason.update({
          where: { id: teamSeason.id },
          data: {
            forwardCount: isForward ? { decrement: 1 } : undefined,
            defenseCount: isDefense ? { decrement: 1 } : undefined,
            goalieCount: isGoalie ? { decrement: 1 } : undefined,
          },
        });
      }
    });

    return NextResponse.json({
      message: 'Player removed from team successfully',
    });
  } catch (error) {
    console.error('Failed to remove player from team:', error);
    
    // Check if it's an authentication error
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      if (error.message === 'Admin privileges required') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    }
    
    return NextResponse.json({ error: 'Failed to remove player from team' }, { status: 500 });
  }
}
