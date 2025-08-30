"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Grid, List, MapPin, Star, Heart, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { MarketplaceCard, type MarketplaceProduct } from "@/components/agricultural"
import { api } from "@/lib/api"
import type { Product } from "@/lib/types"
import Link from "next/link"
import Image from "next/image"

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    category: "all",
    location: "",
    priceRange: [0, 10000],
    sortBy: "newest",
  })

  useEffect(() => {
    fetchProducts()
  }, [filters, searchQuery])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search: searchQuery,
        category: filters.category,
        location: filters.location,
        minPrice: filters.priceRange[0].toString(),
        maxPrice: filters.priceRange[1].toString(),
        sortBy: filters.sortBy,
      })

      const response = await api.get(`/marketplace/products?${params}`)
      setProducts(response.data.products || [])
    } catch (error) {
      console.error("Failed to fetch products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (productId: string) => {
    try {
      await api.post("/marketplace/cart", { productId, quantity: 1 })
      // Show success message
    } catch (error) {
      console.error("Failed to add to cart:", error)
    }
  }

  const handleToggleFavorite = async (productId: string) => {
    try {
      await api.post(`/marketplace/products/${productId}/favorite`)
      // Update local state
    } catch (error) {
      console.error("Failed to toggle favorite:", error)
    }
  }

  // Convert Product type to MarketplaceProduct type for our component
  const convertToMarketplaceProduct = (product: Product): MarketplaceProduct => {
    return {
      id: String(product.id),
      name: product.name,
      cropType: product.category || "Agricultural Product",
      variety: product.variety || "Standard",
      description: product.description || "Fresh agricultural product",
      price: product.price,
      unit: product.unit,
      quantity: (product as any).quantity || 100,
      availableQuantity: (product as any).availableQuantity || 100,
      quality: (product as any).quality || "good",
      grade: (product as any).grade || "B",
      organic: (product as any).organic || false,
      harvestDate: new Date((product as any).harvestDate || Date.now()),
      location: product.location,
      farmer: {
        id: (product as any).farmerId || "1",
        name: (product as any).farmerName || "Unknown Farmer",
        avatar: (product as any).farmerAvatar || "",
        rating: product.rating || 4.5,
        verified: product.isVerified || false,
        location: product.location
      },
      images: product.images || ["/placeholder.svg?height=200&width=300&query=fresh agricultural product"],
      certifications: (product as any).certifications || ["ISO 22000"],
      shipping: {
        available: (product as any).shippingAvailable || true,
        cost: (product as any).shippingCost || 500,
        estimatedDays: (product as any).shippingDays || 3
      },
      rating: product.rating || 4.5,
      reviewCount: (product as any).reviewCount || 0,
      qrCode: (product as any).qrCode || `PRODUCT_${Date.now()}`,
      tags: (product as any).tags || [product.category, "fresh", "agricultural"]
    }
  }

  const handleMarketplaceAction = (action: string, productId: string) => {
    switch (action) {
      case "addToCart":
        handleAddToCart(productId)
        break
      case "addToWishlist":
        handleToggleFavorite(productId)
        break
      case "view":
        // Navigate to product detail page
        window.location.href = `/marketplace/products/${productId}`
        break
      case "contact":
        // Handle contact logic
        console.log("Contacting farmer for:", productId)
        break
      case "share":
        // Handle share logic
        console.log("Sharing product:", productId)
        break
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Marketplace</h1>
          <p className="text-gray-600">Discover fresh, verified agricultural products from trusted farmers</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products, farmers, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter Products</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6 mt-6">
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="grains">Grains</SelectItem>
                          <SelectItem value="vegetables">Vegetables</SelectItem>
                          <SelectItem value="fruits">Fruits</SelectItem>
                          <SelectItem value="tubers">Tubers</SelectItem>
                          <SelectItem value="legumes">Legumes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Location</label>
                      <Input
                        placeholder="Enter location"
                        value={filters.location}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Price Range</label>
                      <div className="space-y-2">
                        <Slider
                          value={filters.priceRange}
                          onValueChange={(value) => setFilters({ ...filters, priceRange: value })}
                          max={10000}
                          min={0}
                          step={100}
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>₦{filters.priceRange[0]}</span>
                          <span>₦{filters.priceRange[1]}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Sort By</label>
                      <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="price_low">Price: Low to High</SelectItem>
                          <SelectItem value="price_high">Price: High to Low</SelectItem>
                          <SelectItem value="rating">Highest Rated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
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
          <div
            className={
              viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"
            }
          >
            {products.map((product) => (
              <MarketplaceCard
                key={product.id}
                product={convertToMarketplaceProduct(product)}
                variant={viewMode === "list" ? "detailed" : "default"}
                onAddToCart={(id) => handleMarketplaceAction("addToCart", id)}
                onAddToWishlist={(id) => handleMarketplaceAction("addToWishlist", id)}
                onView={(id) => handleMarketplaceAction("view", id)}
                onContact={(id) => handleMarketplaceAction("contact", id)}
                onShare={(id) => handleMarketplaceAction("share", id)}
              />
            ))}
          </div>
        )}

        {products.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
