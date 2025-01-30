import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: { teamId: string } }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verify(token.value, process.env.JWT_SECRET!) as {
      userId: string;
    };

    // Verify admin status
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { eaClubId, eaClubName } = await request.json();

    if (!eaClubId || !eaClubName) {
      return NextResponse.json({ error: 'EA Club ID and name are required' }, { status: 400 });
    }

    // Update the team
    const team = await prisma.team.update({
      where: { id: params.teamId },
      data: {
        eaClubId,
        eaClubName,
      },
    });

    return NextResponse.json({ team });
  } catch (error) {
    console.error('Failed to update team:', error);
    return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
  }
}
