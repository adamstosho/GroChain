import { ErrorBoundary } from "@/components/error-boundary"
import { ReferralsDashboard } from "@/components/referrals/referrals-dashboard"

export default function ReferralsPage() {
  return (
    <ErrorBoundary>
      <ReferralsDashboard />
    </ErrorBoundary>
  )
}

export const dynamic = 'force-dynamic'
