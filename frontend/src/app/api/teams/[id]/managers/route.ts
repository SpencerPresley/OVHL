import { NextResponse } from 'next/server';
import { TeamManagementService } from '@/lib/services/team-management-service';
import { TeamManagementRole } from '@prisma/client';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Get team managers
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: teamId } = params;

    // Authenticate and verify admin status with NextAuth
    await requireAdmin();

    // Find the latest season
    const latestSeason = await prisma.season.findFirst({
      where: { isLatest: true },
      select: { id: true }
    });

    if (!latestSeason) {
      return NextResponse.json({ message: 'No active season found' }, { status: 404 });
    }

    // Find the TeamSeason for this team and latest season
    const teamSeason = await prisma.teamSeason.findFirst({
      where: {
        teamId: teamId,
        leagueSeason: {
          seasonId: latestSeason.id
        }
      },
      select: { id: true }
    });

    if (!teamSeason) {
      // It's possible the team exists but isn't in the latest season
      return NextResponse.json({ managers: [] }); // Return empty array if no TeamSeason found
    }

    // Assuming TeamManagementService.getTeamManagers now takes teamSeasonId
    const managers = await TeamManagementService.getTeamManagers(teamSeason.id);
    return NextResponse.json({ managers });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get team managers';
    console.error('Failed to get team managers:', errorMessage);
    // Handle auth errors specifically
    if (errorMessage === 'Admin privileges required') {
      return NextResponse.json({ message: errorMessage }, { status: 403 });
    }
    if (errorMessage === 'Authentication required') {
      return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

// Add team manager
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // NOTE: params.id (teamId) is no longer directly used for the core logic
    // We rely on teamSeasonId from the body
    await requireAdmin();

    const { userId, role, teamSeasonId } = await request.json();

    // Validate required fields from the body
    if (!userId || !role || !teamSeasonId || !Object.values(TeamManagementRole).includes(role)) {
      return NextResponse.json({ message: 'Invalid request data: userId, role, and teamSeasonId are required' }, { status: 400 });
    }

    // Assuming TeamManagementService.addTeamManager now takes teamSeasonId
    const manager = await TeamManagementService.addTeamManager({
      userId,
      teamSeasonId, // Use teamSeasonId from body
      role,
    });

    return NextResponse.json({ manager });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to add team manager';
    console.error('Failed to add team manager:', errorMessage);
    // Handle auth errors specifically
    if (errorMessage === 'Admin privileges required') {
      return NextResponse.json({ message: errorMessage }, { status: 403 });
    }
    if (errorMessage === 'Authentication required') {
      return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    // Consider specific errors like unique constraint violations
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

// Remove team manager
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // NOTE: params.id (teamId) is no longer directly used for the core logic
    await requireAdmin();

    const { userId, role, teamSeasonId } = await request.json();

    // Validate required fields from the body
    if (!userId || !role || !teamSeasonId || !Object.values(TeamManagementRole).includes(role)) {
      return NextResponse.json({ message: 'Invalid request data: userId, role, and teamSeasonId are required' }, { status: 400 });
    }

    // Assuming TeamManagementService.removeTeamManager now takes teamSeasonId
    await TeamManagementService.removeTeamManager({
      userId,
      teamSeasonId, // Use teamSeasonId from body
      role,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove team manager';
    console.error('Failed to remove team manager:', errorMessage);
    // Handle auth errors specifically
    if (errorMessage === 'Admin privileges required') {
      return NextResponse.json({ message: errorMessage }, { status: 403 });
    }
    if (errorMessage === 'Authentication required') {
      return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
