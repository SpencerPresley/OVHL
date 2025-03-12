import { NextResponse } from 'next/server';
import { UserService } from '@/lib/services/user-service';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Authenticate with NextAuth
    const authUser = await requireAuth();

    // Get full user information
    const user = await UserService.getUserById(authUser.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    // Authenticate with NextAuth
    const authUser = await requireAuth();

    const data = await request.json();
    const updatedUser = await UserService.updateProfile(authUser.id, data);

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
