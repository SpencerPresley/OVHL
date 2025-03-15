import { auth as getAuth } from '../../auth';
import { prisma } from './prisma';

/**
 * Interface for user data returned by auth functions
 */
export interface AuthUser {
  id: string;
  name: string | null;
  isAdmin: boolean;
}

/**
 * A wrapper around Auth.js auth() function
 * for compatibility with existing code
 */
async function getSessionSafely() {
  try {
    // Use Auth.js auth() function to get the session
    return getAuth();
  } catch (error) {
    console.error('Error in getSessionSafely:', error);
    return null;
  }
}

/**
 * Server auth function that uses Auth.js session
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
 * This should be used instead of importing auth directly
 */
export { getSessionSafely };
