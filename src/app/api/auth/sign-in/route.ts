import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { sign } from "jsonwebtoken"
import { cookies } from "next/headers"

/**
 * Prisma client instance for database operations
 * @constant
 * @type {PrismaClient}
 */
const prisma = new PrismaClient()

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
    // Parse and validate request body
    const body = await request.json()
    const { email, password, rememberMe } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Return same error for invalid email or password
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Verify password using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Generate JWT with appropriate expiration
    const token = sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: rememberMe ? "30d" : "24h" }
    )

    // Create response with user data (excluding sensitive fields)
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
    })

    // Set secure cookie with JWT
    response.cookies.set("token", token, {
      httpOnly: true, // Prevents JavaScript access
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "lax", // CSRF protection
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 24 hours
      path: "/", // Available across all routes
    })

    return response
  } catch (error) {
    // Log error but don't expose details to client
    console.error("Sign in error:", error)
    return NextResponse.json(
      { error: "An error occurred while signing in" },
      { status: 500 }
    )
  }
} 