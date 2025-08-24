"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Heart, 
  Search, 
  Filter, 
  ShoppingCart, 
  Eye, 
  Trash2, 
  Package,
  Star,
  MapPin,
  Calendar,
  Loader2,
  AlertCircle,
  HeartOff
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FavoriteProduct {
  _id: string
  product: string
  price: number
  quantity: number
  unit: string
  images: string[]
  farmer: {
    name: string
    location: string
    rating: number
  }
  status: 'available' | 'out_of_stock' | 'harvested'
  createdAt: string
  updatedAt: string
}

export function FavoritesPage() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedFavorites, setSelectedFavorites] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      fetchFavorites()
    }
  }, [user])

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      setError("")
      
      // For now, use mock data since the backend doesn't have favorites endpoint yet
      const mockFavorites: FavoriteProduct[] = [
        {
          _id: "1",
          product: "Fresh Tomatoes",
          price: 15000,
          quantity: 50,
          unit: "kg",
          images: ["/fresh-tomatoes.png"],
          farmer: {
            name: "Adunni Farms",
            location: "Lagos",
            rating: 4.8
          },
          status: "available",
          createdAt: "2025-01-15T10:00:00Z",
          updatedAt: "2025-01-15T10:00:00Z"
        },
        {
          _id: "2",
          product: "Organic Yam",
          price: 8000,
          quantity: 20,
          unit: "kg",
          images: ["/placeholder.svg"],
          farmer: {
            name: "Ibrahim Farms",
            location: "Kano",
            rating: 4.6
          },
          status: "available",
          createdAt: "2025-01-12T10:00:00Z",
          updatedAt: "2025-01-12T10:00:00Z"
        },
        {
          _id: "3",
          product: "Rice Grains",
          price: 12000,
          quantity: 100,
          unit: "kg",
          images: ["/rice-grains-closeup.png"],
          farmer: {
            name: "Kemi Rice Farm",
            location: "Kebbi",
            rating: 4.9
          },
          status: "harvested",
          createdAt: "2025-01-10T10:00:00Z",
          updatedAt: "2025-01-10T10:00:00Z"
        }
      ]
      
      setFavorites(mockFavorites)
    } catch (err) {
      console.error("Failed to fetch favorites:", err)
      setError("Failed to load your favorite products")
      toast.error("Failed to load favorites")
    } finally {
      setLoading(false)
    }
  }

  const removeFromFavorites = async (productId: string) => {
    try {
      // TODO: Implement API call to remove from favorites
      setFavorites(prev => prev.filter(fav => fav._id !== productId))
      toast.success("Removed from favorites")
    } catch (err) {
      console.error("Failed to remove from favorites:", err)
      toast.error("Failed to remove from favorites")
    }
  }

  const addToCart = async (product: FavoriteProduct) => {
    try {
      // TODO: Implement API call to add to cart
      toast.success(`Added ${product.product} to cart`)
    } catch (err) {
      console.error("Failed to add to cart:", err)
      toast.error("Failed to add to cart")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'out_of_stock':
        return 'bg-red-100 text-red-800'
      case 'harvested':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredFavorites = favorites.filter(favorite => {
    const matchesSearch = favorite.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         favorite.farmer.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || favorite.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your favorites...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Failed to load favorites</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchFavorites}>Try Again</Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Favorites</h1>
            <p className="text-muted-foreground">
              {favorites.length} saved product{favorites.length !== 1 ? 's' : ''} • Manage your wishlist
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setSelectedFavorites([])}>
              <HeartOff className="w-4 h-4 mr-2" />
              Clear All
            </Button>
            <Link href="/marketplace">
              <Button>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Browse More
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search favorites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="harvested">Harvested</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Favorites Grid */}
        {filteredFavorites.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchQuery || filterStatus !== "all" ? "No favorites match your criteria" : "No favorites yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterStatus !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Start saving products you love to see them here"
                }
              </p>
              <Link href="/marketplace">
                <Button>
                  <Package className="w-4 h-4 mr-2" />
                  Browse Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((favorite, index) => (
              <motion.div
                key={favorite._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    {/* Product Image */}
                    <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
                      <Image
                        src={favorite.images[0] || "/placeholder.svg"}
                        alt={favorite.product}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className={getStatusColor(favorite.status)}>
                          {favorite.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{favorite.product}</h3>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(favorite.price)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {favorite.quantity} {favorite.unit}
                        </p>
                      </div>

                      {/* Farmer Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {favorite.farmer.location}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">
                            {favorite.farmer.rating}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => addToCart(favorite)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          asChild
                        >
                          <Link href={`/marketplace/${favorite._id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeFromFavorites(favorite._id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
