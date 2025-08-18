import { ErrorBoundary } from "@/components/error-boundary"
import { LoginForm } from "@/components/auth/login-form"
// Debug components removed for production cleanliness

export default function LoginPage() {
  return (
    <ErrorBoundary>
      <LoginForm />
    </ErrorBoundary>
  )
}
