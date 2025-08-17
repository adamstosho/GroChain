import { ErrorBoundary } from "@/components/error-boundary"
import { AdvancedMLDashboard } from "@/components/advanced-ml/advanced-ml-dashboard"

export default function AdvancedMLPage() {
  return (
    <ErrorBoundary>
      <AdvancedMLDashboard />
    </ErrorBoundary>
  )
}

export const dynamic = 'force-dynamic'
