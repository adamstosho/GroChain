import { AIDashboard } from "@/components/ai/ai-dashboard"
import { AdminOrPartner } from "@/components/auth/role-guard"

export default function AIPage() {
  return (
    <AdminOrPartner>
      <AIDashboard />
    </AdminOrPartner>
  )
}
