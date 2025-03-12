import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signIn } from 'next-auth/react';

// Disable Next.js caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Sign In API Route
 *
 * Handles user authentication by validating credentials and redirecting
 * to NextAuth's signIn flow.
 *
 * @async
 * @route POST /api/auth/sign-in
 *
 * @param {Request} request - The incoming HTTP request
 * @param {Object} request.body - The request body
 * @param {string} request.body.email - User's email address
 * @param {string} request.body.password - User's password
 * @param {boolean} request.body.rememberMe - Whether to extend session duration
 *
 * @returns {Promise<NextResponse>} JSON response with user data
 * @throws {Error} When authentication fails or database operations fail
 *
 * Response Codes:
 * - 200: Success with user data
 * - 400: Missing credentials
 * - 401: Invalid credentials
 * - 500: Server error
 *
 * Security Features:
 * - Passwords compared using bcrypt
 * - Authentication handled by NextAuth
 * - Same error for invalid email/password
 */
export async function POST(request: Request) {
  try {
    console.log('SignInAPI: Starting sign-in process...');
    // Parse and validate request body
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      console.log('SignInAPI: Missing credentials');
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    console.log('SignInAPI: Finding user by email...');
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Return same error for invalid email or password
    if (!user) {
      console.log('SignInAPI: User not found');
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    console.log('SignInAPI: Verifying password...');
    // Verify password using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('SignInAPI: Invalid password');
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    console.log('SignInAPI: Authentication successful');
    
    // Return user information - authentication will be handled by NextAuth
    // Note: This API endpoint should only be used for credential verification
    // The actual sign-in should be performed on the client using NextAuth's signIn function
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        name: user.name,
        username: user.username,
      },
      message: 'Authentication successful. Use NextAuth signIn on the client side to complete the process.'
    });
    
  } catch (error) {
    // Log error but don't expose details to client
    console.error('SignInAPI: Error during sign-in:', error);
    return NextResponse.json({ error: 'An error occurred while signing in' }, { status: 500 });
  }
}
