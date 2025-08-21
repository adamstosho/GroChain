import { Metadata } from "next"
import { LoanApplicationForm } from "@/components/fintech/loan-application-form"

export const metadata: Metadata = {
  title: "Apply for Loan | GroChain Fintech",
  description: "Apply for agricultural loans and financial assistance for your farming business",
}

export default function ApplyLoanPage() {
  return <LoanApplicationForm />
}
