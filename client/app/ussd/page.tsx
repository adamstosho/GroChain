import { ErrorBoundary } from "@/components/error-boundary"
import { USSDDashboard } from "@/components/ussd/ussd-dashboard"

export default function USSDPage() {
  return (
    <ErrorBoundary>
      <USSDDashboard />
    </ErrorBoundary>
  )
}

export const dynamic = 'force-dynamic'
