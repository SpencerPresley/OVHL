import { NextResponse } from 'next/server';
import { UserService } from '@/lib/services/user-service';
import { requireAuth, requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Authenticate with NextAuth
    const user = await requireAuth();

    // Get notifications for the authenticated user
    const notifications = await UserService.getUserNotifications(user.id);
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Authenticate and verify admin status with NextAuth
    await requireAdmin();

    const { userId: targetUserId, type, title, message, link, metadata } = await request.json();

    const notification = await UserService.createNotification({
      userId: targetUserId,
      type,
      title,
      message,
      link,
      metadata,
    });

    return NextResponse.json({ notification });
  } catch (error) {
    console.error('Failed to create notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}
