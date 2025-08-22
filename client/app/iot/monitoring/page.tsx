import { Metadata } from "next"
import { ErrorBoundary } from "@/components/error-boundary"
import { IoTMonitoringPage } from "@/components/iot/iot-monitoring-page"

export const metadata: Metadata = {
  title: "IoT Monitoring | GroChain",
  description: "Real-time sensor monitoring and environmental data visualization",
}

export default function IoTMonitoringPageRoute() {
  return (
    <ErrorBoundary>
      <IoTMonitoringPage />
    </ErrorBoundary>
  )
}

export const dynamic = 'force-dynamic'
