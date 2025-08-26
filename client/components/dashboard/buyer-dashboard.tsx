"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { QuickActions } from "@/components/dashboard/quick-actions"
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
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Active Orders"
          value={stats?.activeOrders || 0}
          description="In progress"
          icon={Package}
          trend={{ value: 2, isPositive: true }}
        />
        <StatsCard
          title="Favorites"
          value={stats?.totalFavorites || 0}
          description="Saved products"
          icon={Heart}
          trend={{ value: 3, isPositive: true }}
        />
        <StatsCard
          title="Total Spent"
          value={`₦${(stats?.totalSpent || 0).toLocaleString()}`}
          description="This month"
          icon={TrendingUp}
          trend={{ value: 12, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <QuickActions actions={quickActions} />

          {/* Search Bar */}
          <Card>
            <CardHeader>
              <CardTitle>Find Fresh Produce</CardTitle>
              <CardDescription>Search for verified agricultural products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input placeholder="Search for products, farmers, or locations..." className="flex-1" />
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

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
                    <div key={product._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="aspect-square bg-muted rounded-lg mb-3 relative overflow-hidden">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0] || "/placeholder.svg"}
                            alt={product.product?.cropName || "Product"}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium">{product.product?.cropName || "Fresh Produce"}</h3>
                        <p className="text-sm text-muted-foreground">{product.location}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary">₦{product.price?.toLocaleString()}</span>
                          <Badge variant="secondary">{product.qualityGrade}</Badge>
                        </div>
                        <Button size="sm" className="w-full" asChild>
                          <Link href={`/dashboard/products/${product._id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
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
                  <p>Check farmer ratings and reviews</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                  <p>Look for organic and premium quality grades</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
