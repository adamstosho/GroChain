import { HarvestDetail } from "@/components/harvests/harvest-detail"

interface HarvestDetailPageProps {
  params: {
    id: string
  }
}

export default function HarvestDetailPage({ params }: HarvestDetailPageProps) {
  return <HarvestDetail harvestId={params.id} />
}
