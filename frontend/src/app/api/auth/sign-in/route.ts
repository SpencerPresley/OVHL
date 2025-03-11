import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

// Disable Next.js caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Prisma client instance for database operations
 * @constant
 * @type {PrismaClient}
 */

/**
 * Sign In API Route
 *
 * Handles user authentication and session management.
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
 * @returns {Promise<NextResponse>} JSON response with user data and session cookie
 * @throws {Error} When authentication fails or database operations fail
 *
 * Response Codes:
 * - 200: Success with user data and JWT cookie
 * - 400: Missing credentials
 * - 401: Invalid credentials
 * - 500: Server error
 *
 * Security Features:
 * - Passwords compared using bcrypt
 * - HTTP-only cookies
 * - HTTPS-only in production
 * - Same error for invalid email/password
 * - Session duration based on rememberMe
 * - CSRF protection via SameSite
 */
export async function POST(request: Request) {
  try {
    console.log('SignInAPI: Starting sign-in process...');
    // Parse and validate request body
    const body = await request.json();
    const { email, password, rememberMe } = body;

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

    console.log('SignInAPI: Generating JWT...');
    // TODO: (JWT) NEEDS TO BE REDONE FOR NEXT AUTH
    // Generate JWT with appropriate expiration
    const token = sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: rememberMe ? '30d' : '24h' }
    );

    console.log('SignInAPI: Creating response with user data...');
    // Create response with user data (excluding sensitive fields)
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });

    console.log('SignInAPI: Setting JWT cookie...');
    // Set secure cookie with JWT
    // TODO: (JWT) NEEDS TO BE REDONE FOR NEXT AUTH
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
      path: '/',
    });

    console.log('SignInAPI: Sign-in successful');
    return response;
  } catch (error) {
    // Log error but don't expose details to client
    console.error('SignInAPI: Error during sign-in:', error);
    return NextResponse.json({ error: 'An error occurred while signing in' }, { status: 500 });
  }
}
