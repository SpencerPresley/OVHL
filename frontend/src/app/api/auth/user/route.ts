import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { UserService } from '@/lib/services/user-service';
import { getServerSession } from 'next-auth';
import { AuthOptions } from '@/lib/auth-options';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Try to get NextAuth session first
    const session = await getServerSession(AuthOptions);

    if (session?.user?.id) {
      // User is authenticated with NextAuth
      const user = await UserService.getUserById(session.user.id);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ user });
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

    const user = await UserService.getUserById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    // Try to get NextAuth session first
    const session = await getServerSession(AuthOptions);
    let userId: string;

    if (session?.user?.id) {
      // User is authenticated with NextAuth
      userId = session.user.id;
    } else {
      // Fall back to token-based auth
      const cookieStore = await cookies();
      const token = cookieStore.get('token');

      if (!token) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      const decoded = verify(token.value, process.env.JWT_SECRET!) as {
        id: string;
      };

      userId = decoded.id;
    }

    const data = await request.json();
    const updatedUser = await UserService.updateProfile(userId, data);

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
