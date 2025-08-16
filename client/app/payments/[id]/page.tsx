import { PaymentStatus } from "@/components/payments/payment-status"

interface PaymentStatusPageProps {
  params: {
    id: string
  }
}

export default function PaymentStatusPage({ params }: PaymentStatusPageProps) {
  return <PaymentStatus paymentId={params.id} />
}
