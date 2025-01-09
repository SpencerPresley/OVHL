import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import crypto from "crypto"
import { sendPasswordResetEmail } from "@/lib/email"

const prisma = new PrismaClient()

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
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    console.log('Looking up user:', email);
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    console.log('User found:', !!user);

    // Always return success to prevent email enumeration
    // But only generate and store token if user exists
    if (user) {
      try {
        // Generate cryptographically secure reset token
        const resetToken = crypto.randomBytes(32).toString("hex")
        const resetTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

        console.log('Updating user with reset token...');
        // Update user with reset token and expiration
        await prisma.user.update({
          where: { email },
          data: {
            resetToken,
            resetTokenExpiresAt,
          },
        })

        // Generate reset link and send email
        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
        console.log('Sending reset email with link:', resetLink);
        const emailResult = await sendPasswordResetEmail(email, resetLink)
        console.log('Email sent result:', emailResult);
      } catch (emailError) {
        console.error('Error in email process:', emailError);
        return NextResponse.json(
          { error: "Failed to send reset email" },
          { status: 500 }
        )
      }
    }

    // Return success regardless of whether user exists
    return NextResponse.json({
      message: "If an account exists with this email, you will receive password reset instructions."
    })
  } catch (error) {
    // Log error but don't expose details to client
    console.error("Password reset error:", error)
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    )
  }
} 