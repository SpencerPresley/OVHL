import { NextResponse } from 'next/server';
import { UserService } from '@/lib/services/user-service';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Authenticate with NextAuth
    const user = await requireAuth();

    // Verify the notification belongs to the user
    const notification = await UserService.getNotificationById(params.id);

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    if (notification.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updatedNotification = await UserService.restoreNotification(params.id);

    return NextResponse.json({ notification: updatedNotification });
  } catch (error) {
    console.error('Failed to restore notification:', error);
    return NextResponse.json({ error: 'Failed to restore notification' }, { status: 500 });
  }
}
