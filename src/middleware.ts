import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Define protected routes that require authentication
 * Route types:
 * - Protected API: Requires token in cookies
 * - Protected Pages: Redirects to sign-in page if no token
 * - Public: Everything else (freely accessible)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check for either token or next-auth session
  const hasToken = request.cookies.has('token');
  const hasNextAuthSession = request.cookies.has('next-auth.session-token') || 
                            request.cookies.has('__Secure-next-auth.session-token');
  const isAuthenticated = hasToken || hasNextAuthSession;

  // Protected API routes
  if (pathname.startsWith('/api/upload') || 
      pathname.startsWith('/api/users') || 
      pathname.startsWith('/api/auth/user') || 
      pathname.startsWith('/api/notifications')) {
    // For protected API routes, require token in cookies
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Protected profile page routes
  if (pathname.startsWith('/profile')) {
    // For protected pages, redirect to sign-in if no token
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }

  // NextAuth admin routes
  if (pathname.startsWith('/api/admin') || pathname.startsWith('/api/bidding/initialize') || pathname.startsWith('/api/bidding/debug')) {
    // Get NextAuth session token
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'dev-secret-123',
    });

    console.log('Middleware check:', pathname);
    console.log('Token exists:', !!token);
    if (token) {
      console.log('Token admin status:', token.isAdmin ? 'Admin' : 'Not Admin');
    }

    // If it's an admin route, check for admin privileges
    if ((pathname.startsWith('/api/admin') || pathname.startsWith('/api/bidding/initialize')) && (!token || token.isAdmin !== true)) {
      console.log('Access denied - not an admin');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // NextAuth admin page routes
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    // For admin pages, redirect to login if not authenticated
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'dev-secret-123',
    });

    if (!token || token.isAdmin !== true) {
      // Redirect to login page
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }

  return NextResponse.next();
}

/**
 * Update the matcher to run middleware only on specific routes
 */
export const config = {
  matcher: [
    '/profile/:path*', 
    '/api/upload/:path*', 
    '/api/users/:path*',
    '/api/auth/user/:path*',
    '/api/notifications/:path*',
    '/admin/:path*', 
    '/api/admin/:path*', 
    '/api/bidding/initialize/:path*', 
    '/api/bidding/debug/:path*',
    '/api/bidding/fix-data/:path*'
  ],
};
