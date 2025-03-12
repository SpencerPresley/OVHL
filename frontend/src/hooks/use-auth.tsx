'use client';

import { useSession } from 'next-auth/react';

/**
 * Custom hook for accessing authentication state in client components
 * 
 * @returns Authentication session and status
 */
export function useAuth() {
  const { data: session, status, update } = useSession();
  
  const isAuthenticated = status === 'authenticated' && !!session;
  const isLoading = status === 'loading';
  const isAdmin = session?.user?.isAdmin === true;
  
  return {
    session,
    status,
    update,
    isAuthenticated,
    isLoading,
    isAdmin,
    user: session?.user || null,
  };
} 