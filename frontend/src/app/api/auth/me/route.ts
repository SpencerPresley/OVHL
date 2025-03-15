import { NextResponse } from 'next/server';
import { serverAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Get authenticated user data
 *
 * Returns the current user's basic information or null if not authenticated.
 * Uses NextAuth session for authentication.
 *
 * @route GET /api/auth/me
 * @returns {Promise<NextResponse>} JSON response with user data or null
 */
export async function GET() {
  try {
    // Use our serverAuth helper which handles NextAuth session
    const authUser = await serverAuth();

    if (!authUser) {
      return NextResponse.json({ user: null });
    }

    // Format user response data
    return NextResponse.json({
      user: {
        id: authUser.id,
        name: authUser.name || null,
        isAdmin: authUser.isAdmin,
      },
    });
  } catch (error) {
    console.error('Error checking auth:', error);
    return NextResponse.json({ user: null });
  } finally {
    // Properly disconnect Prisma
    await prisma.$disconnect();
  }
}
