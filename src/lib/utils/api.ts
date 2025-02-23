/**
 * Gets the appropriate API URL based on the current environment
 * Uses Next.js built-in NODE_ENV to determine environment
 * @returns The base API URL for the current environment
 */
export function getApiUrl(): string {
  const isDev = process.env.NODE_ENV === 'development';
  return isDev
    ? process.env.NEXT_PUBLIC_API_URL_DEV || 'http://localhost:3000'
    : process.env.NEXT_PUBLIC_API_URL_PROD || '';
}
