import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { UserService } from '@/lib/services/user-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const decoded = verify(token.value, process.env.JWT_SECRET!) as {
      id: string;
    };

    // Check if user is an admin
    const isAdmin = await UserService.isAdmin(decoded.id);
    if (!isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    // Get search query
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json({ message: 'Team ID is required' }, { status: 400 });
    }

    // Get the latest season
    const latestSeason = await prisma.season.findFirst({
      where: { isLatest: true },
    });

    if (!latestSeason) {
      return NextResponse.json({ message: 'No active season found' }, { status: 404 });
    }

    // Get all players from the team in the current season
    const teamSeason = await prisma.teamSeason.findFirst({
      where: {
        teamId,
        tier: {
          seasonId: latestSeason.id,
        },
      },
      include: {
        players: {
          include: {
            playerSeason: {
              include: {
                player: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                        username: true,
                      },
                    },
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
    });

    if (!teamSeason) {
      return NextResponse.json({ message: 'Team not found in current season' }, { status: 404 });
    }

    // Transform the data to match the expected format and filter by search query if provided
    const users = teamSeason.players
      .map((playerTeamSeason) => ({
        id: playerTeamSeason.playerSeason.player.user.id,
        name: playerTeamSeason.playerSeason.player.user.name,
        email: playerTeamSeason.playerSeason.player.user.email,
        username: playerTeamSeason.playerSeason.player.user.username,
        player: {
          id: playerTeamSeason.playerSeason.player.id,
          gamertags: playerTeamSeason.playerSeason.player.gamertags,
        },
      }))
      .filter((user) => {
        if (!query) return true;
        const searchStr = query.toLowerCase();
        return (
          user.name?.toLowerCase().includes(searchStr) ||
          user.email.toLowerCase().includes(searchStr) ||
          user.username?.toLowerCase().includes(searchStr) ||
          user.player.gamertags[0]?.gamertag.toLowerCase().includes(searchStr)
        );
      });

    return NextResponse.json({ users });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to search users';
    console.error('Failed to search users:', errorMessage);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
