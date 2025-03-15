'use client';

import { ButtonHTMLAttributes } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface SignOutProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  callbackUrl?: string;
}

/**
 * SignOut Component
 *
 * A button component that triggers Auth.js sign out functionality.
 * Features:
 * - Uses official Auth.js signOut function which handles CSRF tokens
 * - Works reliably even with multiple tabs or after app restart
 *
 * @component
 * @returns {JSX.Element} Rendered sign-out button
 */
export function SignOut({
  className,
  variant = 'default',
  callbackUrl = '/sign-in',
  children = 'Sign Out',
  ...props
}: SignOutProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    // Use the official signOut function which handles CSRF tokens automatically
    await signOut({ callbackUrl, redirect: true });

    // Note: The redirect is handled by signOut when redirect: true
    // so we don't need to manually redirect with window.location.href
  };

  return (
    <Button onClick={handleSignOut} variant={variant} className={className} {...props}>
      {children}
    </Button>
  );
}
