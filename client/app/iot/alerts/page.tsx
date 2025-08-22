import { Metadata } from "next"
import { ErrorBoundary } from "@/components/error-boundary"
import { IoTAlertsPage } from "@/components/iot/iot-alerts-page"

export const metadata: Metadata = {
  title: "IoT Alerts | GroChain",
  description: "Manage sensor alerts, notifications, and system warnings",
}

export default function IoTAlertsPageRoute() {
  return (
    <ErrorBoundary>
      <IoTAlertsPage />
    </ErrorBoundary>
  )
}

export const dynamic = 'force-dynamic'
