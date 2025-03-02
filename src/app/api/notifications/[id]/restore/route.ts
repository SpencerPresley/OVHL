import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { UserService } from '@/lib/services/user-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verify(token.value, process.env.JWT_SECRET!) as {
      id: string;
    };

    // Verify the notification belongs to the user
    const notification = await UserService.getNotificationById(params.id);

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    if (notification.userId !== decoded.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updatedNotification = await UserService.restoreNotification(params.id);

    return NextResponse.json({ notification: updatedNotification });
  } catch (error) {
    console.error('Failed to restore notification:', error);
    return NextResponse.json({ error: 'Failed to restore notification' }, { status: 500 });
  }
}
