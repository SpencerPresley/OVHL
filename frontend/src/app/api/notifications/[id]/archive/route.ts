import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, context: { params: { id: string } }) {
  try {
    // Authenticate with NextAuth
    const user = await requireAuth();

    // Get params.id from the context
    const { id } = context.params;

    // Verify the notification belongs to the user
    const notification = await prisma.notification.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    if (notification.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    return NextResponse.json({ notification: updatedNotification });
  } catch (error) {
    console.error('Failed to archive notification:', error);
    return NextResponse.json({ error: 'Failed to archive notification' }, { status: 500 });
  }
}
