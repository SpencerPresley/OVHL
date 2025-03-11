import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { AuthOptions } from './auth-options';
import { prisma } from './prisma';

/**
 * Verifies a JWT token and returns the associated user
 * @param token JWT token string
 * @returns User object or null if invalid
 */
export async function verifyAuth(token: string) {
  try {
    // TODO: PART OF JWT AUTH THAT NEEDS TO BE REMOVED
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = verify(token, secret) as { id: string };
    if (!decoded?.id) {
      return null;
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        isAdmin: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Error verifying auth:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Interface for user data returned by auth functions
 */
export interface AuthUser {
  id: string;
  name: string | null;
  isAdmin: boolean;
}

/**
 * Comprehensive server auth function that checks both NextAuth and JWT token
 * @returns User object or null if not authenticated
 */
export async function serverAuth(): Promise<AuthUser | null> {
  try {
    // Try NextAuth session first
    const session = await getServerSession(AuthOptions);
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          isAdmin: true,
        },
      });

      if (user) {
        return user;
      }
    }

    // TODO: PART OF JWT AUTH THAT NEEDS TO BE REMOVED
    // Fall back to JWT token auth
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (token?.value) {
      return await verifyAuth(token.value);
    }

    return null;
  } catch (error) {
    console.error('Server auth error:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Checks if user is authenticated, for use in route handlers
 * Throws an error if not authenticated
 * @returns Authenticated user
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await serverAuth();

  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}

/**
 * Checks if user is an admin, for use in route handlers
 * Throws an error if not authenticated or not an admin
 * @returns Authenticated admin user
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await serverAuth();

  if (!user) {
    throw new Error('Authentication required');
  }

  if (!user.isAdmin) {
    throw new Error('Admin privileges required');
  }

  return user;
}
