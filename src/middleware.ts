import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/profile',
  '/api/upload',
  '/api/users',
];

/**
 * Authentication Middleware
 *
 * Protects specific routes by verifying JWT tokens in cookies.
 * All other routes are public by default.
 *
 * @function
 * @param {NextRequest} request - The incoming request
 * @returns {Promise<NextResponse>} The response or redirect
 *
 * Route Categories:
 * - Protected: Defined in PROTECTED_ROUTES (requires auth)
 * - Auth: Defined in AUTH_ROUTES (redirects if logged in)
 * - Public: Everything else (freely accessible)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = request.cookies.has('token');

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // If it's a protected route and no token exists, redirect to sign-in
  if (isProtectedRoute && !hasToken) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    '/profile/:path*',
    '/api/upload/:path*',
    '/api/users/:path*',
  ],
};
