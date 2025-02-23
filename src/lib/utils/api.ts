/**
 * Gets the appropriate API URL based on the current environment
 * Uses Next.js built-in NODE_ENV to determine environment
 * @returns The base API URL for the current environment
 */
export function getApiUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side: use environment variables or default to localhost
    const isDev = process.env.NODE_ENV === 'development';
    return isDev 
      ? 'http://localhost:3000'
      : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }
  // Client-side: use window.location.origin
  return window.location.origin;
}
