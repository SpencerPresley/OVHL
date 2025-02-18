import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { TeamManagementService } from '@/lib/services/team-management-service';
import { UserService } from '@/lib/services/user-service';
import { TeamManagementRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Get team managers
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: teamId } = await params;
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

    const managers = await TeamManagementService.getTeamManagers(teamId);
    return NextResponse.json({ managers });
  } catch (error: any) {
    console.error('Failed to get team managers:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to get team managers' },
      { status: 500 }
    );
  }
}

// Add team manager
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: teamId } = params;
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
  } catch (error: any) {
    console.error('Failed to add team manager:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to add team manager' },
      { status: 500 }
    );
  }
}

// Remove team manager
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: teamId } = params;
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
  } catch (error: any) {
    console.error('Failed to remove team manager:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to remove team manager' },
      { status: 500 }
    );
  }
} 
