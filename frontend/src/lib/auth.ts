import { getServerSession as nextAuthGetServerSession } from 'next-auth';
import { AuthOptions } from './auth-options';
import { prisma } from './prisma';
import { cookies, headers } from 'next/headers';

/**
 * Interface for user data returned by auth functions
 */
export interface AuthUser {
  id: string;
  name: string | null;
  isAdmin: boolean;
}

/**
 * A safe wrapper around getServerSession that properly handles cookies and headers
 * for Next.js 14+ compatibility
 */
async function getSessionSafely() {
  try {
    // In Next.js 14, cookies() and headers() are synchronous
    // Just access them directly to get the values
    cookies();
    headers();
    
    // Now call getServerSession
    return nextAuthGetServerSession(AuthOptions);
  } catch (error) {
    console.error('Error in getSessionSafely:', error);
    return null;
  }
}

/**
 * Server auth function that uses NextAuth session
 * @returns User object or null if not authenticated
 */
export async function serverAuth(): Promise<AuthUser | null> {
  try {
    // Use our safe wrapper to get the session
    const session = await getSessionSafely();
    
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

/**
 * Export getSessionSafely for any route that needs direct access to the session
 * This should be used instead of importing getServerSession directly
 */
export { getSessionSafely };
