import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// TODO: (JWT) NEEDS TO BE REDONE FOR NEXT AUTH
import { verify } from 'jsonwebtoken';
import { getServerSession } from 'next-auth';
import { AuthOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // First try NextAuth session
    const session = await getServerSession(AuthOptions);

    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          username: true,
          isAdmin: true,
        },
      });

      if (user) {
        return NextResponse.json({
          user: {
            id: user.id,
            name: user.name || user.username,
            username: user.username,
            isAdmin: user.isAdmin,
          },
        });
      }
    }

    // Fall back to JWT token if no valid NextAuth session
    // TODO: (JWT) NEEDS TO BE REDONE FOR NEXT AUTH
    const cookieStore = await cookies();
    const token = await cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ user: null });
    }

    // Check token validity
    try {
      const decoded = verify(token.value, process.env.JWT_SECRET!) as { id: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          username: true,
          isAdmin: true,
        },
      });

      if (!user) {
        return NextResponse.json({ user: null });
      }

      return NextResponse.json({
        user: {
          id: user.id,
          name: user.name || user.username,
          username: user.username,
          isAdmin: user.isAdmin,
        },
      });
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError);
      return NextResponse.json({ user: null });
    }
  } catch (error) {
    console.error('Error checking auth:', error);
    return NextResponse.json({ user: null });
  } finally {
    // Properly disconnect Prisma
    await prisma.$disconnect();
  }
}
