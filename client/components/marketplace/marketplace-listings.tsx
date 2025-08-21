"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Heart, 
  ShoppingCart, 
  Eye, 
  Package,
  Loader2,
  AlertCircle,
  X,
  RefreshCw
} from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MarketplaceListing {
  _id: string
  product: string
  price: number
  quantity: number
  unit: string
  farmer: {
    _id: string
    name: string
    location: string
    rating: number
  }
  images: string[]
  status: 'active' | 'sold' | 'removed'
  createdAt: string
  updatedAt: string
  description?: string
  quality: string
  location: string
}

interface Filters {
  search: string
  category: string
  location: string
  priceRange: string
  quality: string
  sortBy: string
}

const categories = [
  "All",
  "Vegetables",
  "Tubers",
  "Grains",
  "Legumes",
  "Fruits",
  "Herbs",
  "Other"
]

const priceRanges = [
  "All",
  "Under ₦1,000",
  "₦1,000 - ₦5,000",
  "₦5,000 - ₦10,000",
  "₦10,000 - ₦20,000",
  "Over ₦20,000"
]

const qualityLevels = [
  "All",
  "Excellent",
  "Good",
  "Fair",
  "Poor"
]

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "quantity", label: "Highest Quantity" }
]

export function MarketplaceListings() {
  const { user } = useAuth()
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState<Filters>({
    search: "",
    category: "All",
    location: "",
    priceRange: "All",
    quality: "All",
    sortBy: "newest"
  })
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchListings()
  }, [filters, page])

  useEffect(() => {
    if (user) {
      fetchFavorites()
    }
  }, [user])

  const fetchListings = async () => {
    try {
      setLoading(true)
      setError("")

      const params: any = {
        page,
        limit: 20
      }

      if (filters.search) params.search = filters.search
      if (filters.category !== "All") params.category = filters.category
      if (filters.location) params.location = filters.location
      if (filters.quality !== "All") params.quality = filters.quality
      if (filters.sortBy) params.sortBy = filters.sortBy

      const response = await api.getMarketplaceListings(params)

      if (response.success && response.data) {
        const newListings = response.data.listings || response.data
        if (page === 1) {
          setListings(newListings)
        } else {
          setListings(prev => [...prev, ...newListings])
        }
        setHasMore(newListings.length === 20)
      } else {
        throw new Error(response.error || "Failed to fetch listings")
      }
    } catch (error) {
      console.error("Failed to fetch listings:", error)
      setError("Failed to load marketplace listings")
      
      // Set empty state when API fails
      setListings([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  const fetchFavorites = async () => {
    if (!user) return
    
    try {
      const response = await api.getFavorites(user.id)
      if (response.success && response.data) {
        const favoriteIds = (response.data.favorites || []).map((fav: any) => fav._id)
        setFavorites(favoriteIds)
      }
    } catch (error) {
      console.error("Failed to fetch favorites:", error)
    }
  }

  // No mock data - all data comes from real APIs

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "All",
      location: "",
      priceRange: "All",
      quality: "All",
      sortBy: "newest"
    })
    setPage(1)
  }

  const toggleFavorite = async (listingId: string) => {
    if (!user) {
      toast.error("Please log in to save favorites")
      return
    }

    try {
      if (favorites.includes(listingId)) {
        const response = await api.removeFromFavorites(user.id, listingId)
        if (response.success) {
          setFavorites(prev => prev.filter(id => id !== listingId))
          toast.success("Removed from favorites")
        }
      } else {
        const response = await api.addToFavorites(user.id, listingId)
        if (response.success) {
          setFavorites(prev => [...prev, listingId])
          toast.success("Added to favorites")
        }
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error)
      toast.error("Failed to update favorites")
    }
  }

  const loadMore = () => {
    setPage(prev => prev + 1)
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
    switch (quality.toLowerCase()) {
      case 'excellent':
        return 'bg-green-100 text-green-800'
      case 'good':
        return 'bg-blue-100 text-blue-800'
      case 'fair':
        return 'bg-yellow-100 text-yellow-800'
      case 'poor':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredListings = listings.filter(listing => {
    if (filters.priceRange !== "All") {
      const price = listing.price
      switch (filters.priceRange) {
        case "Under ₦1,000":
          if (price >= 1000) return false
          break
        case "₦1,000 - ₦5,000":
          if (price < 1000 || price > 5000) return false
          break
        case "₦5,000 - ₦10,000":
          if (price < 5000 || price > 10000) return false
          break
        case "₦10,000 - ₦20,000":
          if (price < 10000 || price > 20000) return false
          break
        case "Over ₦20,000":
          if (price <= 20000) return false
          break
      }
    }
    return true
  })

  if (loading && listings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading marketplace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground">
            Discover fresh, verified Nigerian produce from local farmers
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? "Hide" : "Show"} Filters
          </Button>
          <Button onClick={fetchListings} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search for products, farmers, or locations..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg"
          >
            <div>
              <Label className="text-sm font-medium">Category</Label>
              <Select
                value={filters.category}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Location</Label>
              <Input
                placeholder="Enter location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Price Range</Label>
              <Select
                value={filters.priceRange}
                onValueChange={(value) => handleFilterChange('priceRange', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Quality</Label>
              <Select
                value={filters.quality}
                onValueChange={(value) => handleFilterChange('quality', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {qualityLevels.map((quality) => (
                    <SelectItem key={quality} value={quality}>
                      {quality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Sort By</Label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}

        {/* Active Filters */}
        {(filters.category !== "All" || filters.location || filters.priceRange !== "All" || filters.quality !== "All") && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {filters.category !== "All" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.category}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => handleFilterChange('category', 'All')}
                />
              </Badge>
            )}
            {filters.location && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.location}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => handleFilterChange('location', '')}
                />
              </Badge>
            )}
            {filters.priceRange !== "All" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.priceRange}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => handleFilterChange('priceRange', 'All')}
                />
              </Badge>
            )}
            {filters.quality !== "All" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.quality}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => handleFilterChange('quality', 'All')}
                />
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredListings.length} product{filteredListings.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or search terms
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.map((listing, index) => (
            <motion.div
              key={listing._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow group">
                <CardContent className="p-4">
                  {/* Product Image */}
                  <div className="relative mb-4">
                    <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                      {listing.images.length > 0 ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.product}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="w-16 h-16 text-muted-foreground" />
                      )}
                    </div>
                    
                    {/* Favorite Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 w-8 h-8 p-0 bg-white/80 hover:bg-white"
                      onClick={() => toggleFavorite(listing._id)}
                    >
                      <Heart 
                        className={`w-4 h-4 ${
                          favorites.includes(listing._id) 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-gray-600'
                        }`} 
                      />
                    </Button>

                    {/* Quality Badge */}
                    <Badge 
                      className={`absolute top-2 left-2 ${getQualityColor(listing.quality)}`}
                    >
                      {listing.quality}
                    </Badge>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium text-foreground line-clamp-2 mb-1">
                        {listing.product}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {listing.description || "Fresh produce from local farmer"}
                      </p>
                    </div>

                    {/* Farmer Info */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{listing.farmer.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>by {listing.farmer.name}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{listing.farmer.rating}</span>
                      </div>
                    </div>

                    {/* Price and Quantity */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(listing.price)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {listing.quantity} {listing.unit}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link href={`/marketplace/${listing._id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Button size="sm" className="flex-1">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Buy Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Products"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
