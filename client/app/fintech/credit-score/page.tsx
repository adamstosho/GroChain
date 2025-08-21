import { Metadata } from "next"
import { CreditScorePage } from "@/components/fintech/credit-score-page"

export const metadata: Metadata = {
  title: "Credit Score | GroChain Fintech",
  description: "View your credit score, factors, and improvement recommendations",
}

export default function CreditScorePageRoute() {
  return <CreditScorePage />
}
