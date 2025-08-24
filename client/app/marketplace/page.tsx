"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Search, 
  Filter, 
  Package, 
  MapPin, 
  DollarSign, 
  Star, 
  Eye, 
  ShoppingCart,
  Loader2,
  AlertCircle,
  RefreshCw,
  Plus
} from "lucide-react"
import { api } from "@/lib/api"
import Link from "next/link"
import Image from "next/image"

interface MarketplaceListing {
  id: string
  product: string
  price: number
  quantity: number
  farmer: {
    id: string
    name: string
    location: string
    rating: number
  }
  images: string[]
  description: string
  category: string
  unit: string
  harvestDate: string
  status: string
  createdAt: string
}

interface MarketplaceFilters {
  search: string
  category: string
  location: string
  minPrice: string
  maxPrice: string
  sortBy: string
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState<MarketplaceFilters>({
    search: "",
    category: "all",
    location: "all",
    minPrice: "",
    maxPrice: "",
    sortBy: "newest"
  })
  const [categories, setCategories] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])

  useEffect(() => {
    fetchMarketplaceData()
  }, [filters])

  const fetchMarketplaceData = async () => {
    try {
      setLoading(true)
      setError("")

      // Build query parameters
      const queryParams: any = {}
      if (filters.search) queryParams.search = filters.search
      if (filters.category && filters.category !== "all") queryParams.category = filters.category
      if (filters.location && filters.location !== "all") queryParams.location = filters.location
      if (filters.minPrice) queryParams.minPrice = parseFloat(filters.minPrice)
      if (filters.maxPrice) queryParams.maxPrice = parseFloat(filters.maxPrice)
      if (filters.sortBy) queryParams.sortBy = filters.sortBy

      const response = await api.getMarketplaceListings(queryParams)
      
      if (response.success) {
        const data = response.data as any
        setListings(data.listings || data || [])
        
        // Extract unique categories and locations for filters
        const uniqueCategories = [...new Set(data.listings?.map((l: any) => l.category).filter(Boolean) || [])] as string[]
        const uniqueLocations = [...new Set(data.listings?.map((l: any) => l.farmer?.location).filter(Boolean) || [])] as string[]
        
        setCategories(uniqueCategories)
        setLocations(uniqueLocations)
      } else {
        throw new Error(response.error || "Failed to fetch marketplace listings")
      }
    } catch (error) {
      console.error("Marketplace fetch error:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch marketplace listings")
      
      // Set empty states when API fails
      setListings([])
      setCategories([])
      setLocations([])
    } finally {
      setLoading(false)
    }
  }

  // No mock data - all data comes from real APIs

  const handleFilterChange = (key: keyof MarketplaceFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "all",
      location: "all",
      minPrice: "",
      maxPrice: "",
      sortBy: "newest"
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading && listings.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading marketplace...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Marketplace</h1>
            <p className="text-muted-foreground">
              Discover fresh, quality produce from local farmers
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchMarketplaceData} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
            <Link href="/harvests/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Sell Your Produce
              </Button>
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <SearchWithSuggestions value={filters.search} onChange={(v) => handleFilterChange('search', v)} />
              </div>

              {/* Category */}
              <div>
                <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div>
                <Select value={filters.location} onValueChange={(value) => handleFilterChange("location", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div>
                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              <div>
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {listings.length} product{listings.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Listings Grid */}
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-0">
                    {/* Product Image */}
                    <div className="relative h-48 bg-muted rounded-t-lg overflow-hidden">
                      <Image
                        src={listing.images[0] || "/fresh-tomatoes.png"}
                        alt={listing.product}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-white/90 text-foreground">
                          {listing.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1">{listing.product}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
                      </div>

                      {/* Price and Quantity */}
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(listing.price)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {listing.quantity} {listing.unit}
                        </div>
                      </div>

                      {/* Farmer Info */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{listing.farmer.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>{listing.farmer.rating}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link href={`/marketplace/${listing.id}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                        <Button className="flex-1">
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Buy Now
                        </Button>
                      </div>

                      {/* Harvest Date */}
                      <div className="text-xs text-muted-foreground text-center">
                        Harvested: {formatDate(listing.harvestDate)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                {filters.search || filters.category || filters.location
                  ? "Try adjusting your search or filters"
                  : "No products are currently available in the marketplace"
                }
              </p>
              {filters.search || filters.category || filters.location ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              ) : (
                <Link href="/harvests/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Product
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function SearchWithSuggestions({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<{ label: string; value: string }[]>([])
  useEffect(() => {
    const q = value.trim()
    if (q.length < 2) { setItems([]); setOpen(false); return }
    let active = true
    setLoading(true)
    api.getSearchSuggestions(q).then(resp => {
      if (!active) return
      if (resp.success && (resp.data as any)?.suggestions) {
        const arr = (resp.data as any).suggestions.map((s: any) => ({ label: s.label, value: s.value }))
        setItems(arr); setOpen(arr.length > 0)
      } else { setItems([]); setOpen(false) }
    }).finally(() => setLoading(false))
    return () => { active = false }
  }, [value])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        placeholder="Search products..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
        onFocus={() => value.trim().length >= 2 && setOpen(items.length > 0)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-card border border-border rounded-md shadow-sm max-h-56 overflow-auto">
          {loading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">Searching…</div>
          ) : items.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">No suggestions</div>
          ) : (
            items.map((it) => (
              <button key={it.value} className="w-full text-left px-3 py-2 text-sm hover:bg-muted" onMouseDown={(e) => { e.preventDefault(); onChange(it.value); setOpen(false) }}>
                {it.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
