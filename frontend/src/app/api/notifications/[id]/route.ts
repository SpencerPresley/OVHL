import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// TODO: (JWT) NEEDS TO BE REDONE FOR NEXT AUTH
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // TODO: (JWT) NEEDS TO BE REDONE FOR NEXT AUTH
    const decoded = verify(token.value, process.env.JWT_SECRET!) as {
      id: string;
    };

    // Get params.id safely by awaiting the context
    const { id } = await context.params;

    // Verify the notification belongs to the user
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    if (notification.userId !== decoded.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ notification });
  } catch (error) {
    console.error('Failed to fetch notification:', error);
    return NextResponse.json({ error: 'Failed to fetch notification' }, { status: 500 });
  }
}
