import { ErrorBoundary } from "@/components/error-boundary"
import { EmailVerification } from "@/components/auth/email-verification"
import { Suspense } from "react"

export default function VerifyEmailPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div>Loading...</div>}>
        <EmailVerification />
      </Suspense>
    </ErrorBoundary>
  )
}
