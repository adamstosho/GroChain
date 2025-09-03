"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, XCircle, Loader2, CreditCard, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "@/lib/api"
import Link from "next/link"

interface VerificationResult {
  status: 'success' | 'failed' | 'pending'
  transaction?: any
  verification?: any
  orderId?: string
  reference?: string
}

export default function PaymentVerificationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reference = searchParams.get('reference')
  const trxref = searchParams.get('trxref') || reference

  useEffect(() => {
    const verifyPayment = async () => {
      if (!trxref) {
        setError('No payment reference provided')
        setLoading(false)
        return
      }

      try {
        console.log('🔍 Verifying payment with reference:', trxref)

        // Try manual verification first
        console.log('🔄 Attempting manual payment verification...')
        const response = await apiService.request(`/api/payments/verify/${trxref}`)

        if (response && response.status === 'success') {
          console.log('✅ Payment verification successful:', response.data)

          // Check if we have order information
          const transaction = response.data?.transaction
          const orderId = transaction?.orderId || transaction?.metadata?.order_id

          setVerificationResult({
            status: 'success',
            transaction: transaction,
            verification: response.data?.verification,
            orderId: orderId,
            reference: trxref
          })

          toast({
            title: "Payment Successful!",
            description: "Your payment has been processed successfully.",
          })

          // Redirect to order details after a short delay
          setTimeout(() => {
            if (orderId) {
              router.push(`/dashboard/orders/${orderId}`)
            } else {
              router.push('/dashboard/orders')
            }
          }, 3000)

        } else {
          // If manual verification fails, try to check if webhook already processed it
          console.log('⚠️ Manual verification failed, checking if webhook processed it...')

          // Try to fetch the order directly to see if it was updated by webhook
          try {
            // We'll need to get the order ID from somewhere - let's try a different approach
            // For now, we'll show a message that payment is being processed
            setVerificationResult({
              status: 'pending',
              reference: trxref
            })

            toast({
              title: "Payment Processing",
              description: "Your payment is being processed. Please wait...",
            })

            // Check again after a delay
            setTimeout(async () => {
              try {
                const retryResponse = await apiService.request(`/api/payments/verify/${trxref}`)
                if (retryResponse && retryResponse.status === 'success') {
                  const transaction = retryResponse.data?.transaction
                  const orderId = transaction?.orderId || transaction?.metadata?.order_id

                  setVerificationResult({
                    status: 'success',
                    transaction: transaction,
                    verification: retryResponse.data?.verification,
                    orderId: orderId,
                    reference: trxref
                  })

                  toast({
                    title: "Payment Confirmed!",
                    description: "Your payment has been confirmed successfully.",
                  })

                  setTimeout(() => {
                    if (orderId) {
                      router.push(`/dashboard/orders/${orderId}`)
                    } else {
                      router.push('/dashboard/orders')
                    }
                  }, 2000)
                }
              } catch (retryError) {
                console.log('⚠️ Retry also failed, payment might still be processing')
              }
            }, 5000)

          } catch (webhookError) {
            console.error('❌ Webhook check failed:', webhookError)
            throw new Error('Payment verification failed - please contact support')
          }
        }

      } catch (error: any) {
        console.error('❌ Payment verification error:', error)

        setVerificationResult({
          status: 'failed',
          reference: trxref
        })

        setError(error.message || 'Payment verification failed')

        toast({
          title: "Payment Verification Failed",
          description: error.message || "Unable to verify your payment. Please contact support.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [trxref, router, toast])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="text-center py-8">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
            <p className="text-gray-600">
              Please wait while we verify your payment...
            </p>
            {reference && (
              <p className="text-sm text-gray-500 mt-2">
                Reference: {reference}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (verificationResult?.status === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="text-center py-8">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-yellow-500" />
            <h2 className="text-xl font-semibold mb-2 text-yellow-600">Payment Processing</h2>
            <p className="text-gray-600 mb-4">
              Your payment is being processed by our payment provider.
              This may take a few moments...
            </p>
            {reference && (
              <p className="text-sm text-gray-500 mb-4">
                Reference: {reference}
              </p>
            )}
            <p className="text-sm text-gray-500">
              Please wait while we confirm your payment.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || verificationResult?.status === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="text-center py-8">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-red-600">Payment Failed</h2>
            <p className="text-gray-600 mb-4">
              {error || "Your payment could not be processed."}
            </p>
            {reference && (
              <p className="text-sm text-gray-500 mb-4">
                Reference: {reference}
              </p>
            )}
            <div className="space-y-2">
              <Button onClick={() => window.history.back()} className="w-full">
                Try Again
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/dashboard/orders">
                  View Orders
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (verificationResult?.status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-green-600">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your payment has been processed successfully.
            </p>
            {verificationResult.transaction && (
              <div className="bg-green-50 p-4 rounded-lg mb-4 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Payment Details</span>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Reference:</span>
                    <span className="font-mono">{verificationResult.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span>₦{(verificationResult.transaction.amount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-green-600 font-medium">Paid</span>
                  </div>
                </div>
              </div>
            )}
            {verificationResult.orderId && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Order Information</span>
                </div>
                <p className="text-sm text-blue-800">
                  Your order is being processed. You will receive a confirmation email shortly.
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500 mb-4">
              Redirecting to order details in a few seconds...
            </p>
            <div className="space-y-2">
              {verificationResult.orderId && (
                <Button asChild className="w-full">
                  <Link href={`/dashboard/orders/${verificationResult.orderId}`}>
                    View Order Details
                  </Link>
                </Button>
              )}
              <Button variant="outline" asChild className="w-full">
                <Link href="/dashboard/orders">
                  View All Orders
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="text-center py-8">
          <XCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Verification Error</h2>
          <p className="text-gray-600 mb-4">
            Unable to verify payment status.
          </p>
          <Button onClick={() => router.push('/dashboard/orders')} className="w-full">
            View Orders
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
