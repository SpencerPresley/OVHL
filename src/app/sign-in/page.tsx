import { SignInForm } from "@/components/auth/sign-in-form"

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
export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignInForm />
    </div>
  )
} 