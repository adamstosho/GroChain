import { AIRecommendationSystem } from "@/components/ai/ai-recommendation-system"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAuth } from "@/lib/auth-context"

export default function AIRecommendationsPage() {
  return (
    <div className="container mx-auto py-6">
      <AIRecommendationSystem />
    </div>
  )
}
