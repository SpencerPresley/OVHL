import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

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
    return NextResponse.json({ error: 'Failed to remove player from team' }, { status: 500 });
  }
}
