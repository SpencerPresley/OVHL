import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { Toaster } from "@/components/ui/sonner"

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <ResetPasswordForm />
      <Toaster />
    </div>
  )
} 