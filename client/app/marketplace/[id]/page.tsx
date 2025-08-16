"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Star, Calendar, Shield, Leaf, ShoppingCart, MessageCircle, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { apiClient } from "@/lib/api"
import Link from "next/link"

interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  category: string
  quantity: number
  unit: string
  location: string
  farmer: {
    id: string
    name: string
    rating: number
    verified: boolean
    joinedDate: string
    totalSales: number
  }
  images: string[]
  harvestDate: string
  expiryDate: string
  isOrganic: boolean
  isVerified: boolean
  nutritionalInfo?: {
    calories: number
    protein: number
    carbs: number
    fiber: number
  }
  certifications: string[]
  qrCode: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [orderQuantity, setOrderQuantity] = useState(1)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [orderForm, setOrderForm] = useState({
    quantity: 1,
    message: "",
    deliveryAddress: "",
    phoneNumber: "",
  })

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  const fetchProduct = async (id: string) => {
    setLoading(true)
    try {
      const response = await apiClient.getMarketplaceProduct(id)

      if (response.success && response.data) {
        setProduct(response.data)
      } else {
        // Fallback to mock data for demo
        setProduct(mockProduct)
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      setProduct(mockProduct)
    } finally {
      setLoading(false)
    }
  }

  const handleOrder = async () => {
    if (!product) return

    try {
      const paymentResponse = await apiClient.initiatePayment({
        amount: product.price * orderForm.quantity,
        currency: product.currency,
        productId: product.id,
        buyerId: "current-user-id", // This should come from auth context
        sellerId: product.farmer.id,
      })

      if (paymentResponse.success) {
        // Redirect to payment page or show success message
        alert("Order placed successfully! Redirecting to payment...")
      }
    } catch (error) {
      console.error("Error placing order:", error)
      alert("Error placing order. Please try again.")
    }
  }

  const mockProduct: Product = {
    id: "1",
    name: "Premium Rice",
    description:
      "High-quality local rice from Kebbi State. This premium variety is known for its excellent taste, nutritional value, and long grain structure. Grown using sustainable farming practices with minimal use of chemicals.",
    price: 25000,
    currency: "NGN",
    category: "Grains & Cereals",
    quantity: 50,
    unit: "bags",
    location: "Kebbi State, Nigeria",
    farmer: {
      id: "farmer1",
      name: "Musa Ibrahim",
      rating: 4.8,
      verified: true,
      joinedDate: "2022-03-15",
      totalSales: 1250,
    },
    images: ["/placeholder-qzru9.png", "/rice-grains-closeup.png", "/rice-farm-field.png"],
    harvestDate: "2024-01-15",
    expiryDate: "2024-12-15",
    isOrganic: true,
    isVerified: true,
    nutritionalInfo: {
      calories: 130,
      protein: 2.7,
      carbs: 28,
      fiber: 0.4,
    },
    certifications: ["Organic Certified", "NAFDAC Approved", "Quality Assured"],
    qrCode: "QR123456789",
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/marketplace">Back to Marketplace</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketplace
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-video rounded-lg overflow-hidden">
              <img
                src={product.images[0] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {product.images.slice(1).map((image, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} ${index + 2}`}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                {product.isVerified && (
                  <Badge className="bg-green-500 text-white">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {product.isOrganic && (
                  <Badge className="bg-blue-500 text-white">
                    <Leaf className="h-3 w-3 mr-1" />
                    Organic
                  </Badge>
                )}
                <Badge variant="outline">{product.category}</Badge>
              </div>

              <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>
            </div>

            {/* Price and Availability */}
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-3xl font-bold text-green-600">₦{product.price.toLocaleString()}</span>
                  <span className="text-gray-600 ml-2">per {product.unit}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Available</p>
                  <p className="font-semibold">
                    {product.quantity} {product.unit}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <Input
                    type="number"
                    min="1"
                    max={product.quantity}
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Number.parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-xl font-bold text-green-600">
                    ₦{(product.price * orderQuantity).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1" onClick={() => setShowOrderForm(true)}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Order Now
                </Button>
                <Button variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Farmer
                </Button>
              </div>
            </div>

            {/* Farmer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Farmer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{product.farmer.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{product.farmer.rating}</span>
                      </div>
                      {product.farmer.verified && <Badge className="bg-green-500 text-white text-xs">Verified</Badge>}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Member since</p>
                    <p className="font-medium">{new Date(product.farmer.joinedDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total sales</p>
                    <p className="font-medium">{product.farmer.totalSales} orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{product.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Harvested: {new Date(product.harvestDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Best before: {new Date(product.expiryDate).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Nutritional Info */}
          {product.nutritionalInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Nutritional Information</CardTitle>
                <p className="text-sm text-gray-600">Per 100g serving</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Calories</span>
                  <span className="font-medium">{product.nutritionalInfo.calories} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span>Protein</span>
                  <span className="font-medium">{product.nutritionalInfo.protein}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Carbohydrates</span>
                  <span className="font-medium">{product.nutritionalInfo.carbs}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Fiber</span>
                  <span className="font-medium">{product.nutritionalInfo.fiber}g</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {product.certifications.map((cert, index) => (
                  <Badge key={index} variant="outline" className="mr-2 mb-2">
                    {cert}
                  </Badge>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">QR Code: {product.qrCode}</p>
                <Button variant="outline" size="sm">
                  Verify Product
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Form Modal */}
        {showOrderForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Place Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity ({product.unit})</label>
                  <Input
                    type="number"
                    min="1"
                    max={product.quantity}
                    value={orderForm.quantity}
                    onChange={(e) =>
                      setOrderForm({
                        ...orderForm,
                        quantity: Number.parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <Input
                    type="tel"
                    value={orderForm.phoneNumber}
                    onChange={(e) =>
                      setOrderForm({
                        ...orderForm,
                        phoneNumber: e.target.value,
                      })
                    }
                    placeholder="+234..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                  <Textarea
                    value={orderForm.deliveryAddress}
                    onChange={(e) =>
                      setOrderForm({
                        ...orderForm,
                        deliveryAddress: e.target.value,
                      })
                    }
                    placeholder="Enter your delivery address..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message to Farmer (Optional)</label>
                  <Textarea
                    value={orderForm.message}
                    onChange={(e) =>
                      setOrderForm({
                        ...orderForm,
                        message: e.target.value,
                      })
                    }
                    placeholder="Any special requests or notes..."
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Amount:</span>
                    <span className="text-xl font-bold text-green-600">
                      ₦{(product.price * orderForm.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowOrderForm(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleOrder}>
                    Confirm Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
