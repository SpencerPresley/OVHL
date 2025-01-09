import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verify } from "jsonwebtoken"

/**
 * Authentication Middleware
 * 
 * Protects routes by verifying JWT tokens in cookies.
 * 
 * @function
 * @param {NextRequest} request - The incoming request
 * @returns {Promise<NextResponse>} The response or redirect
 * 
 * Protected Routes:
 * - /dashboard/* - All dashboard routes
 * - /api/* - All API routes except auth endpoints
 * 
 * Unprotected Routes:
 * - /sign-in
 * - /sign-up
 * - /forgot-password
 * - /reset-password
 * - /api/auth/*
 */
export async function middleware(request: NextRequest) {
  // Public paths that don't require authentication
  const publicPaths = [
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
  ]

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  // Allow public API routes (auth endpoints)
  const isAuthRoute = request.nextUrl.pathname.startsWith("/api/auth/")

  // Get token from cookies
  const token = request.cookies.get("token")?.value

  // If trying to access public path while logged in,
  // redirect to dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // If trying to access protected route without token,
  // redirect to sign-in
  if (!isPublicPath && !isAuthRoute && !token) {
    const signInUrl = new URL("/sign-in", request.url)
    signInUrl.searchParams.set("from", request.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  // For protected routes, verify the token
  if (!isPublicPath && !isAuthRoute && token) {
    try {
      verify(token, process.env.JWT_SECRET || "")
    } catch (error) {
      // If token is invalid, clear it and redirect to sign-in
      const response = NextResponse.redirect(new URL("/sign-in", request.url))
      response.cookies.delete("token")
      return response
    }
  }

  return NextResponse.next()
}

/**
 * Configure which routes should be handled by this middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
} 