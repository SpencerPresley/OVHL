/**
 * Route configuration for the application
 * Define protected and auth-specific routes here
 */

/**
 * Routes that require authentication
 * @constant
 * @type {string[]}
 */
export const PROTECTED_ROUTES = [
  // Dashboard routes
  "/dashboard",
  "/dashboard/",
  "/dashboard/profile",
  "/dashboard/settings",
  
  // API routes that need protection
  "/api/user",
  "/api/profile",
  
  // Add more protected routes as needed
] as const

/**
 * Authentication-related routes
 * Users will be redirected from these to dashboard if already logged in
 * @constant
 * @type {string[]}
 */
export const AUTH_ROUTES = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
] as const

/**
 * Public API routes that don't require authentication
 * @constant
 * @type {string[]}
 */
export const PUBLIC_API_ROUTES = [
  "/api/auth",
  "/api/public",
] as const

/**
 * Type for route categories
 */
export type RouteCategory = {
  protected: typeof PROTECTED_ROUTES
  auth: typeof AUTH_ROUTES
  publicApi: typeof PUBLIC_API_ROUTES
} 