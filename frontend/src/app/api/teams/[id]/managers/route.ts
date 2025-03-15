import { NextResponse } from 'next/server';
import { TeamManagementService } from '@/lib/services/team-management-service';
import { TeamManagementRole } from '@prisma/client';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Get team managers
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: teamId } = params;

    // Authenticate and verify admin status with NextAuth
    await requireAdmin();

    const managers = await TeamManagementService.getTeamManagers(teamId);
    return NextResponse.json({ managers });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get team managers';
    console.error('Failed to get team managers:', errorMessage);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

// Add team manager
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: teamId } = params;

    // Authenticate and verify admin status with NextAuth
    await requireAdmin();

    const { userId, role } = await request.json();

    if (!userId || !role || !Object.values(TeamManagementRole).includes(role)) {
      return NextResponse.json({ message: 'Invalid request data' }, { status: 400 });
    }

    const manager = await TeamManagementService.addTeamManager({
      userId,
      teamId,
      role,
    });

    return NextResponse.json({ manager });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to add team manager';
    console.error('Failed to add team manager:', errorMessage);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

// Remove team manager
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: teamId } = params;

    // Authenticate and verify admin status with NextAuth
    await requireAdmin();

    const { userId, role } = await request.json();

    if (!userId || !role || !Object.values(TeamManagementRole).includes(role)) {
      return NextResponse.json({ message: 'Invalid request data' }, { status: 400 });
    }

    await TeamManagementService.removeTeamManager({
      userId,
      teamId,
      role,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove team manager';
    console.error('Failed to remove team manager:', errorMessage);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
