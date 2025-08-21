import { Metadata } from "next"
import { FintechDashboard } from "@/components/fintech/fintech-dashboard"

export const metadata: Metadata = {
  title: "Fintech Services | GroChain",
  description: "Access credit scores, loans, and financial services for your farming business",
}

export default function FintechPage() {
  return <FintechDashboard />
}
