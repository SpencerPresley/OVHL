import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Admin Team Update API Route
 * 
 * Updates EA club information for a specific team.
 * Requires admin authentication.
 * 
 * @route PATCH /api/admin/teams/[id]
 * @param {Object} params - Route parameters
 * @param {string} params.id - Team ID
 * @returns {Promise<NextResponse>} JSON response with updated team data
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verify admin authentication using NextAuth
    await requireAdmin();

    const { eaClubId, eaClubName } = await request.json();

    if (!eaClubId || !eaClubName) {
      return NextResponse.json({ error: 'EA Club ID and name are required' }, { status: 400 });
    }

    // Update the team
    const team = await prisma.team.update({
      where: { id: params.id },
      data: {
        eaClubId,
        eaClubName,
      },
    });

    return NextResponse.json({ team });
  } catch (error) {
    console.error('Failed to update team:', error);
    
    // Check if it's an authentication error
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      if (error.message === 'Admin privileges required') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    }
    
    return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
  }
}
