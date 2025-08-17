import { ErrorBoundary } from "@/components/error-boundary"
import { GoogleAuthCallback } from "@/components/auth/social-login"

export default function GoogleCallbackPage() {
  return (
    <ErrorBoundary>
      <GoogleAuthCallback />
    </ErrorBoundary>
  )
}
