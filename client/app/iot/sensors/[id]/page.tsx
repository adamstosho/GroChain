import { SensorDetail } from "@/components/iot/sensor-detail"

export default function SensorDetailPage({ params }: { params: { id: string } }) {
  return <SensorDetail sensorId={params.id} />
}

export const dynamic = 'force-dynamic'



