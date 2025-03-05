import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { UserService } from '@/lib/services/user-service';
import { getServerSession } from 'next-auth';
import { AuthOptions } from '@/lib/auth-options';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Try to get NextAuth session first
    const session = await getServerSession(AuthOptions);

    if (session?.user?.id) {
      // User is authenticated with NextAuth
      const notifications = await UserService.getUserNotifications(session.user.id);
      return NextResponse.json({ notifications });
    }

    // Fall back to token-based auth if no NextAuth session
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
    // Try to get NextAuth session first
    const session = await getServerSession(AuthOptions);
    let userId: string;
    let isAdmin: boolean = false;

    if (session?.user?.id) {
      // User is authenticated with NextAuth
      userId = session.user.id;
      isAdmin = session.user.isAdmin || false;
    } else {
      // Fall back to token-based auth
      const cookieStore = await cookies();
      const token = cookieStore.get('token');

      if (!token) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      const decoded = verify(token.value, process.env.JWT_SECRET!) as {
        id: string;
        isAdmin?: boolean;
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      userId = decoded.id;
      isAdmin = decoded.isAdmin || false;
    }

    // Only admins can create notifications
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

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
