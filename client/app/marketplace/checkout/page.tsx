"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useBuyerStore } from "@/hooks/use-buyer-store"
import { useAuthStore } from "@/lib/auth"
import { ArrowLeft, CreditCard, MapPin, Phone, Mail, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "@/lib/api"
import { processOrderPayment, loadPaystackScript } from "@/lib/paystack"
import Link from "next/link"
import Image from "next/image"

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { cart, createOrder, clearCart, initializeCart } = useBuyerStore()
  const { user } = useAuthStore()

  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("paystack")
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    notes: "",
  })
  const [mounted, setMounted] = useState(false)

  // Handle hydration and cart initialization
  useEffect(() => {
    setMounted(true)
    // Initialize cart from localStorage after hydration
    initializeCart()

    // Check if user is authenticated
    const token = localStorage.getItem('grochain_auth_token')
    if (!token || token === 'undefined') {
      console.log('⚠️ No authentication token found - redirecting to login')
      toast({
        title: "Authentication Required",
        description: "Please log in to place an order.",
        variant: "destructive",
      })
      router.push('/login?redirect=/marketplace/checkout')
    }
  }, [initializeCart, router, toast])

  // Pre-fill email when user data is available
  useEffect(() => {
    if (user?.email && mounted) {
      setShippingInfo(prev => ({
        ...prev,
        email: user.email
      }))
    }
  }, [user?.email, mounted])

  // Ensure Paystack script is loaded
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      console.log('🔄 Checkout page mounted, loading Paystack script...')
      loadPaystackScript()
        .then(() => {
          console.log('✅ Paystack script loaded successfully in checkout')
        })
        .catch(error => {
          console.warn('⚠️ Paystack script loading failed:', error.message)
        })
    }
  }, [mounted])

  // Redirect if cart is empty (only on client after mount)
  useEffect(() => {
    if (mounted && cart.length === 0) {
      router.push('/marketplace')
    }
  }, [cart, router, mounted])

  const handleInputChange = (field: string, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }))
  }

  const handlePlaceOrder = async () => {
    try {
      setProcessing(true)

      // Validate cart data
      if (!cart || cart.length === 0) {
        throw new Error('Your cart is empty. Please add items before checkout.')
      }

      // Validate cart items have required fields
      for (const item of cart) {
        if (!item.listingId && !item.id) {
          throw new Error('Some cart items are missing required information. Please refresh and try again.')
        }
        if (!item.quantity || item.quantity <= 0) {
          throw new Error('Invalid quantity in cart. Please check your items.')
        }
        if (!item.price || item.price <= 0) {
          throw new Error('Invalid price in cart. Please refresh and try again.')
        }
      }

      // Validate required shipping information
      if (!shippingInfo.fullName || !shippingInfo.phone ||
          !shippingInfo.address || !shippingInfo.city || !shippingInfo.state) {
        throw new Error('Please fill in all required shipping information fields.')
      }

      // Validate phone format (basic validation for Nigerian numbers)
      const phoneRegex = /^(\+234|0)[789]\d{9}$/
      if (!phoneRegex.test(shippingInfo.phone)) {
        throw new Error('Please enter a valid Nigerian phone number.')
      }

      // Handle different payment methods
      if (paymentMethod === 'paystack') {
        await handlePaystackPayment()
      } else if (paymentMethod === 'bank_transfer') {
        await handleBankTransferOrder()
      } else if (paymentMethod === 'cash') {
        await handleCashOnDeliveryOrder()
      } else {
        throw new Error('Please select a valid payment method.')
      }

    } catch (error: any) {
      console.error("Failed to place order:", error)
      toast({
        title: "Failed to place order",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handlePaystackPayment = async () => {
    try {
      // First, create the order
      const orderData = {
        items: cart.map((item) => ({
          listing: item.listingId || item.id,
          quantity: item.quantity,
          price: item.price,
          unit: item.unit
        })),
        shippingAddress: {
          street: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          country: "Nigeria",
          phone: shippingInfo.phone
        },
        deliveryInstructions: shippingInfo.notes,
        paymentMethod: paymentMethod,
        notes: shippingInfo.notes
      }

      console.log('🛒 Creating order before payment...')
      console.log('📤 Order data:', orderData)
      console.log('📡 API call to:', 'http://localhost:5000/api/marketplace/orders')

      const orderResponse = await apiService.createOrder(orderData)
      console.log('📥 Order creation response:', orderResponse)

      if (!orderResponse || orderResponse.status !== 'success' || !orderResponse.data) {
        throw new Error(orderResponse?.message || 'Failed to create order')
      }

      const order = orderResponse.data
      console.log('✅ Order created:', order._id)

      // Now initialize Paystack payment
      console.log('💳 Initializing Paystack payment...')

      const paymentResult = await processOrderPayment(
        order._id,
        total, // Use the calculated total
        shippingInfo.email,
        // Success callback
        async (response) => {
          console.log('✅ Payment successful:', response)

          toast({
            title: "Payment successful!",
            description: "Your payment has been processed. Redirecting to order details...",
          })

          // Clear cart after successful payment
          clearCart()

          // Redirect to order details
          setTimeout(() => {
            router.push(`/dashboard/orders/${order._id}`)
          }, 2000)
        },
        // Close callback
        () => {
          console.log('❌ Payment cancelled by user')
          toast({
            title: "Payment cancelled",
            description: "You cancelled the payment. Your order has been saved and you can pay later.",
            variant: "destructive",
          })
        }
      )

      // Handle payment result
      if (paymentResult.status === 'cancelled') {
        console.log('Payment was cancelled')
      } else if (paymentResult.status === 'failed') {
        throw new Error('Payment failed. Please try again.')
      }

    } catch (error: any) {
      console.error('❌ Paystack payment error:', error)
      throw error
    }
  }

  const handleBankTransferOrder = async () => {
    // Create order for bank transfer
    const orderData = {
      items: cart.map((item) => ({
        listing: item.listingId || item.id,
        quantity: item.quantity,
        price: item.price,
        unit: item.unit
      })),
      shippingAddress: {
        street: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        country: "Nigeria",
        phone: shippingInfo.phone
      },
      deliveryInstructions: shippingInfo.notes,
      paymentMethod: paymentMethod,
      notes: shippingInfo.notes
    }

    const response = await apiService.createOrder(orderData)

    if (response && response.status === 'success' && response.data) {
      toast({
        title: "Order created successfully!",
        description: "Please make bank transfer to the provided account details. Your order will be processed once payment is confirmed.",
      })

      // Clear cart after successful order creation
      clearCart()

      // Redirect to order details with bank transfer instructions
      router.push(`/dashboard/orders/${response.data._id}?payment_method=bank_transfer`)
    } else {
      throw new Error(response?.message || 'Failed to create order')
    }
  }

  const handleCashOnDeliveryOrder = async () => {
    // Create order for cash on delivery
    const orderData = {
      items: cart.map((item) => ({
        listing: item.listingId || item.id,
        quantity: item.quantity,
        price: item.price,
        unit: item.unit
      })),
      shippingAddress: {
        street: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        country: "Nigeria",
        phone: shippingInfo.phone
      },
      deliveryInstructions: shippingInfo.notes,
      paymentMethod: paymentMethod,
      notes: shippingInfo.notes
    }

    const response = await apiService.createOrder(orderData)

    if (response && response.status === 'success' && response.data) {
      toast({
        title: "Order created successfully!",
        description: "You will pay cash upon delivery. Your order will be processed shortly.",
      })

      // Clear cart after successful order creation
      clearCart()

      // Redirect to order details
      router.push(`/dashboard/orders/${response.data._id}`)
    } else {
      throw new Error(response?.message || 'Failed to create order')
    }
  }

  // Calculate totals (matching backend calculations)
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = subtotal > 5000 ? 0 : 500 // Free shipping over ₦5,000
  const tax = Math.round(subtotal * 0.075) // 7.5% VAT
  const total = subtotal + shipping + tax

  // Show loading state only after component has mounted and cart is empty
  if (mounted && cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50" suppressHydrationWarning>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show loading skeleton during hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50" suppressHydrationWarning>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50" suppressHydrationWarning>
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/marketplace/cart" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={shippingInfo.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingInfo.email}
                      readOnly
                      className="bg-gray-50 cursor-not-allowed"
                      placeholder="Your registered email"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Using your registered email address
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={shippingInfo.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={shippingInfo.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Enter your full address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={shippingInfo.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="Enter your city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={shippingInfo.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      placeholder="Enter your state"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={shippingInfo.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Any special delivery instructions"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="paystack" id="paystack" />
                    <Label htmlFor="paystack" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Paystack (Recommended)</p>
                          <p className="text-sm text-gray-500">Pay securely with card, bank transfer, or USSD</p>
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                    <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Direct Bank Transfer</p>
                          <p className="text-sm text-gray-500">Transfer directly to our account</p>
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="font-medium">Cash on Delivery</p>
                          <p className="text-sm text-gray-500">Pay when you receive your order</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded overflow-hidden">
                        <Image
                          src={
                            item.image || "/placeholder.svg?height=48&width=48&query=agricultural product"
                          }
                          alt={item.cropName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.cropName}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} {item.unit}</p>
                      </div>
                      <p className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : `₦${shipping.toLocaleString()}`}</span>
                  </div>
                  {shipping === 0 && <p className="text-sm text-green-600">🎉 Free shipping on orders over ₦5,000</p>}
                  <div className="flex justify-between">
                    <span>Tax (7.5% VAT)</span>
                    <span>₦{tax.toLocaleString()}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg text-primary">
                  <span>Total</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={processing || !mounted || (mounted && cart.length === 0) || !shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city || !shippingInfo.state}
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By placing your order, you agree to our Terms of Service and Privacy Policy
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
