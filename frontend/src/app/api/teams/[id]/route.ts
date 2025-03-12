import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Authenticate and verify admin status with NextAuth
    await requireAdmin();

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
