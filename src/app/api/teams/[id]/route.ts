import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { UserService } from '@/lib/services/user-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
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

    // Get the latest season
    const latestSeason = await prisma.season.findFirst({
      where: { isLatest: true },
    });

    if (!latestSeason) {
      return NextResponse.json({ message: 'No active season found' }, { status: 404 });
    }

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        nhlAffiliate: true,
        ahlAffiliate: true,
        seasons: {
          where: {
            tier: {
              seasonId: latestSeason.id,
            },
          },
          include: {
            tier: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
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
                      orderBy: {
                        createdAt: 'desc',
                      },
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

    if (!team) {
      return NextResponse.json({ message: 'Team not found' }, { status: 404 });
    }

    return NextResponse.json({ team });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch team';
    console.error('Failed to fetch team:', errorMessage);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
