'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';

/**
 * Auth Session Provider Component
 * 
 * This component provides authentication session context to the application.
 * It wraps the application in the Next-Auth SessionProvider to enable
 * authentication features throughout the component tree.
 * 
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children Child components
 * @returns {JSX.Element} The wrapped children with session context
 */
export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
