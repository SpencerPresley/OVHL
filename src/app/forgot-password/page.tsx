import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

/**
 * Forgot Password Page Component
 * 
 * The password recovery page for users who need to reset their password.
 * Features:
 * - Centered password reset form
 * - Full-height layout
 * - Responsive design
 * 
 * @component
 * @returns {JSX.Element} Rendered forgot password page
 */
export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <ForgotPasswordForm />
    </div>
  )
} 