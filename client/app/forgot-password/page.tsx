import { ErrorBoundary } from "@/components/error-boundary"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <ErrorBoundary>
      <ForgotPasswordForm />
    </ErrorBoundary>
  )
}
