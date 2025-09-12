"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, Package, Truck, Clock, MapPin, Phone, Mail, ArrowRight, ShoppingBag, Eye, Home, XCircle, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "@/lib/api"
import { usePaymentVerification } from "@/hooks/use-payment-verification"
import Link from "next/link"
import Image from "next/image"

interface OrderItem {
  listing: {
    _id: string
    cropName: string
    images?: string[]
    farmer: {
      name: string
      email: string
    }
  }
  quantity: number
  price: number
  unit: string
  total: number
}

interface Order {
  _id: string
  buyer: {
    name: string
    email: string
  }
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  status: string
  paymentStatus: string
  paymentMethod: string
  shippingAddress: {
    street: string
    city: string
    state: string
    country: string
    phone: string
  }
  orderNumber: string
  createdAt: string
  estimatedDelivery?: string
}

export default function OrderSuccessPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(10)

  const orderId = params.orderId as string
  const paymentMethod = searchParams.get('payment_method') || 'paystack'

  // Payment verification hook
  const { 
    isVerifying, 
    isVerified, 
    error: verificationError, 
    verifyPayment 
  } = usePaymentVerification({
    reference: order?.paymentReference || '',
    orderId: orderId,
    autoVerify: true,
    verifyInterval: 3000
  })

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return

      try {
        setLoading(true)
        console.log('📦 Fetching order details for success page:', orderId)

        const response = await apiService.getOrder(orderId)

        if (response && response.status === 'success' && response.data) {
          setOrder(response.data)
          console.log('✅ Order details loaded for success page:', response.data)

          // Start countdown for auto-redirect
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer)
                return 0
              }
              return prev - 1
            })
          }, 1000)

          return () => clearInterval(timer)
        } else {
          throw new Error(response?.message || 'Failed to fetch order details')
        }
      } catch (error: any) {
        console.error('❌ Failed to fetch order details:', error)
        setError(error.message || 'Failed to load order details')
        toast({
          title: "Failed to load order",
          description: error.message || "Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId, toast])

  // Trigger payment verification when order is loaded and has payment reference
  useEffect(() => {
    if (order && order.paymentReference && !isVerified && !isVerifying) {
      console.log('🔄 Triggering payment verification for order:', order._id)
      verifyPayment()
    }
  }, [order, isVerified, isVerifying, verifyPayment])

  // Auto-redirect after countdown (disabled for bank transfer)
  useEffect(() => {
    if (countdown === 0 && order && paymentMethod !== 'bank_transfer') {
      router.push(`/dashboard/orders/${orderId}`)
    }
  }, [countdown, order, orderId, router, paymentMethod])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your order confirmation...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <XCircle className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Unable to load order</h2>
            <p className="text-gray-600">{error || 'Order not found'}</p>
          </div>
          <Button asChild>
            <Link href="/marketplace">Return to Marketplace</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            {paymentMethod === 'bank_transfer' ? (
              <CreditCard className="h-12 w-12 text-green-600" />
            ) : paymentMethod === 'cash' ? (
              <Package className="h-12 w-12 text-green-600" />
            ) : (
              <CheckCircle className="h-12 w-12 text-green-600" />
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {paymentMethod === 'bank_transfer'
              ? 'Order Created Successfully! 🎉'
              : paymentMethod === 'cash'
              ? 'Order Confirmed! 🎉'
              : 'Payment Successful! 🎉'
            }
          </h1>

          <p className="text-lg text-gray-600 mb-4">
            {paymentMethod === 'bank_transfer'
              ? 'Your order has been created. Please complete your bank transfer to process the payment.'
              : paymentMethod === 'cash'
              ? 'Your order has been confirmed. You will pay cash upon delivery.'
              : 'Thank you for your purchase! Your payment has been processed successfully.'
            }
          </p>

          {paymentMethod === 'bank_transfer' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800 font-medium">⚠️ Payment Pending</p>
              <p className="text-sm text-yellow-700">
                Please make your bank transfer to complete the order. Include order number in payment reference.
              </p>
            </div>
          )}

          {/* Payment Verification Status */}
          {paymentMethod === 'paystack' && order?.paymentReference && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              {isVerifying && (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-blue-800 font-medium">Verifying payment...</p>
                </div>
              )}
              {isVerified && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-800 font-medium">✅ Payment verified successfully!</p>
                </div>
              )}
              {verificationError && (
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-800 font-medium">❌ Payment verification failed</p>
                </div>
              )}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
            <p className="text-sm text-blue-800">
              <strong>Order #{order.orderNumber}</strong> • Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="relative h-16 w-16 rounded overflow-hidden bg-gray-200">
                      <Image
                        src={item.listing.images?.[0] || "/placeholder.svg?height=64&width=64&query=agricultural product"}
                        alt={item.listing.cropName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.listing.cropName}</h4>
                      <p className="text-sm text-gray-600">by {item.listing.farmer.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity} {item.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₦{item.total.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">₦{item.price.toLocaleString()}/{item.unit}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Order Totals */}
              <div className="space-y-2 pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₦{order.subtotal.toLocaleString()}</span>
                </div>
                {order.shipping > 0 && (
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>₦{order.shipping.toLocaleString()}</span>
                  </div>
                )}
                {order.shipping === 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 font-medium">Shipping</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">VAT (7.5% - Nigerian Govt Tax)</span>
                  <span>₦{order.tax.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₦{order.total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Delivery Address
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-medium">{order.shippingAddress.street}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Delivery Timeline
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {order.status === 'paid' ? 'Processing' : order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Estimated delivery: {order.estimatedDelivery
                        ? new Date(order.estimatedDelivery).toLocaleDateString()
                        : '3-5 business days'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className={paymentMethod === 'bank_transfer' ? "bg-yellow-50 border-yellow-200" : "bg-blue-50 border-blue-200"}>
            <CardHeader>
              <CardTitle className={paymentMethod === 'bank_transfer' ? "text-yellow-900" : "text-blue-900"}>
                What's Next?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentMethod === 'bank_transfer' ? (
                  <>
                    <div className="flex items-start gap-3">
                      <CreditCard className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-900">Complete Bank Transfer</p>
                        <p className="text-sm text-yellow-700">Make your bank transfer using the order number as reference.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-900">Payment Verification</p>
                        <p className="text-sm text-yellow-700">We'll verify your payment and process your order within 24 hours.</p>
                      </div>
                    </div>
                  </>
                ) : paymentMethod === 'cash' ? (
                  <>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">Order Processing</p>
                        <p className="text-sm text-blue-700">Your order is being processed and prepared for shipment.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Package className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">Cash on Delivery</p>
                        <p className="text-sm text-blue-700">You'll pay cash when your order is delivered to your address.</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">Order Processing</p>
                        <p className="text-sm text-blue-700">Your order is being processed and prepared for shipment.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">Shipping Updates</p>
                        <p className="text-sm text-blue-700">You'll receive email and SMS updates about your shipment status.</p>
                      </div>
                    </div>
                  </>
                )}
                <div className="flex items-start gap-3">
                  <Truck className={`h-5 w-5 mt-0.5 ${paymentMethod === 'bank_transfer' ? 'text-yellow-600' : 'text-blue-600'}`} />
                  <div>
                    <p className={`font-medium ${paymentMethod === 'bank_transfer' ? 'text-yellow-900' : 'text-blue-900'}`}>Delivery</p>
                    <p className={`text-sm ${paymentMethod === 'bank_transfer' ? 'text-yellow-700' : 'text-blue-700'}`}>
                      Your order will be delivered to the address provided.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auto-redirect Notice */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="text-center">
                {paymentMethod === 'bank_transfer' ? (
                  <>
                    <p className="text-yellow-800 mb-2">
                      Please complete your bank transfer to process the order
                    </p>
                    <p className="text-sm text-yellow-700">
                      You can view payment instructions in your order details.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-yellow-800 mb-2">
                      Auto-redirecting to order details in <strong>{countdown}</strong> seconds...
                    </p>
                    <p className="text-sm text-yellow-700">
                      Or click the button below to view your order details now.
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bank Transfer Instructions */}
          {paymentMethod === 'bank_transfer' && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Bank Transfer Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-600 mb-2"><strong>Bank Details:</strong></p>
                    <div className="text-sm space-y-1">
                      <p><strong>Bank:</strong> Access Bank</p>
                      <p><strong>Account Name:</strong> GroChain Nigeria Ltd</p>
                      <p><strong>Account Number:</strong> 0123456789</p>
                      <p><strong>Reference:</strong> {order.orderNumber}</p>
                    </div>
                  </div>
                  <p className="text-sm text-blue-800">
                    ⚠️ <strong>Important:</strong> Please include the order number ({order.orderNumber}) in your payment reference for faster processing.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {paymentMethod === 'bank_transfer' ? (
              <>
                <Button asChild size="lg" className="flex items-center gap-2">
                  <Link href={`/dashboard/orders/${orderId}`}>
                    <Eye className="h-4 w-4" />
                    View Full Order Details
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="flex items-center gap-2">
                  <Link href="/dashboard">
                    <Home className="h-4 w-4" />
                    Go to Dashboard
                  </Link>
                </Button>
              </>
            ) : paymentMethod === 'cash' ? (
              <>
                <Button asChild size="lg" className="flex items-center gap-2">
                  <Link href={`/dashboard/orders/${orderId}`}>
                    <Eye className="h-4 w-4" />
                    Track Order
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="flex items-center gap-2">
                  <Link href="/marketplace">
                    <ShoppingBag className="h-4 w-4" />
                    Continue Shopping
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg" className="flex items-center gap-2">
                  <Link href={`/dashboard/orders/${orderId}`}>
                    <Eye className="h-4 w-4" />
                    View Order Details
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="flex items-center gap-2">
                  <Link href="/marketplace">
                    <ShoppingBag className="h-4 w-4" />
                    Continue Shopping
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="flex items-center gap-2">
                  <Link href="/dashboard">
                    <Home className="h-4 w-4" />
                    Go to Dashboard
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Contact Information */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Need help with your order?</p>
                <div className="flex justify-center gap-4 text-sm">
                  <a href="mailto:support@grochain.com" className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                    <Mail className="h-4 w-4" />
                    support@grochain.com
                  </a>
                  <a href="tel:+2341234567890" className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                    <Phone className="h-4 w-4" />
                    +234 123 456 7890
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
