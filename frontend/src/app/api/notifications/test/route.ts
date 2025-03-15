import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NotificationType, NotificationStatus } from '@/types/notifications';
import { requireAuth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Authenticate with NextAuth
    const user = await requireAuth();

    const { withLink } = await request.json();

    // Create a test notification for the current user
    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        type: NotificationType.SYSTEM,
        title: withLink ? 'Test Linked Notification' : 'Test Notification',
        message: withLink
          ? 'This is a test notification with a link created at ' + new Date().toLocaleTimeString()
          : 'This is a test notification created at ' + new Date().toLocaleTimeString(),
        status: NotificationStatus.UNREAD,
        link: withLink ? `/notifications/$notificationId` : null,
      },
    });

    // If this is a linked notification, update the link with the actual ID
    if (withLink) {
      await prisma.notification.update({
        where: { id: notification.id },
        data: { link: `/notifications/${notification.id}` },
      });
    }

    // Get all unread notifications for immediate update
    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      notification: withLink
        ? { ...notification, link: `/notifications/${notification.id}` }
        : notification,
      notifications,
    });
  } catch (error) {
    console.error('Failed to create test notification:', error);
    return NextResponse.json({ error: 'Failed to create test notification' }, { status: 500 });
  }
}
