import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('UserAPI: Starting user verification...');
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    console.log('UserAPI: Token present:', !!token);
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('UserAPI: Verifying token...');
    const decoded = verify(token.value, process.env.JWT_SECRET || '') as {
      id?: string;
      email?: string;
      isAdmin?: boolean;
    };

    // Check if token has required fields
    if (!decoded.id || !decoded.email) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    console.log('UserAPI: Finding user...');
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        isAdmin: true,
      },
    });

    console.log('UserAPI: User found:', !!user);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('UserAPI: Returning user data');
    return NextResponse.json({ user });
  } catch (error) {
    console.error('UserAPI: Authentication failed:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}
