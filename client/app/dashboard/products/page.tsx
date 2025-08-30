"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useBuyerStore } from "@/hooks/use-buyer-store"
import {
  Package,
  Search,
  Filter,
  MapPin,
  Star,
  Heart,
  ShoppingCart,
  Eye,
  Calendar,
  Leaf,
  TrendingUp,
  RefreshCw,
  Grid3X3,
  List,
  SlidersHorizontal
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface ProductListing {
  _id: string
  cropName: string
  category: string
  description: string
  basePrice: number
  quantity: number
  unit: string
  availableQuantity: number
  location: {
    city: string
    state: string
  }
  images: string[]
  tags: string[]
  status: 'active' | 'inactive' | 'sold_out'
  createdAt: string
  views: number
  orders: number
  rating: number
  reviews: number
  farmer: {
    name: string
    rating: number
    verified: boolean
  }
  organic: boolean
  qualityGrade: 'premium' | 'standard' | 'basic'
}

interface ProductFilters {
  category: "all" | "Grains" | "Tubers" | "Vegetables" | "Legumes" | "Fruits"
  location: "all" | "Lagos" | "Kano" | "Kaduna" | "Oyo" | "Katsina" | "Niger" | "Plateau"
  priceRange: "all" | "0-1000" | "1000-5000" | "5000-10000" | "10000-50000" | "50000-100000"
  quality: "all" | "premium" | "standard" | "basic"
  organic: boolean
  sortBy: "newest" | "price-low" | "price-high" | "rating" | "popular"
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductListing[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductListing[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<ProductFilters>({
    category: "all",
    location: "all",
    priceRange: "all",
    quality: "all",
    organic: false,
    sortBy: "newest"
  })
  const { toast } = useToast()
  const { addToCart, addToFavorites } = useBuyerStore()

  // Mock data for development - replace with API calls
  const mockProducts: ProductListing[] = [
    {
      _id: "1",
      cropName: "Premium Maize",
      category: "Grains",
      description: "High-quality maize harvested from organic farms in Kaduna State. Perfect for processing and direct consumption.",
      basePrice: 2500,
      quantity: 1000,
      unit: "kg",
      availableQuantity: 800,
      location: { city: "Kaduna", state: "Kaduna" },
      images: ["/placeholder.svg"],
      tags: ["organic", "premium", "fresh"],
      status: "active",
      createdAt: "2024-01-15T10:00:00Z",
      views: 156,
      orders: 23,
      rating: 4.8,
      reviews: 18,
      farmer: { name: "Ahmed Hassan", rating: 4.9, verified: true },
      organic: true,
      qualityGrade: "premium"
    },
    {
      _id: "2",
      cropName: "Sweet Cassava",
      category: "Tubers",
      description: "Fresh sweet cassava from Oyo State farms. Excellent for garri production and direct cooking.",
      basePrice: 1800,
      quantity: 500,
      unit: "kg",
      availableQuantity: 450,
      location: { city: "Ibadan", state: "Oyo" },
      images: ["/placeholder.svg"],
      tags: ["sweet", "fresh", "local"],
      status: "active",
      createdAt: "2024-01-14T14:30:00Z",
      views: 89,
      orders: 12,
      rating: 4.6,
      reviews: 8,
      farmer: { name: "Fatima Adebayo", rating: 4.7, verified: true },
      organic: false,
      qualityGrade: "standard"
    },
    {
      _id: "3",
      cropName: "Organic Tomatoes",
      category: "Vegetables",
      description: "Fresh organic tomatoes grown without pesticides. Perfect for salads, cooking, and processing.",
      basePrice: 1200,
      quantity: 200,
      unit: "kg",
      availableQuantity: 180,
      location: { city: "Kano", state: "Kano" },
      images: ["/placeholder.svg"],
      tags: ["organic", "fresh", "pesticide-free"],
      status: "active",
      createdAt: "2024-01-13T09:15:00Z",
      views: 234,
      orders: 31,
      rating: 4.9,
      reviews: 25,
      farmer: { name: "Yusuf Bello", rating: 4.8, verified: true },
      organic: true,
      qualityGrade: "premium"
    },
    {
      _id: "4",
      cropName: "Quality Rice",
      category: "Grains",
      description: "Premium quality rice from Niger State. Clean, well-processed rice suitable for all cooking needs.",
      basePrice: 3200,
      quantity: 800,
      unit: "kg",
      availableQuantity: 720,
      location: { city: "Minna", state: "Niger" },
      images: ["/placeholder.svg"],
      tags: ["premium", "clean", "well-processed"],
      status: "active",
      createdAt: "2024-01-12T16:45:00Z",
      views: 198,
      orders: 19,
      rating: 4.7,
      reviews: 15,
      farmer: { name: "Hassan Ibrahim", rating: 4.6, verified: true },
      organic: false,
      qualityGrade: "standard"
    },
    {
      _id: "5",
      cropName: "Fresh Pepper",
      category: "Vegetables",
      description: "Hot and fresh pepper varieties from Katsina State. Perfect for seasoning and traditional dishes.",
      basePrice: 800,
      quantity: 150,
      unit: "kg",
      availableQuantity: 120,
      location: { city: "Katsina", state: "Katsina" },
      images: ["/placeholder.svg"],
      tags: ["hot", "fresh", "seasoning"],
      status: "active",
      createdAt: "2024-01-11T11:20:00Z",
      views: 167,
      orders: 28,
      rating: 4.5,
      reviews: 22,
      farmer: { name: "Aisha Usman", rating: 4.4, verified: true },
      organic: false,
      qualityGrade: "basic"
    },
    {
      _id: "6",
      cropName: "Organic Beans",
      category: "Legumes",
      description: "Organic beans from Plateau State. Rich in protein and nutrients, perfect for healthy meals.",
      basePrice: 2800,
      quantity: 300,
      unit: "kg",
      availableQuantity: 280,
      location: { city: "Jos", state: "Plateau" },
      images: ["/placeholder.svg"],
      tags: ["organic", "protein-rich", "nutritious"],
      status: "active",
      createdAt: "2024-01-10T13:10:00Z",
      views: 145,
      orders: 16,
      rating: 4.8,
      reviews: 12,
      farmer: { name: "Daniel Dung", rating: 4.9, verified: true },
      organic: true,
      qualityGrade: "premium"
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProducts(mockProducts)
      setFilteredProducts(mockProducts)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    filterProducts()
  }, [searchQuery, filters, products])

  const filterProducts = () => {
    let filtered = [...products]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter(product => product.category === filters.category)
    }

    // Location filter
    if (filters.location && filters.location !== "all") {
      filtered = filtered.filter(product => 
        product.location.state === filters.location || 
        product.location.city === filters.location
      )
    }

    // Price range filter
    if (filters.priceRange && filters.priceRange !== "all") {
      const [min, max] = filters.priceRange.split('-').map(Number)
      filtered = filtered.filter(product => 
        product.basePrice >= min && product.basePrice <= max
      )
    }

    // Quality filter
    if (filters.quality && filters.quality !== "all") {
      filtered = filtered.filter(product => product.qualityGrade === filters.quality)
    }

    // Organic filter
    if (filters.organic) {
      filtered = filtered.filter(product => product.organic)
    }

    // Sort products
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.basePrice - b.basePrice)
        break
      case 'price-high':
        filtered.sort((a, b) => b.basePrice - a.basePrice)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'popular':
        filtered.sort((a, b) => b.views - a.views)
        break
    }

    setFilteredProducts(filtered)
  }

  const handleAddToCart = (product: ProductListing) => {
    addToCart(product, 1)
    toast({
      title: "Added to cart",
      description: `${product.cropName} has been added to your cart`,
    })
  }

  const handleAddToFavorites = (product: ProductListing) => {
    addToFavorites(product._id)
    toast({
      title: "Added to favorites",
      description: `${product.cropName} has been added to your favorites`,
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'premium': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
      case 'standard': return 'bg-blue-500 text-white'
      case 'basic': return 'bg-gray-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  if (loading) {
    return (
      <DashboardLayout pageTitle="Browse Products">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-lg font-medium">Loading products...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout pageTitle="Browse Products">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Browse Products</h1>
            <p className="text-muted-foreground">
              Discover fresh agricultural products from verified farmers across Nigeria
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SlidersHorizontal className="h-5 w-5" />
              <span>Search & Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search for products, categories, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Grains">Grains</SelectItem>
                  <SelectItem value="Tubers">Tubers</SelectItem>
                  <SelectItem value="Vegetables">Vegetables</SelectItem>
                  <SelectItem value="Legumes">Legumes</SelectItem>
                  <SelectItem value="Fruits">Fruits</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.location} onValueChange={(value) => setFilters({ ...filters, location: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="Lagos">Lagos</SelectItem>
                  <SelectItem value="Kano">Kano</SelectItem>
                  <SelectItem value="Kaduna">Kaduna</SelectItem>
                  <SelectItem value="Oyo">Oyo</SelectItem>
                  <SelectItem value="Katsina">Katsina</SelectItem>
                  <SelectItem value="Niger">Niger</SelectItem>
                  <SelectItem value="Plateau">Plateau</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.priceRange} onValueChange={(value) => setFilters({ ...filters, priceRange: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-1000">₦0 - ₦1,000</SelectItem>
                  <SelectItem value="1000-5000">₦1,000 - ₦5,000</SelectItem>
                  <SelectItem value="5000-10000">₦5,000 - ₦10,000</SelectItem>
                  <SelectItem value="10000-50000">₦10,000 - ₦50,000</SelectItem>
                  <SelectItem value="50000-100000">₦50,000+</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.quality} onValueChange={(value) => setFilters({ ...filters, quality: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Qualities</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setFilters({
                  category: "all",
                  location: "all",
                  priceRange: "all",
                  quality: "all",
                  organic: false,
                  sortBy: "newest"
                })}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>

            {/* Organic Filter */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="organic"
                checked={filters.organic}
                onChange={(e) => setFilters({ ...filters, organic: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="organic" className="text-sm font-medium">
                Organic products only
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredProducts.length} of {products.length} products
          </p>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {filters.organic ? 'Organic Only' : 'All Products'}
            </Badge>
            {filters.category && filters.category !== "all" && (
              <Badge variant="secondary" className="text-xs">
                {filters.category}
              </Badge>
            )}
          </div>
        </div>

        {/* Products Grid/List */}
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground text-center mb-4">
                Try adjusting your search criteria or filters to find more products.
              </p>
              <Button
                variant="outline"
                onClick={() => setFilters({
                  category: "all",
                  location: "all",
                  priceRange: "all",
                  quality: "all",
                  organic: false,
                  sortBy: "newest"
                })}
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                viewMode={viewMode}
                onAddToCart={handleAddToCart}
                onAddToFavorites={handleAddToFavorites}
                formatPrice={formatPrice}
                getQualityColor={getQualityColor}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

interface ProductCardProps {
  product: ProductListing
  viewMode: 'grid' | 'list'
  onAddToCart: (product: ProductListing) => void
  onAddToFavorites: (product: ProductListing) => void
  formatPrice: (price: number) => string
  getQualityColor: (quality: string) => string
}

function ProductCard({ 
  product, 
  viewMode, 
  onAddToCart, 
  onAddToFavorites, 
  formatPrice, 
  getQualityColor 
}: ProductCardProps) {
  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex space-x-4">
            {/* Product Image */}
            <div className="relative w-24 h-24 flex-shrink-0">
              <Image
                src={product.images[0] || "/placeholder.svg"}
                alt={product.cropName}
                fill
                className="rounded-lg object-cover"
              />
              {product.organic && (
                <Badge className="absolute top-2 left-2 bg-green-600 text-white text-xs">
                  Organic
                </Badge>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {product.cropName}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {product.description}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Badge className={getQualityColor(product.qualityGrade)}>
                    {product.qualityGrade}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddToFavorites(product)}
                    className="h-8 w-8 p-0"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{product.location.city}, {product.location.state}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{product.views} views</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{product.rating}</span>
                    <span className="text-muted-foreground">({product.reviews})</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Farmer: </span>
                    <span className="font-medium">{product.farmer.name}</span>
                    {product.farmer.verified && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {formatPrice(product.basePrice)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    per {product.unit} • {product.availableQuantity} {product.unit} available
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-4">
                <Button
                  onClick={() => onAddToCart(product)}
                  className="flex-1"
                  size="sm"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/products/${product._id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Grid view
  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <CardHeader className="p-4 pb-2">
        <div className="relative">
          <div className="aspect-square w-full overflow-hidden rounded-lg">
            <Image
              src={product.images[0] || "/placeholder.svg"}
              alt={product.cropName}
              width={300}
              height={300}
              className="h-full w-full object-cover"
            />
          </div>
          {product.organic && (
            <Badge className="absolute top-2 left-2 bg-green-600 text-white text-xs">
              Organic
            </Badge>
          )}
          <Badge className={`absolute top-2 right-2 ${getQualityColor(product.qualityGrade)}`}>
            {product.qualityGrade}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-foreground line-clamp-1">
              {product.cropName}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                {product.location.city}, {product.location.state}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{product.rating}</span>
              <span className="text-muted-foreground">({product.reviews})</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-muted-foreground">Farmer: </span>
              <span className="font-medium">{product.farmer.name}</span>
              {product.farmer.verified && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  Verified
                </Badge>
              )}
            </div>
          </div>

          <div className="text-center">
            <div className="text-xl font-bold text-primary mb-1">
              {formatPrice(product.basePrice)}
            </div>
            <div className="text-sm text-muted-foreground mb-3">
              per {product.unit} • {product.availableQuantity} {product.unit} available
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => onAddToCart(product)}
              className="flex-1"
              size="sm"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddToFavorites(product)}
              className="px-3"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href={`/dashboard/products/${product._id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
