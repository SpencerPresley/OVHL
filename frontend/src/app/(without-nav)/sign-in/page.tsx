import { SignInForm } from '@/components/auth/sign-in-form';
import { auth } from '../../../../auth';
import { redirect } from 'next/navigation';

/**
 * Sign In Page Component
 *
 * The authentication page for existing users.
 * Features:
 * - Centered sign-in form
 * - Full-height layout
 * - Responsive design
 *
 * @component
 * @returns {JSX.Element} Rendered sign-in page
 */
export default async function SignInPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string };
}) {
  // Check if user is already authenticated
  const session = await auth();
  const resolvedSearchParams = await searchParams;

  // If already logged in, redirect to the callback URL or home
  if (session) {
    return redirect(resolvedSearchParams.callbackUrl || '/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignInForm
        callbackUrl={resolvedSearchParams.callbackUrl}
        error={resolvedSearchParams.error}
      />
    </div>
  );
}
