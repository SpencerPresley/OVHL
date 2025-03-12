import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

/**
 * Forgot Password API Route
 *
 * Handles password reset requests and email delivery.
 *
 * @async
 * @route POST /api/auth/forgot-password
 *
 * @param {Request} request - The incoming HTTP request
 * @param {Object} request.body - The request body
 * @param {string} request.body.email - User's email address
 *
 * @returns {Promise<NextResponse>} JSON response with status
 * @throws {Error} When email sending fails or database operations fail
 *
 * Response Codes:
 * - 200: Reset email sent (or would be sent if email exists)
 * - 400: Missing email
 * - 500: Server error
 *
 * Security Features:
 * - Same response whether email exists or not
 * - Rate limiting (TODO)
 * - Token expiration
 * - Secure token generation
 */
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { email } = data;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log('Looking up user:', email);
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    console.log('User found:', !!user);

    // Always return success message to prevent email enumeration
    const successResponse = NextResponse.json(
      {
        message:
          'If an account exists with this email, you will receive password reset instructions',
      },
      { status: 200 }
    );

    // If no user found, return success message
    if (!user) {
      return successResponse;
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiresAt,
      },
    });

    // Send reset email
    await sendPasswordResetEmail(email, resetToken);

    return successResponse;
  } catch (error) {
    // Log error but don't expose details to client
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
