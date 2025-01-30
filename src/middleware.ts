import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { PROTECTED_ROUTES, AUTH_ROUTES } from '@/config/routes';

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
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if current path needs protection
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  // Check if current path is an auth page
  const isAuthPage = AUTH_ROUTES.some((path) => pathname.startsWith(path));

  // Get token from cookies
  const token = request.cookies.get('token')?.value;

  // If on auth page and logged in, redirect to dashboard
  if (isAuthPage && token) {
    try {
      verify(token, process.env.JWT_SECRET || '');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      console.error('Token verification error:', error);
      // If token is invalid, let them stay on auth page
      const response = NextResponse.next();
      response.cookies.delete('token');
      return response;
    }
  }

  // If accessing protected route without token, redirect to sign-in
  if (isProtectedRoute && !token) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // For protected routes, verify the token
  if (isProtectedRoute && token) {
    try {
      verify(token, process.env.JWT_SECRET || '');
    } catch (error) {
      // If token is invalid, clear it and redirect to sign-in
      console.error('Token verification error:', error);
      const response = NextResponse.redirect(new URL('/sign-in', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  // All other routes are public
  return NextResponse.next();
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
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
