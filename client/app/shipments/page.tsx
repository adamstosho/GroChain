import { ErrorBoundary } from "@/components/error-boundary"
import { ShipmentsDashboard } from "@/components/shipments/shipments-dashboard"

export default function ShipmentsPage() {
  return (
    <ErrorBoundary>
      <ShipmentsDashboard />
    </ErrorBoundary>
  )
}

export const dynamic = 'force-dynamic'
