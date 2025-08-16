"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Star, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  }
  images: string[]
  harvestDate: string
  expiryDate: string
  isOrganic: boolean
  isVerified: boolean
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  const categories = [
    "Grains & Cereals",
    "Fruits",
    "Vegetables",
    "Tubers",
    "Legumes",
    "Spices & Herbs",
    "Livestock",
    "Dairy",
  ]

  const locations = ["Lagos", "Kano", "Kaduna", "Ogun", "Oyo", "Rivers", "Delta", "Anambra"]

  useEffect(() => {
    fetchProducts()
  }, [searchTerm, selectedCategory, selectedLocation, currentPage])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getMarketplaceProducts({
        page: currentPage,
        limit: 12,
        category: selectedCategory === "all" ? undefined : selectedCategory,
        search: searchTerm || undefined,
        location: selectedLocation === "all" ? undefined : selectedLocation,
      })

      if (response.success && response.data) {
        setProducts(response.data.products || [])
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      // Fallback to mock data for demo
      setProducts(mockProducts)
    } finally {
      setLoading(false)
    }
  }

  const mockProducts: Product[] = [
    {
      id: "1",
      name: "Premium Rice",
      description: "High-quality local rice from Kebbi State",
      price: 25000,
      currency: "NGN",
      category: "Grains & Cereals",
      quantity: 50,
      unit: "bags",
      location: "Kebbi",
      farmer: {
        id: "farmer1",
        name: "Musa Ibrahim",
        rating: 4.8,
        verified: true,
      },
      images: ["/stacked-rice-bags.png"],
      harvestDate: "2024-01-15",
      expiryDate: "2024-12-15",
      isOrganic: true,
      isVerified: true,
    },
    {
      id: "2",
      name: "Fresh Tomatoes",
      description: "Vine-ripened tomatoes from Jos Plateau",
      price: 15000,
      currency: "NGN",
      category: "Vegetables",
      quantity: 100,
      unit: "baskets",
      location: "Plateau",
      farmer: {
        id: "farmer2",
        name: "Grace Adamu",
        rating: 4.9,
        verified: true,
      },
      images: ["/fresh-tomatoes.png"],
      harvestDate: "2024-01-20",
      expiryDate: "2024-02-05",
      isOrganic: false,
      isVerified: true,
    },
    {
      id: "3",
      name: "Sweet Potatoes",
      description: "Nutritious sweet potatoes from Benue Valley",
      price: 12000,
      currency: "NGN",
      category: "Tubers",
      quantity: 75,
      unit: "bags",
      location: "Benue",
      farmer: {
        id: "farmer3",
        name: "John Terver",
        rating: 4.7,
        verified: true,
      },
      images: ["/roasted-sweet-potatoes.png"],
      harvestDate: "2024-01-10",
      expiryDate: "2024-06-10",
      isOrganic: true,
      isVerified: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Marketplace</h1>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 left-2 flex gap-1">
                    {product.isVerified && <Badge className="bg-green-500 text-white">Verified</Badge>}
                    {product.isOrganic && <Badge className="bg-blue-500 text-white">Organic</Badge>}
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>

                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{product.location}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{product.farmer.rating}</span>
                    </div>
                    <span className="text-sm text-gray-600">by {product.farmer.name}</span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-2xl font-bold text-green-600">₦{product.price.toLocaleString()}</span>
                      <span className="text-sm text-gray-600">/{product.unit}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.quantity} {product.unit} available
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link href={`/marketplace/${product.id}`}>View Details</Link>
                    </Button>
                    <Button variant="outline" size="icon">
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
            <Button
              className="mt-4"
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("all")
                setSelectedLocation("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
