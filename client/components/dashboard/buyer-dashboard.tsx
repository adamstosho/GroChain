"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { MarketplaceCard, type MarketplaceProduct } from "@/components/agricultural"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { ShoppingCart, Package, Heart, TrendingUp, Search, QrCode, Eye } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function BuyerDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashboardResponse, ordersResponse, listingsResponse] = await Promise.all([
          apiService.getDashboard(),
          apiService.getOrders(),
          apiService.getListings({ limit: 6, featured: true }),
        ])

        setStats(dashboardResponse.data)
        setRecentOrders(ordersResponse.data?.slice(0, 5) || [])
        setFeaturedProducts(listingsResponse.data || [])
      } catch (error: any) {
        toast({
          title: "Error loading dashboard",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

  const quickActions = [
    {
      title: "Browse Products",
      description: "Explore fresh produce",
      icon: Search,
      href: "/dashboard/products",
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Scan QR Code",
      description: "Verify product authenticity",
      icon: QrCode,
      href: "/dashboard/scanner",
      color: "bg-secondary/10 text-secondary",
    },
    {
      title: "View Orders",
      description: "Track your purchases",
      icon: Eye,
      href: "/dashboard/orders",
      color: "bg-accent/10 text-accent",
    },
    {
      title: "My Favorites",
      description: "Saved products",
      icon: Heart,
      href: "/dashboard/favorites",
      color: "bg-success/10 text-success",
    },
  ]

  // Convert product data to our component format
  const convertToMarketplaceProduct = (product: any): MarketplaceProduct => {
    return {
      id: String(product._id || product.id),
      name: product.product?.cropName || "Fresh Produce",
      cropType: product.product?.cropType || "Agricultural Product",
      variety: product.product?.variety || "Standard",
      description: product.description || "Fresh agricultural product from local farmers",
      price: product.price || 0,
      unit: product.unit || "kg",
      quantity: product.quantity || 100,
      availableQuantity: product.availableQuantity || 100,
      quality: product.quality || "good",
      grade: product.qualityGrade || "B",
      organic: product.organic || false,
      harvestDate: new Date(product.harvestDate || Date.now()),
      location: product.location || "Unknown Location",
      farmer: {
        id: product.farmerId || "1",
        name: product.farmerName || "Local Farmer",
        avatar: product.farmerAvatar || "",
        rating: product.farmerRating || 4.5,
        verified: product.farmerVerified || false,
        location: product.location || "Unknown Location"
      },
      images: product.images || ["/placeholder.svg"],
      certifications: product.certifications || ["ISO 22000"],
      shipping: {
        available: product.shippingAvailable || true,
        cost: product.shippingCost || 500,
        estimatedDays: product.shippingDays || 3
      },
      rating: product.rating || 4.5,
      reviewCount: product.reviewCount || 0,
      qrCode: product.qrCode || `PRODUCT_${Date.now()}`,
      tags: product.tags || [product.product?.cropType, "fresh", "local"]
    }
  }

  const handleMarketplaceAction = (action: string, productId: string) => {
    switch (action) {
      case "addToCart":
        console.log("Adding to cart:", productId)
        // Handle add to cart logic
        break
      case "addToWishlist":
        console.log("Adding to wishlist:", productId)
        // Handle add to wishlist logic
        break
      case "view":
        window.location.href = `/dashboard/products/${productId}`
        break
      case "contact":
        console.log("Contacting farmer for:", productId)
        break
      case "share":
        console.log("Sharing product:", productId)
        break
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-8 bg-muted rounded w-3/4" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          description="All time purchases"
          icon={ShoppingCart}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Total Spent"
          value={`₦${(stats?.totalSpent || 0).toLocaleString()}`}
          description="Lifetime spending"
          icon={TrendingUp}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Favorites"
          value={stats?.favorites || 0}
          description="Saved products"
          icon={Heart}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="This Month"
          value={`₦${(stats?.monthlySpent || 0).toLocaleString()}`}
          description="Monthly spending"
          icon={Package}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <QuickActions actions={quickActions} />

          {/* Featured Products */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Featured Products</CardTitle>
                <CardDescription>Fresh, verified produce from local farmers</CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href="/dashboard/products">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {featuredProducts.length > 0 ? (
                  featuredProducts.map((product) => (
                    <MarketplaceCard
                      key={product._id}
                      product={convertToMarketplaceProduct(product)}
                      variant="compact"
                      onAddToCart={(id) => handleMarketplaceAction("addToCart", id)}
                      onAddToWishlist={(id) => handleMarketplaceAction("addToWishlist", id)}
                      onView={(id) => handleMarketplaceAction("view", id)}
                      onContact={(id) => handleMarketplaceAction("contact", id)}
                      onShare={(id) => handleMarketplaceAction("share", id)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No featured products available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your latest purchases</CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href="/dashboard/orders">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <ShoppingCart className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Order #{order._id.slice(-6)}</p>
                          <p className="text-sm text-muted-foreground">
                            ₦{order.totalAmount?.toLocaleString()} • {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            order.status === "delivered"
                              ? "default"
                              : order.status === "pending"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {order.status}
                        </Badge>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/orders/${order._id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No orders yet</p>
                    <Button asChild className="mt-4">
                      <Link href="/dashboard/products">Start Shopping</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <RecentActivity />

          {/* QR Scanner */}
          <Card>
            <CardHeader>
              <CardTitle>QR Code Scanner</CardTitle>
              <CardDescription>Verify product authenticity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="h-32 w-32 mx-auto border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center">
                  <QrCode className="h-12 w-12 text-muted-foreground" />
                </div>
                <Button asChild className="w-full">
                  <Link href="/dashboard/scanner">Open Scanner</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Shopping Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Shopping Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                  <p>Always verify products with QR codes before purchasing</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                  <p>Check harvest dates for freshness</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                  <p>Read farmer reviews and ratings</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                  <p>Compare prices across different farmers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
