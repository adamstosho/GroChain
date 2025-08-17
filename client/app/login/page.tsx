import { ErrorBoundary } from "@/components/error-boundary"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <ErrorBoundary>
      <LoginForm />
    </ErrorBoundary>
  )
}
