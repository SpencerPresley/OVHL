'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

/**
 * Auth.js Session Provider
 *
 * This component wraps parts of the application that need access to
 * authentication state on the client side.
 *
 * @param {Object} props - Component properties
 * @param {ReactNode} props.children - Child components
 * @returns {JSX.Element} Session provider component
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
