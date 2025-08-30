"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useToast } from "@/hooks/use-toast"
import { useBuyerStore } from "@/hooks/use-buyer-store"
import {
  Heart,
  Search,
  MapPin,
  Star,
  ShoppingCart,
  Eye,
  Trash2,
  Bell,
  TrendingUp,
  RefreshCw,
  Grid3X3,
  List,
  Plus,
  Download
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface FavoriteProduct {
  _id: string
  listingId: string
  cropName: string
  category: string
  description: string
  basePrice: number
  currentPrice: number
  unit: string
  availableQuantity: number
  location: {
    city: string
    state: string
  }
  images: string[]
  rating: number
  reviews: number
  farmer: {
    name: string
    rating: number
    verified: boolean
  }
  organic: boolean
  qualityGrade: 'premium' | 'standard' | 'basic'
  notes: string
  priceAlert: number | null
  addedToFavorites: Date
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([])
  const [filteredFavorites, setFilteredFavorites] = useState<FavoriteProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  const { addToCart, removeFromFavorites } = useBuyerStore()

  // Mock data for development
  const mockFavorites: FavoriteProduct[] = [
    {
      _id: "1",
      listingId: "listing1",
      cropName: "Premium Maize",
      category: "Grains",
      description: "High-quality maize harvested from organic farms in Kaduna State.",
      basePrice: 2500,
      currentPrice: 2500,
      unit: "kg",
      availableQuantity: 800,
      location: { city: "Kaduna", state: "Kaduna" },
      images: ["/placeholder.svg"],
      rating: 4.8,
      reviews: 18,
      farmer: { name: "Ahmed Hassan", rating: 4.9, verified: true },
      organic: true,
      qualityGrade: "premium",
      notes: "Best quality maize for processing",
      priceAlert: 2200,
      addedToFavorites: new Date("2024-01-10")
    },
    {
      _id: "2",
      listingId: "listing2",
      cropName: "Sweet Cassava",
      category: "Tubers",
      description: "Fresh sweet cassava from Oyo State farms.",
      basePrice: 1800,
      currentPrice: 1600,
      unit: "kg",
      availableQuantity: 450,
      location: { city: "Ibadan", state: "Oyo" },
      images: ["/placeholder.svg"],
      rating: 4.6,
      reviews: 8,
      farmer: { name: "Fatima Adebayo", rating: 4.7, verified: true },
      organic: false,
      qualityGrade: "standard",
      notes: "Good for garri production",
      priceAlert: null,
      addedToFavorites: new Date("2024-01-12")
    }
  ]

  useEffect(() => {
    setTimeout(() => {
      setFavorites(mockFavorites)
      setFilteredFavorites(mockFavorites)
      setLoading(false)
    }, 1000)
  }, [])

  const handleAddToCart = (product: FavoriteProduct) => {
    addToCart(product, 1)
    toast({
      title: "Added to cart",
      description: `${product.cropName} has been added to your cart`,
    })
  }

  const handleRemoveFromFavorites = (productId: string) => {
    removeFromFavorites(productId)
    setFavorites(prev => prev.filter(p => p._id !== productId))
    toast({
      title: "Removed from favorites",
      description: "Product has been removed from your favorites",
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

  if (loading) {
    return (
      <DashboardLayout pageTitle="My Favorites">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-lg font-medium">Loading favorites...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout pageTitle="My Favorites">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Favorites</h1>
            <p className="text-muted-foreground">
              Manage your saved products, set price alerts, and track price changes
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export List
            </Button>
            <Button size="sm" asChild>
              <Link href="/dashboard/products">
                <Plus className="h-4 w-4 mr-2" />
                Browse Products
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Favorites</p>
                  <p className="text-2xl font-bold">{favorites.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Price Drops</p>
                  <p className="text-2xl font-bold">
                    {favorites.filter(p => p.currentPrice < p.basePrice).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Price Alerts</p>
                  <p className="text-2xl font-bold">
                    {favorites.filter(p => p.priceAlert !== null).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Favorites List */}
        <Card>
          <CardHeader>
            <CardTitle>Favorites Management</CardTitle>
            <CardDescription>
              Organize and manage your favorite products
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and View Mode */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search favorites, products, or farmers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md"
                />
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

            {/* Favorites Grid/List */}
            {filteredFavorites.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No favorites found</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't added any products to your favorites yet.
                </p>
                <Button asChild>
                  <Link href="/dashboard/products">
                    Browse Products
                  </Link>
                </Button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredFavorites.map((product) => (
                  <FavoriteCard
                    key={product._id}
                    product={product}
                    viewMode={viewMode}
                    onAddToCart={handleAddToCart}
                    onRemoveFromFavorites={handleRemoveFromFavorites}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

interface FavoriteCardProps {
  product: FavoriteProduct
  viewMode: 'grid' | 'list'
  onAddToCart: (product: FavoriteProduct) => void
  onRemoveFromFavorites: (productId: string) => void
  formatPrice: (price: number) => string
}

function FavoriteCard({
  product,
  viewMode,
  onAddToCart,
  onRemoveFromFavorites,
  formatPrice
}: FavoriteCardProps) {
  const priceChange = product.currentPrice < product.basePrice

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
              {priceChange && (
                <Badge className="absolute top-2 right-2 bg-green-600 text-white text-xs">
                  Price Drop
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
                  {product.notes && (
                    <p className="text-sm text-blue-600 italic mb-2">
                      Note: {product.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveFromFavorites(product._id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{product.location.city}, {product.location.state}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{product.rating} ({product.reviews})</span>
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

              <div className="text-right">
                <div className="flex items-center space-x-2 mb-1">
                  {priceChange ? (
                    <span className="text-lg font-bold text-green-600">
                      {formatPrice(product.currentPrice)}
                    </span>
                  ) : (
                    <span className="text-lg font-bold text-foreground">
                      {formatPrice(product.currentPrice)}
                    </span>
                  )}
                  {priceChange && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.basePrice)}
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  per {product.unit} • {product.availableQuantity} {product.unit} available
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
                  <Link href={`/dashboard/products/${product.listingId}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </Button>
                {product.priceAlert ? (
                  <Button variant="outline" size="sm" className="text-blue-600">
                    <Bell className="h-4 w-4 mr-2" />
                    Alert Set
                  </Button>
                ) : (
                  <Button variant="outline" size="sm">
                    <Bell className="h-4 w-4 mr-2" />
                    Set Alert
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Grid view - Fixed styling with all buttons contained within the card
  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 h-full flex flex-col">
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
          
          {priceChange && (
            <Badge className="absolute top-2 right-2 bg-green-600 text-white text-xs">
              Price Drop
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
          <div>
            <h3 className="font-semibold text-foreground line-clamp-1">
              {product.cropName}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
            {product.notes && (
              <p className="text-sm text-blue-600 italic line-clamp-1">
                Note: {product.notes}
              </p>
            )}
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

          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              {priceChange ? (
                <span className="text-xl font-bold text-green-600">
                  {formatPrice(product.currentPrice)}
                </span>
              ) : (
                <span className="text-xl font-bold text-foreground">
                  {formatPrice(product.currentPrice)}
                </span>
              )}
              {priceChange && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.basePrice)}
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground mb-3">
              per {product.unit} • {product.availableQuantity} {product.unit} available
            </div>
          </div>

          {/* Action Buttons - All contained within the card */}
          <div className="space-y-2 mt-auto">
            {/* Primary Actions */}
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
                onClick={() => onRemoveFromFavorites(product._id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Secondary Actions */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="flex-1" asChild>
                <Link href={`/dashboard/products/${product.listingId}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </Button>
              {product.priceAlert ? (
                <Button variant="outline" size="sm" className="flex-1 text-blue-600">
                  <Bell className="h-4 w-4 mr-2" />
                  Alert Set
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="flex-1">
                  <Bell className="h-4 w-4 mr-2" />
                  Set Alert
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
