import { SignUpForm } from "@/components/auth/sign-up-form";

/**
 * Sign Up Page Component
 *
 * The registration page for new users.
 * Features:
 * - Centered sign-up form
 * - Full-height layout
 * - Responsive design
 *
 * @component
 * @returns {JSX.Element} Rendered sign-up page
 */
export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignUpForm />
    </div>
  );
}
