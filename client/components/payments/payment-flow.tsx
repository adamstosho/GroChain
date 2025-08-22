"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CreditCard, 
  Lock, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Shield, 
  Truck,
  MapPin,
  Package,
  User,
  Phone,
  Mail,
  Calendar,
  Clock
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface PaymentItem {
  product: string
  quantity: number
  unit: string
  price: number
  total: number
  seller: {
    _id: string
    name: string
    location: string
  }
}

interface PaymentFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  postalCode: string
  paymentMethod: 'card' | 'bank_transfer' | 'ussd'
  cardNumber: string
  cardExpiry: string
  cardCvv: string
  cardName: string
  saveCard: boolean
  notes: string
}

interface PaymentSummary {
  subtotal: number
  shipping: number
  tax: number
  total: number
  items: PaymentItem[]
}

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
  "Yobe", "Zamfara"
]

const paymentMethods = [
  { id: "card", name: "Credit/Debit Card", icon: CreditCard },
  { id: "bank_transfer", name: "Bank Transfer", icon: Truck },
  { id: "ussd", name: "USSD Payment", icon: Phone }
]

export function PaymentFlow() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [paymentReference, setPaymentReference] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary>({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
    items: []
  })
  const [formData, setPaymentFormData] = useState<PaymentFormData>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    paymentMethod: "card",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    cardName: "",
    saveCard: false,
    notes: ""
  })

  useEffect(() => {
    // Load cart items and calculate totals
    loadCartItems()
  }, [])

  const loadCartItems = async () => {
    try {
      // In a real app, this would fetch from cart context or API
      const mockItems: PaymentItem[] = [
        {
          product: "Fresh Tomatoes",
          quantity: 25,
          unit: "kg",
          price: 15000,
          total: 375000,
          seller: {
            _id: "seller1",
            name: "Adunni Okafor",
            location: "Lagos State"
          }
        },
        {
          product: "Organic Yam",
          quantity: 10,
          unit: "tubers",
          price: 8000,
          total: 80000,
          seller: {
            _id: "seller2",
            name: "Ibrahim Mohammed",
            location: "Kano State"
          }
        }
      ]

      const subtotal = mockItems.reduce((sum, item) => sum + item.total, 0)
      const shipping = subtotal > 100000 ? 0 : 5000 // Free shipping over ₦100,000
      const tax = subtotal * 0.075 // 7.5% VAT
      const total = subtotal + shipping + tax

      setPaymentSummary({
        subtotal,
        shipping,
        tax,
        total,
        items: mockItems
      })
    } catch (error) {
      console.error("Failed to load cart items:", error)
      setError("Failed to load cart items")
    }
  }

  const handleInputChange = (field: keyof PaymentFormData, value: any) => {
    setPaymentFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setError("Please fill in all required personal information")
      return false
    }
    if (!formData.address || !formData.city || !formData.state || !formData.postalCode) {
      setError("Please fill in all required shipping information")
      return false
    }
    if (formData.paymentMethod === "card") {
      if (!formData.cardNumber || !formData.cardExpiry || !formData.cardCvv || !formData.cardName) {
        setError("Please fill in all required card information")
        return false
      }
    }
    return true
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    setError("")

    try {
      // Prepare payment data
      const paymentData = {
        amount: paymentSummary.total,
        currency: "NGN",
        email: formData.email,
        reference: `PAY-${Date.now()}`,
        callback_url: `${window.location.origin}/payments/success`,
        metadata: {
          customer: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone
          },
          shipping: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode
          },
          items: paymentSummary.items,
          notes: formData.notes
        }
      }

      // Initialize payment with Paystack
      const response = await api.initializePayment(paymentData)

      if (response.success && response.data) {
        const { authorization_url, reference } = response.data
        
        // Save payment reference
        setPaymentReference(reference)
        
        // Redirect to Paystack payment page
        window.location.href = authorization_url
      } else {
        throw new Error(response.error || "Failed to initialize payment")
      }
    } catch (error) {
      console.error("Payment error:", error)
      setError(error instanceof Error ? error.message : "Payment failed. Please try again.")
      toast.error("Payment failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground mb-6">
            Your order has been confirmed and payment processed successfully.
          </p>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Payment Reference</p>
                  <p className="font-mono text-lg font-bold">{paymentReference}</p>
                </div>
                
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => router.push('/orders')}>
                    <Package className="w-4 h-4 mr-2" />
                    View Orders
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/marketplace')}>
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Purchase</h1>
          <p className="text-muted-foreground">
            Secure payment powered by Paystack
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    step < currentStep ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {currentStep === 1 && <User className="w-5 h-5 text-primary" />}
                  {currentStep === 2 && <MapPin className="w-5 h-5 text-primary" />}
                  {currentStep === 3 && <CreditCard className="w-5 h-5 text-primary" />}
                  {currentStep === 1 && "Personal Information"}
                  {currentStep === 2 && "Shipping Address"}
                  {currentStep === 3 && "Payment Details"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePayment} className="space-y-6">
                  {/* Error Alert */}
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+2348012345678"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Shipping Address */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="address">Street Address *</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          placeholder="123 Main Street"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State *</Label>
                          <Select
                            value={formData.state}
                            onValueChange={(value) => handleInputChange('state', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              {nigerianStates.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="postalCode">Postal Code *</Label>
                        <Input
                          id="postalCode"
                          value={formData.postalCode}
                          onChange={(e) => handleInputChange('postalCode', e.target.value)}
                          placeholder="100001"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => handleInputChange('notes', e.target.value)}
                          placeholder="Any special delivery instructions..."
                          rows={3}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Payment Details */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div>
                        <Label>Payment Method *</Label>
                        <div className="grid grid-cols-1 gap-3 mt-2">
                          {paymentMethods.map((method) => (
                            <div
                              key={method.id}
                              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                                formData.paymentMethod === method.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-muted hover:border-primary/50'
                              }`}
                              onClick={() => handleInputChange('paymentMethod', method.id)}
                            >
                              <method.icon className="w-5 h-5 mr-3" />
                              <span className="font-medium">{method.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {formData.paymentMethod === "card" && (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="cardName">Cardholder Name *</Label>
                            <Input
                              id="cardName"
                              value={formData.cardName}
                              onChange={(e) => handleInputChange('cardName', e.target.value)}
                              placeholder="John Doe"
                              required
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="cardNumber">Card Number *</Label>
                            <Input
                              id="cardNumber"
                              value={formData.cardNumber}
                              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                              placeholder="1234 5678 9012 3456"
                              maxLength={19}
                              required
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="cardExpiry">Expiry Date *</Label>
                              <Input
                                id="cardExpiry"
                                value={formData.cardExpiry}
                                onChange={(e) => handleInputChange('cardExpiry', e.target.value)}
                                placeholder="MM/YY"
                                maxLength={5}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="cardCvv">CVV *</Label>
                              <Input
                                id="cardCvv"
                                value={formData.cardCvv}
                                onChange={(e) => handleInputChange('cardCvv', e.target.value)}
                                placeholder="123"
                                maxLength={4}
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="saveCard"
                              checked={formData.saveCard}
                              onChange={(e) => handleInputChange('saveCard', e.target.checked)}
                            />
                            <Label htmlFor="saveCard" className="text-sm">
                              Save card for future payments
                            </Label>
                          </div>
                        </div>
                      )}

                      {formData.paymentMethod === "bank_transfer" && (
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            You will receive bank transfer details after order confirmation.
                          </p>
                        </div>
                      )}

                      {formData.paymentMethod === "ussd" && (
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            USSD code will be sent to your phone number for payment.
                          </p>
                        </div>
                      )}

                      {/* Security Notice */}
                      <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                        <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-green-800">Secure Payment</p>
                          <p className="text-green-700">
                            Your payment information is encrypted and secure. We never store your card details.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-4">
                    {currentStep > 1 && (
                      <Button type="button" variant="outline" onClick={prevStep}>
                        Previous
                      </Button>
                    )}
                    
                    {currentStep < 3 ? (
                      <Button type="button" onClick={nextStep} className="ml-auto">
                        Next Step
                      </Button>
                    ) : (
                      <Button type="submit" disabled={loading} className="ml-auto">
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing Payment...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Pay {formatPrice(paymentSummary.total)}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {paymentSummary.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} {item.unit} • {item.seller.name}
                        </p>
                      </div>
                      <p className="font-medium text-sm">{formatPrice(item.total)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(paymentSummary.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{paymentSummary.shipping === 0 ? 'Free' : formatPrice(paymentSummary.shipping)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (VAT)</span>
                    <span>{formatPrice(paymentSummary.tax)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-lg">{formatPrice(paymentSummary.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3" />
                  <span>256-bit SSL encryption</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
