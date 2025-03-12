import { NextResponse } from 'next/server';
import { UserService } from '@/lib/services/user-service';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Authenticate with NextAuth
    const user = await requireAuth();

    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    const updatedUser = await UserService.updateAvatar(user.id, file);
    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Failed to upload avatar:', error);
    return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    // Authenticate with NextAuth
    const user = await requireAuth();

    const updatedUser = await UserService.removeAvatar(user.id);
    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Failed to remove avatar:', error);
    return NextResponse.json({ error: 'Failed to remove avatar' }, { status: 500 });
  }
}
