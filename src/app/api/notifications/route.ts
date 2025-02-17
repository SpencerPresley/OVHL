import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { UserService } from '@/lib/services/user-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verify(token.value, process.env.JWT_SECRET!) as {
      id: string;
    };

    const notifications = await UserService.getUserNotifications(decoded.id);
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verify(token.value, process.env.JWT_SECRET!) as {
      id: string;
      isAdmin?: boolean;
    };

    // Only admins can create notifications
    if (!decoded.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { userId, type, title, message, link, metadata } = await request.json();

    const notification = await UserService.createNotification({
      userId,
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
